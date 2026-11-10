import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ImagePlus, ArrowUpRight, Trash2, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AdminPageHeader,
  AdminState,
  AdminLoading,
  AdminConfirm,
} from "./studio-ui";
import ProductImageUpload from "./image-upload";
import StudioPhoto from "./studio-photo";
import { useToast } from "@/components/ui/use-toast";
import { useAdminReveal } from "@/hooks/use-admin-reveal";

export default function TryonLibrary({
  kind,
  stateKey,
  listKey,
  fetchImages,
  addImage,
  deleteImage,
}) {
  const garment = kind === "garment";
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [preview, setPreview] = useState(null);
  const [query, setQuery] = useState("");
  const [refresh, setRefresh] = useState(0);
  const root = useRef(null);
  const images = useSelector((state) => state[stateKey]?.[listKey]) || [];
  const dispatch = useDispatch();
  const { toast } = useToast();
  useAdminReveal(root, `${loading}-${images.length}-${query}`);
  useEffect(() => {
    let active = true;
    setLoading(true);
    dispatch(fetchImages()).then((result) => {
      if (active) {
        setError(!result.payload?.success);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [dispatch, fetchImages, refresh]);
  async function publish() {
    if (saving || imageLoadingState || !uploadedImageUrl) return;
    setSaving(true);
    const result = await dispatch(addImage(uploadedImageUrl));
    setSaving(false);
    if (result.payload?.success) {
      setImageFile(null);
      setUploadedImageUrl("");
      setRefresh((value) => value + 1);
      toast({
        title: `${garment ? "Garment" : "Model"} added to the fitting-room library`,
      });
    } else
      toast({
        title: "The image couldn't be added. Please try again.",
        variant: "destructive",
      });
  }
  async function remove() {
    if (!removeTarget || deleting) return;
    setDeleting(true);
    const result = await dispatch(deleteImage(removeTarget._id));
    setDeleting(false);
    if (result.payload?.success) {
      setRemoveTarget(null);
      setRefresh((value) => value + 1);
      toast({ title: "Image removed from the library" });
    } else
      toast({
        title: "The image couldn't be removed. Please try again.",
        variant: "destructive",
      });
  }
  const filtered = images
    .map((item, index) => ({ ...item, number: index + 1 }))
    .filter((item) =>
      `${kind} ${item.number} ${item._id}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    );
  return (
    <div ref={root}>
      <AdminPageHeader
        index={garment ? "04" : "05"}
        eyebrow="THE VIRTUAL FITTING ROOM"
        title={garment ? "The garment" : "The model"}
        accent="library."
        description={
          garment
            ? "Curate the sample pieces customers explore in their virtual fitting room."
            : "Choose the sample portraits that help customers explore a new look."
        }
      />
      <div className="admin-library-layout">
        <aside className="admin-library-upload admin-panel" data-admin-reveal>
          <p className="admin-eyebrow">A NEW PERSPECTIVE</p>
          <h2>{garment ? "Add the piece." : "Set the scene."}</h2>
          <p>
            {garment
              ? "A clear garment photograph gives your fitting room a stronger starting point."
              : "A clear model photograph helps customers explore the fitting-room experience."}
          </p>
          <fieldset disabled={saving}>
            <ProductImageUpload
              title={garment ? "Garment photograph" : "Model photograph"}
              imageFile={imageFile}
              setImageFile={setImageFile}
              uploadedImageUrl={uploadedImageUrl}
              setUploadedImageUrl={setUploadedImageUrl}
              imageLoadingState={imageLoadingState}
              setImageLoadingState={setImageLoadingState}
            />
            <button
              className="admin-button"
              disabled={
                !imageFile || !uploadedImageUrl || imageLoadingState || saving
              }
              onClick={publish}
            >
              <ImagePlus size={16} />
              {saving ? "Adding to library..." : "Add to library"}
            </button>
          </fieldset>
          <p className="admin-upload-footnote">
            Choosing a file uploads the image to storage. Add it to publish it
            in this library.
          </p>
          <div className="admin-library-stamp" aria-hidden="true">
            <span>&#10035;</span>
            <span>
              THE LUXAR
              <br />
              FITTING ROOM
            </span>
          </div>
        </aside>
        <section className="admin-library-collection">
          <div className="admin-library-heading">
            <div>
              <p className="admin-eyebrow">THE CURRENT EDIT</p>
              <h2>{garment ? "Ready to wear." : "A point of view."}</h2>
            </div>
            <span>
              {loading
                ? "Loading..."
                : error
                  ? "Unavailable"
                  : `${images.length} images`}
            </span>
          </div>
          <label className="admin-search">
            <Search size={16} />
            <span className="sr-only">Search the {kind} library</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Find a ${kind} by number or ID`}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear library search"
              >
                <X size={15} />
              </button>
            )}
          </label>
          {loading ? (
            <AdminLoading count={3} />
          ) : error ? (
            <AdminState
              error
              title="The library couldn't be opened."
              description="Reconnect to view your fitting-room images."
              onRetry={() => setRefresh((value) => value + 1)}
            />
          ) : filtered.length ? (
            <div className="admin-asset-grid">
              {filtered.map((item) => (
                <article
                  className="admin-asset-card"
                  key={item._id}
                  data-admin-reveal
                >
                  <button
                    className="admin-asset-preview"
                    onClick={() => setPreview(item)}
                    aria-label={`Inspect ${kind} ${item.number}`}
                  >
                    <StudioPhoto
                      src={item.image}
                      alt={`${garment ? "Garment" : "Model"} library photograph ${item.number}`}
                    />
                    <span>
                      <ArrowUpRight size={18} />
                    </span>
                  </button>
                  <div>
                    <span>
                      <small>
                        FITTING ROOM / {String(item.number).padStart(2, "0")}
                      </small>
                      <strong>
                        {garment ? "Garment" : "Model"}{" "}
                        {String(item.number).padStart(2, "0")}
                      </strong>
                    </span>
                    <button
                      className="admin-icon-button"
                      aria-label={`Remove ${kind} ${item.number}`}
                      onClick={() => setRemoveTarget(item)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <AdminState
              title={
                query
                  ? "No images in this view."
                  : "A fresh perspective starts here."
              }
              description={
                query
                  ? "Try another number or ID."
                  : `Add your first ${kind} photograph to build the library.`
              }
              action={
                query && (
                  <button
                    className="admin-button secondary"
                    onClick={() => setQuery("")}
                  >
                    Clear search
                  </button>
                )
              }
            />
          )}
        </section>
      </div>
      <AdminConfirm
        open={!!removeTarget}
        onOpenChange={(value) => {
          if (!value) setRemoveTarget(null);
        }}
        title={`Remove this ${kind} image?`}
        description="This removes the selected photograph from the fitting-room sample library."
        pending={deleting}
        onConfirm={remove}
      />
      <Dialog
        open={!!preview}
        onOpenChange={(value) => {
          if (!value) setPreview(null);
        }}
      >
        <DialogContent className="admin-image-dialog">
          <DialogTitle>
            {garment ? "Garment" : "Model"}{" "}
            {String(preview?.number || 0).padStart(2, "0")}
          </DialogTitle>
          <DialogDescription>
            Original fitting-room library photograph.
          </DialogDescription>
          {preview && (
            <img src={preview.image} alt={`${kind} ${preview.number}`} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
