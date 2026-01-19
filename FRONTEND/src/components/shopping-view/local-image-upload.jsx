import {
  FileIcon,
  UploadCloudIcon,
  XIcon,
  Image as ImageIcon,
} from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useRef } from "react";
import { Button } from "../ui/button";

function LocalImageUpload({
  title,
  imageFile,
  setImageFile,
  uploadedImageUrl,
  setUploadedImageUrl,
  imageLoadingState,
  setImageLoadingState,
}) {
  const inputRef = useRef(null);

  // Function to resize image to meet minimum requirements
  function resizeImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          let width = img.width;
          let height = img.height;

          // Check if image needs resizing
          const minWidth = 700;
          const minHeight = 1000;

          if (width < minWidth || height < minHeight) {
            // Calculate scale to meet minimum requirements
            const scaleX = minWidth / width;
            const scaleY = minHeight / height;
            const scale = Math.max(scaleX, scaleY);

            width = Math.floor(width * scale);
            height = Math.floor(height * scale);
          }

          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;

          // Draw image on canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Convert canvas to base64
          const resizedBase64 = canvas.toDataURL("image/jpeg", 0.9);
          resolve(resizedBase64);
        };

        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target.result;
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  async function handleImageFileChange(event) {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setImageFile(selectedFile);
      await convertToBase64(selectedFile);
    }
  }

  async function convertToBase64(file) {
    setImageLoadingState(true);

    try {
      const resizedBase64 = await resizeImage(file);
      setUploadedImageUrl(resizedBase64);
      setImageLoadingState(false);
    } catch (error) {
      setImageLoadingState(false);
      console.error("Error processing image:", error);
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  async function handleDrop(event) {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      setImageFile(droppedFile);
      await convertToBase64(droppedFile);
    }
  }

  function handleRemoveImage() {
    setImageFile(null);
    setUploadedImageUrl("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="w-full space-y-3">
      {!uploadedImageUrl ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed rounded-xl p-8 transition-all hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
        >
          <Input
            id="image-upload-local"
            type="file"
            accept="image/*"
            className="hidden"
            ref={inputRef}
            onChange={handleImageFileChange}
          />
          <Label
            htmlFor="image-upload-local"
            className="flex flex-col items-center justify-center cursor-pointer space-y-3"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <UploadCloudIcon className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-base">Upload your photo</p>
              <p className="text-sm text-muted-foreground">
                Drag & drop or click to browse
              </p>
              <p className="text-xs text-primary font-medium">
                Auto-resized to 700x1000px minimum
              </p>
            </div>
          </Label>
        </div>
      ) : (
        <div className="space-y-3">
          {imageLoadingState ? (
            <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-xl border-2 border-dashed">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground mt-4">
                Processing image...
              </p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border-2 border-primary/30 shadow-lg group">
              <img
                src={uploadedImageUrl}
                alt="Uploaded"
                className="w-full h-64 object-contain bg-muted/20"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                onClick={handleRemoveImage}
              >
                <XIcon className="w-4 h-4" />
              </Button>
            </div>
          )}
          {imageFile && !imageLoadingState && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
              <FileIcon className="w-4 h-4" />
              <span className="truncate">{imageFile.name}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LocalImageUpload;
