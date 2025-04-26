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

const TryOnPage = () => {
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
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

  useEffect(() => {
    dispatch(fetchProductDetails(id));
  }, [dispatch, id]);

  async function handleTryOn() {
    if (!uploadedImageUrl || !productDetails?.image) {
      toast({
        title: "Please upload both your image and select a clothing item.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
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
            clothing_image_url: productDetails.image,
            avatar_image_url: uploadedImageUrl,
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
      toast({
        title: "Server Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleImageChange() {
    setUploadedImageUrl("");
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
      <div className="flex flex-wrap justify-center w-full min-h-screen gap-4 p-4">
        {/* Garment Image Section */}
        <div className="flex flex-col items-center justify-center border max-w-[350px] w-full min-h-[450px] p-2">
          <h1 className="text-center font-extrabold text-[1.5rem] m-2">
            GARMENT IMAGE
          </h1>
          <img
            src={productDetails?.image}
            alt={productDetails?.title}
            className="w-full h-[400px] object-cover rounded-lg"
          />
          <Button className="mt-3 w-full" onClick={handleChangeCloth}>
            Change Image
          </Button>
        </div>

        {/* User Uploaded Image Section */}
        <div className="flex flex-col items-center justify-center border max-w-[350px] w-full min-h-[450px] p-3">
          {uploadedImageUrl === "" ? (
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
                src={uploadedImageUrl}
                alt="Uploaded"
                className="w-full h-[400px] object-cover rounded-lg"
              />
              <Button className="mt-3 w-full" onClick={handleImageChange}>
                Change Image
              </Button>
            </>
          )}
        </div>

        {/* Try-On Result Section */}
        {loading ? (
          <div className="relative flex flex-col items-center justify-center border max-w-[350px] w-full min-h-[450px] p-3">
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
          <div className="flex flex-col items-center justify-center border max-w-[350px] w-full min-h-[450px] p-3">
            <h1 className="text-center font-extrabold text-[1.5rem] m-2">
              RESULT IMAGE
            </h1>
            <img
              src={processedImageUrl}
              alt={"processedImage"}
              className="w-full h-[400px] object-cover rounded-lg"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border max-w-[350px] w-full min-h-[450px] p-3">
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
