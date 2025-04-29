import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import { addModelImage, getModelImage } from "@/store/tryon-model-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function TryonModel() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const dispatch = useDispatch();
  const { modelImageList } = useSelector((state) => state.tryonModel);

  function handleUploadFeatureImage() {
    dispatch(addModelImage(uploadedImageUrl)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getModelImage());
        setImageFile(null);
        setUploadedImageUrl("");
      }
    });
  }

  useEffect(() => {
    dispatch(getModelImage());
  }, [dispatch]);

  return (
    <div>
      <ProductImageUpload
        imageFile={imageFile}
        setImageFile={setImageFile}
        uploadedImageUrl={uploadedImageUrl}
        setUploadedImageUrl={setUploadedImageUrl}
        setImageLoadingState={setImageLoadingState}
        imageLoadingState={imageLoadingState}
        isCustomStyling={true}
        // isEditMode={currentEditedId !== null}
      />
      <Button
        disabled={!imageFile}
        onClick={handleUploadFeatureImage}
        className="mt-5 w-full"
      >
        Upload
      </Button>
      <div className="flex flex-row flex-wrap gap-4 mt-5">
        {modelImageList && modelImageList.length > 0
          ? modelImageList.map((modelImgItem, index) => (
              <div className="relative" key={index}>
                <img
                  src={modelImgItem.image}
                  className="h-[300px] object-cover rounded-t-lg"
                />
              </div>
            ))
          : null}
      </div>
    </div>
  );
}

export default TryonModel;
