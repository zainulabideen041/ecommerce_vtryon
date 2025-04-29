import ProductImageUpload from "@/components/admin-view/image-upload";
import { fetchProductDetails } from "@/store/shop/products-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Terminal, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { grid } from "ldrs";
import { getClothImage } from "@/store/tryon-cloth-slice";
import { getModelImage } from "@/store/tryon-model-slice";

const TryOnPage = () => {
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [exampleClothImgUrl, setExampleClothImgUrl] = useState(null);
  const [exampleModelImgUrl, setExampleModelImgUrl] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [isProcessed, setIsProcessed] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();

  grid.register();

  const { productDetails } = useSelector((state) => state.shopProducts);

  const { clothImageList } = useSelector((state) => state.tryonCloth);
  const { modelImageList } = useSelector((state) => state.tryonModel);

  useEffect(() => {
    dispatch(fetchProductDetails(id));
    dispatch(getClothImage());
    dispatch(getModelImage());
  }, [dispatch, id]);

  async function handleTryOn() {
    if (!exampleModelImgUrl && !uploadedImageUrl) {
      toast({
        title: "Please upload your image or select an example model image.",
        variant: "destructive",
      });
      return;
    }

    if (!exampleClothImgUrl && !productDetails.image) {
      toast({
        title: "Please select a clothing item or use an example cloth image.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Load the uploaded image and check its dimensions
      const uploadedImg = new Image();
      uploadedImg.src = exampleModelImgUrl || uploadedImageUrl;

      await new Promise((resolve, reject) => {
        uploadedImg.onload = () => {
          if (uploadedImg.width < 700 || uploadedImg.height < 1000) {
            reject(new Error("Uploaded image too small"));
          } else {
            resolve();
          }
        };
        uploadedImg.onerror = () =>
          reject(new Error("Failed to load uploaded image"));
      });

      // Proceed to send to API
      const response = await fetch(
        "https://try-on-diffusion.p.rapidapi.com/try-on-url",
        {
          method: "POST",
          headers: {
            "x-rapidapi-key":
              "a45c88d3c3msh1de50fb4f30855ep103abdjsnfc850e3332d8",
            "x-rapidapi-host": "try-on-diffusion.p.rapidapi.com",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            clothing_image_url: exampleClothImgUrl || productDetails.image,
            avatar_image_url: exampleModelImgUrl || uploadedImageUrl,
          }),
        }
      );

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      setProcessedImageUrl(imageUrl);
      setIsProcessed(true);

      toast({
        title: "Try-On Completed!",
        description: "Your new outfit is ready!",
      });
    } catch (error) {
      console.error(error);
      let description = "Something went wrong. Please try again.";
      if (error.message === "Uploaded image too small") {
        description =
          "Your image is too small. It must be at least 700x1000 pixels.";
      } else if (error.message === "Failed to load uploaded image") {
        description = "Failed to load your uploaded image.";
      }

      toast({
        title: "Try-On Failed",
        description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleImageChange() {
    setUploadedImageUrl("");
    setProcessedImageUrl(null);
    setExampleModelImgUrl(null);
    setIsProcessed(false);
    setImageFile(null);
  }

  function handleChangeCloth() {
    navigate("/shop/listing");
  }

  return (
    <>
      {visible && (
        <Alert className="relative">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Caution!</AlertTitle>
          <AlertDescription>
            You can only try upper wears and the garments same like your
            uploaded image garments. Kindly make sure that the garments you are
            going to try on your body should be upper wears.
          </AlertDescription>
          <button
            className="absolute top-5 right-2 p-1 text-gray-500 hover:text-gray-700"
            onClick={() => setVisible(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </Alert>
      )}
      <div className="flex flex-row flex-wrap justify-center w-full min-h-[90vh] gap-5 p-4">
        {/* Garment Image Section */}
        <div className="flex flex-row h-[60vh]">
          <div className="flex flex-row flex-wrap gap-3 border w-[250px] justify-center overflow-x-scroll hide-scrollbar">
            <h2 className="sticky top-0 bg-white z-10 text-center font-bold text-[1.5rem] m-2">
              Example Cloths
            </h2>
            {clothImageList && clothImageList.length > 0 ? (
              clothImageList.map((clothImgItem, index) => (
                <div className="relative" key={index}>
                  <img
                    src={clothImgItem.image}
                    className="h-[80px] object-cover rounded-t-lg cursor-pointer"
                    onClick={() => setExampleClothImgUrl(clothImgItem.image)}
                  />
                </div>
              ))
            ) : (
              <h2>No Example Cloth Items</h2>
            )}
          </div>
          <div className="flex flex-col border ">
            <h1 className="text-center font-extrabold text-[1.5rem] m-2">
              CLOTH IMAGE
            </h1>
            <img
              src={exampleClothImgUrl || productDetails?.image}
              alt={productDetails?.title || "Clothing image"}
              className="w-full h-[400px] object-cover rounded-lg"
            />
            <Button className="mt-3 w-full" onClick={handleChangeCloth}>
              Change Image
            </Button>
          </div>
        </div>

        {/* User Uploaded Image Section */}
        <div className="flex flex-row h-[60vh]">
          <div className="flex flex-row flex-wrap gap-3 border w-[250px] justify-center overflow-x-scroll hide-scrollbar">
            <h2 className="sticky top-0 bg-white z-10 text-center font-bold text-[1.5rem] m-2">
              Example Models
            </h2>
            {modelImageList && modelImageList.length > 0 ? (
              modelImageList.map((modelImgItem, index) => (
                <div className="relative" key={index}>
                  <img
                    src={modelImgItem.image}
                    className="h-[80px] object-cover rounded-t-lg cursor-pointer"
                    onClick={() => setExampleModelImgUrl(modelImgItem.image)}
                  />
                </div>
              ))
            ) : (
              <h2>No Example Cloth Items</h2>
            )}
          </div>
          <div className="flex flex-col border">
            {!exampleModelImgUrl ? (
              <ProductImageUpload
                title={"YOUR IMAGE"}
                imageFile={imageFile}
                setImageFile={setImageFile}
                uploadedImageUrl={uploadedImageUrl}
                setUploadedImageUrl={setUploadedImageUrl}
                setImageLoadingState={setImageLoadingState}
                imageLoadingState={imageLoadingState}
              />
            ) : (
              <>
                <h1 className="text-center font-extrabold text-[1.5rem] m-2">
                  YOUR IMAGE
                </h1>
                <img
                  src={exampleModelImgUrl || uploadedImageUrl}
                  alt="Uploaded"
                  className="w-full h-[400px] object-cover rounded-lg"
                />
                <Button
                  className="mt-3 w-full"
                  onClick={() => handleImageChange}
                >
                  Change Image
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Try-On Result Section */}
        {loading ? (
          <div className="relative flex flex-col items-center justify-center border h-[60vh]">
            <h1 className="text-center font-extrabold text-[1.5rem] m-2">
              RESULT IMAGE
            </h1>
            <div className="absolute top-[20%] right-5">
              <X
                className="h-6 w-6 cursor-pointer"
                title="cancel"
                onClick={() => {
                  setLoading(false);
                  setProcessedImageUrl(null);
                  setIsProcessed(false);
                }}
              />
            </div>
            <div className="flex items-center justify-center h-[70%]">
              <l-grid size="60" speed="1.2" color="black"></l-grid>
            </div>
          </div>
        ) : isProcessed && processedImageUrl ? (
          <div className="flex flex-col ml-9 border h-[60vh]">
            <h1 className="text-center font-extrabold text-[1.5rem] m-2">
              RESULT IMAGE
            </h1>
            <img
              src={processedImageUrl}
              alt={"processedImage"}
              className="w-full h-[450px] object-cover rounded-lg"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border min-w-[300px] h-[60vh]">
            <Button className="w-full" onClick={handleTryOn}>
              TRY ON NOW!
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default TryOnPage;
