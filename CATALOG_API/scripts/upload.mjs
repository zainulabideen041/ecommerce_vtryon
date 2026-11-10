import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(
  new URL("../../.catalog-export/luxar-demo-catalog/", import.meta.url),
);
const wrangler = fileURLToPath(
  new URL("../node_modules/wrangler/bin/wrangler.js", import.meta.url),
);
const remote = process.argv.includes("--remote");
const local = process.argv.includes("--local");
if (remote && local) throw new Error("Choose either --remote or --local.");
const plan = JSON.parse(
  await readFile(path.join(root, "upload-plan.json"), "utf8"),
);
if (
  plan.bucket !== "luxar-demo-catalog" ||
  !/^[a-f0-9]{16}$/.test(plan.version)
)
  throw new Error("Unexpected bucket or snapshot version in upload-plan.json.");
const allowed = new Set([
  "manifest.json",
  ...[
    "meta.json",
    "index.json",
    "pages.json",
    "pages.bin",
    "summaries.bin",
    "products.bin",
    "thumbnails.bin",
  ].map((name) => `snapshots/${plan.version}/${name}`),
]);
if (
  plan.files.length !== allowed.size ||
  new Set(plan.files.map((file) => file.key)).size !== allowed.size
)
  throw new Error(
    "Upload plan must contain exactly the eight expected objects.",
  );
const files = [];
for (const item of plan.files) {
  if (!allowed.has(item.key))
    throw new Error("Upload plan contains an unexpected object key.");
  const filename = path.resolve(root, ...item.key.split("/"));
  if (!filename.startsWith(path.resolve(root) + path.sep))
    throw new Error("Upload file is outside the export directory.");
  const bytes = await readFile(filename);
  if (
    bytes.length !== item.bytes ||
    createHash("sha256").update(bytes).digest("hex") !== item.sha256
  )
    throw new Error(`Export checksum failed: ${item.key}`);
  files.push({ ...item, filename });
}
console.log(
  `Verified ${files.length} objects / ${(files.reduce((sum, file) => sum + file.bytes, 0) / 1024 ** 2).toFixed(1)} MiB for ${plan.bucket}.`,
);
for (const file of files)
  console.log(`${file.key} (${(file.bytes / 1024).toFixed(1)} KiB)`);
if (!remote && !local) {
  console.log("Dry run only. No objects were uploaded.");
  console.log(
    "Use npm run upload -- --remote after npx wrangler login, or --local to populate Wrangler's local R2 simulator.",
  );
  process.exit(0);
}
async function put(file) {
  console.log(`Uploading ${file.key} to ${remote ? "R2" : "local R2"}...`);
  await new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        wrangler,
        "r2",
        "object",
        "put",
        `${plan.bucket}/${file.key}`,
        "--file",
        file.filename,
        "--content-type",
        file.contentType,
        remote ? "--remote" : "--local",
      ],
      {
        cwd: fileURLToPath(new URL("../", import.meta.url)),
        stdio: "inherit",
        windowsHide: true,
      },
    );
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0
        ? resolve()
        : reject(
            new Error(
              `Wrangler upload failed (${code}). manifest.json has not been published.`,
            ),
          ),
    );
  });
}
// Sequential uploads keep memory bounded for the large prebuilt page pack.
// Publish the active manifest only after every immutable snapshot object exists.
for (const file of files.filter((item) => item.key !== "manifest.json"))
  await put(file);
await put(files.find((file) => file.key === "manifest.json"));
console.log(
  `Published snapshot ${plan.version} to ${remote ? "R2" : "local R2"}. No objects were deleted.`,
);
