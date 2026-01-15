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

  function handleImageFileChange(event) {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setImageFile(selectedFile);
      convertToBase64(selectedFile);
    }
  }

  function convertToBase64(file) {
    setImageLoadingState(true);
    const reader = new FileReader();

    reader.onloadend = () => {
      // Store in localStorage
      const base64String = reader.result;
      setUploadedImageUrl(base64String);
      setImageLoadingState(false);
    };

    reader.onerror = () => {
      setImageLoadingState(false);
      console.error("Error reading file");
    };

    reader.readAsDataURL(file);
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      setImageFile(droppedFile);
      convertToBase64(droppedFile);
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
          className="border-2 border-dashed rounded-xl p-8 transition-colors hover:border-primary/50"
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
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <UploadCloudIcon className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-medium">Upload your photo</p>
              <p className="text-sm text-muted-foreground">
                Drag & drop or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Min 700x1000px for best results
              </p>
            </div>
          </Label>
        </div>
      ) : (
        <div className="space-y-3">
          {imageLoadingState ? (
            <div className="flex items-center justify-center h-32 bg-muted rounded-xl">
              <p className="text-sm text-muted-foreground">Processing...</p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border-2 border-primary/20">
              <img
                src={uploadedImageUrl}
                alt="Uploaded"
                className="w-full h-64 object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
              >
                <XIcon className="w-4 h-4" />
              </Button>
            </div>
          )}
          {imageFile && !imageLoadingState && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileIcon className="w-4 h-4" />
              <span>{imageFile.name}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LocalImageUpload;
