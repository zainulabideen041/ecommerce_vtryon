import test from "node:test";
import assert from "node:assert/strict";
import { collectAdminOrderPages } from "../src/lib/admin-order-pages.js";

test("overview and filters receive every page of the order book", async () => {
  const calls = [];
  const result = await collectAdminOrderPages(async (page) => {
    calls.push(page);
    return {
      success: true,
      data: [{ _id: `order-${page}` }],
      pagination: { totalPages: 3 },
    };
  });
  assert.deepEqual(calls, [1, 2, 3]);
  assert.equal(result.data.length, 3);
});
test("the backend's first-page 404 represents an empty history", async () => {
  const result = await collectAdminOrderPages(async () => {
    throw { response: { status: 404 } };
  });
  assert.deepEqual(result, { success: true, data: [] });
});
test("server failures and later-page failures remain errors", async () => {
  await assert.rejects(
    collectAdminOrderPages(async () => {
      throw new Error("offline");
    }),
    /offline/,
  );
  await assert.rejects(
    collectAdminOrderPages(async (page) => {
      if (page === 2) throw new Error("page unavailable");
      return {
        success: true,
        data: [{ _id: "first" }],
        pagination: { totalPages: 2 },
      };
    }),
    /page unavailable/,
  );
});
