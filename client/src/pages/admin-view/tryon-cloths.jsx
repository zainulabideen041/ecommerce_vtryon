import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import { addClothImage, getClothImage } from "@/store/tryon-cloth-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function TryonCloths() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const dispatch = useDispatch();
  const { clothImageList } = useSelector((state) => state.tryonCloth);

  function handleUploadFeatureImage() {
    dispatch(addClothImage(uploadedImageUrl)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getClothImage());
        setImageFile(null);
        setUploadedImageUrl("");
      }
    });
  }

  useEffect(() => {
    dispatch(getClothImage());
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
        {clothImageList && clothImageList.length > 0
          ? clothImageList.map((clothImgItem, index) => (
              <div className="relative" key={index}>
                <img
                  src={clothImgItem.image}
                  className="h-[300px] object-cover rounded-t-lg"
                />
              </div>
            ))
          : null}
      </div>
    </div>
  );
}

export default TryonCloths;
