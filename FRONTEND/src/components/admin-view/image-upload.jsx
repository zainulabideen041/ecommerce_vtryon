import { useEffect, useId, useRef, useState } from "react";
import { UploadCloud, X, Check, RefreshCw } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config";
export default function ProductImageUpload({
  title = "Choose your photograph",
  imageFile,
  setImageFile,
  imageLoadingState,
  uploadedImageUrl,
  setUploadedImageUrl,
  setImageLoadingState,
  isEditMode = false,
}) {
  const id = useId();
  const input = useRef(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!imageFile) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);
  useEffect(() => {
    if (!imageFile || isEditMode) return;
    let active = true;
    const controller = new AbortController();
    setImageLoadingState(true);
    setUploadedImageUrl("");
    setError("");
    const data = new FormData();
    data.append("my_file", imageFile);
    axios
      .post(`${API_BASE_URL}/admin/products/upload-image`, data, {
        signal: controller.signal,
      })
      .then((response) => {
        if (!active) return;
        if (!response.data?.success) throw new Error("upload-failed");
        const url = response.data.result.secure_url || response.data.result.url;
        setUploadedImageUrl(
          url?.replace(
            "http://res.cloudinary.com/",
            "https://res.cloudinary.com/",
          ),
        );
      })
      .catch((reason) => {
        if (active && !axios.isCancel(reason))
          setError("The photograph couldn't be uploaded. Please try again.");
      })
      .finally(() => {
        if (active) setImageLoadingState(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [
    imageFile,
    attempt,
    isEditMode,
    setUploadedImageUrl,
    setImageLoadingState,
  ]);
  function choose(file) {
    if (isEditMode || !file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setError("");
    setImageFile(file);
  }
  function remove() {
    setImageFile(null);
    setUploadedImageUrl("");
    setImageLoadingState(false);
    setError("");
    if (input.current) input.current.value = "";
  }
  return (
    <div className="admin-photo-upload">
      <label htmlFor={id}>{title}</label>
      <div
        className={`admin-upload-zone ${dragging ? "is-dragging" : ""} ${isEditMode ? "is-readonly" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!isEditMode) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          choose(event.dataTransfer.files?.[0]);
        }}
      >
        <input
          ref={input}
          id={id}
          className="admin-file-input"
          type="file"
          accept="image/*"
          disabled={isEditMode || imageLoadingState}
          onChange={(event) => choose(event.target.files?.[0])}
        />
        {preview || (isEditMode && uploadedImageUrl) ? (
          <div className="admin-upload-preview">
            <img
              src={preview || uploadedImageUrl}
              alt={
                isEditMode
                  ? "Current product photograph"
                  : "Selected upload preview"
              }
            />
            <div>
              <strong>{imageFile?.name || "Current product image"}</strong>
              <span role="status">
                {imageLoadingState
                  ? "Uploading your photograph..."
                  : isEditMode
                    ? "Image changes are disabled in this editor."
                    : error
                      ? "Upload needs attention"
                      : uploadedImageUrl
                        ? "Uploaded and ready"
                        : "Select a photograph"}
              </span>
            </div>
            {!isEditMode && (
              <button
                type="button"
                onClick={remove}
                aria-label="Remove selected photograph"
              >
                <X size={17} />
              </button>
            )}
            {!imageLoadingState && uploadedImageUrl && !error && (
              <Check size={17} className="admin-upload-ready" />
            )}
          </div>
        ) : (
          <label htmlFor={id} className="admin-upload-invitation">
            <span>
              <UploadCloud size={30} strokeWidth={1} />
            </span>
            <strong>Bring the photograph in.</strong>
            <span>Drop an image here, or choose a file</span>
            <small>Image files from your device</small>
          </label>
        )}
      </div>
      {error && (
        <div className="admin-upload-error" role="alert">
          <span>{error}</span>
          {imageFile && (
            <button
              type="button"
              onClick={() => setAttempt((value) => value + 1)}
            >
              Retry upload <RefreshCw size={13} />
            </button>
          )}
        </div>
      )}
      {imageLoadingState && (
        <div className="admin-upload-progress" role="status">
          <span />
          Uploading photograph
        </div>
      )}
    </div>
  );
}
