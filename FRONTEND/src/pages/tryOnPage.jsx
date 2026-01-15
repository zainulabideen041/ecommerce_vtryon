import LocalImageUpload from "@/components/shopping-view/local-image-upload";
import { fetchProductDetails } from "@/store/shop/products-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Sparkles,
  X,
  Upload,
  Image as ImageIcon,
  Zap,
  Download,
  RefreshCw,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { grid } from "ldrs";
import { getClothImage } from "@/store/tryon-cloth-slice";
import { getModelImage } from "@/store/tryon-model-slice";

const TryOnPage = () => {
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [exampleClothImgUrl, setExampleClothImgUrl] = useState(null);
  const [exampleModelImgUrl, setExampleModelImgUrl] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
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
        title: "Model image required",
        description: "Please upload your image or select an example model.",
        variant: "destructive",
      });
      return;
    }

    if (!exampleClothImgUrl && !productDetails.image) {
      toast({
        title: "Clothing image required",
        description: "Please select a clothing item.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
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
        title: "Try-On Complete!",
        description: "Your virtual try-on is ready to view.",
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

  function handleDownload() {
    if (processedImageUrl) {
      const link = document.createElement("a");
      link.href = processedImageUrl;
      link.download = "virtual-tryon-result.png";
      link.click();
    }
  }

  function handleReset() {
    setExampleClothImgUrl(null);
    setExampleModelImgUrl(null);
    setUploadedImageUrl("");
    setProcessedImageUrl(null);
    setIsProcessed(false);
    setImageFile(null);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Alert */}
      {visible && (
        <Alert className="relative mb-8 border-2 border-primary/20 bg-primary/5">
          <Sparkles className="h-5 w-5 text-primary" />
          <AlertTitle className="text-lg font-semibold">
            AI Virtual Try-On
          </AlertTitle>
          <AlertDescription className="text-sm">
            Processing takes 10-15 seconds. Your processed image is not stored
            in our database for privacy.
          </AlertDescription>
          <button
            className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setVisible(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </Alert>
      )}

      {/* Header */}
      <div className="text-center mb-12 space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-display font-bold tracking-tight">
          Virtual Try-On
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          See how this outfit looks on you with our AI-powered virtual try-on
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Clothing Section */}
        <Card className="border-2">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ImageIcon className="w-5 h-5 text-primary" />
              Clothing Item
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Example Clothes */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Example Clothes
              </h3>
              <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                {clothImageList && clothImageList.length > 0 ? (
                  clothImageList.map((clothImgItem, index) => (
                    <div
                      key={index}
                      onClick={() => setExampleClothImgUrl(clothImgItem.image)}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                        exampleClothImgUrl === clothImgItem.image
                          ? "border-primary shadow-lg"
                          : "border-transparent hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={clothImgItem.image}
                        className="w-full h-20 object-cover"
                        alt="Example cloth"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground col-span-3">
                    No examples available
                  </p>
                )}
              </div>
            </div>

            {/* Selected Cloth */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Selected Clothing
              </h3>
              <div className="relative rounded-xl overflow-hidden border-2 border-primary/20 bg-muted/30">
                <img
                  src={exampleClothImgUrl || productDetails?.image}
                  alt={productDetails?.title || "Clothing"}
                  className="w-full h-64 object-cover"
                />
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleChangeCloth}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Change Clothing
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Model Section */}
        <Card className="border-2">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="w-5 h-5 text-primary" />
              Your Image
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Example Models */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Example Models
              </h3>
              <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                {modelImageList && modelImageList.length > 0 ? (
                  modelImageList.map((modelImgItem, index) => (
                    <div
                      key={index}
                      onClick={() => setExampleModelImgUrl(modelImgItem.image)}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                        exampleModelImgUrl === modelImgItem.image
                          ? "border-primary shadow-lg"
                          : "border-transparent hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={modelImgItem.image}
                        className="w-full h-20 object-cover"
                        alt="Example model"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground col-span-3">
                    No examples available
                  </p>
                )}
              </div>
            </div>

            {/* Upload or Selected Model */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Your Image
              </h3>
              {!exampleModelImgUrl && !uploadedImageUrl ? (
                <LocalImageUpload
                  title={"Upload Your Photo"}
                  imageFile={imageFile}
                  setImageFile={setImageFile}
                  uploadedImageUrl={uploadedImageUrl}
                  setUploadedImageUrl={setUploadedImageUrl}
                  setImageLoadingState={setImageLoadingState}
                  imageLoadingState={imageLoadingState}
                />
              ) : (
                <>
                  <div className="relative rounded-xl overflow-hidden border-2 border-primary/20 bg-muted/30">
                    <img
                      src={exampleModelImgUrl || uploadedImageUrl}
                      alt="Your image"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleImageChange}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Change Image
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Result Section */}
        <Card className="border-2">
          <CardHeader className="border-b bg-gradient-primary text-white">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5" />
              Try-On Result
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
                <l-grid size="60" speed="1.2" color="hsl(262 83% 58%)"></l-grid>
                <div className="text-center space-y-2">
                  <p className="font-semibold">Processing...</p>
                  <p className="text-sm text-muted-foreground">
                    This may take 10-15 seconds
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLoading(false);
                    setProcessedImageUrl(null);
                    setIsProcessed(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : isProcessed && processedImageUrl ? (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border-2 border-primary shadow-lg">
                  <img
                    src={processedImageUrl}
                    alt="Try-on result"
                    className="w-full h-[450px] object-cover"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={handleDownload} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[500px] space-y-6 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-primary/10 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Ready to Try On?</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Select a clothing item and upload your photo to see how it
                    looks on you
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={handleTryOn}
                  className="group"
                  disabled={
                    (!exampleModelImgUrl && !uploadedImageUrl) ||
                    (!exampleClothImgUrl && !productDetails?.image)
                  }
                >
                  <Zap className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Try On Now!
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2">
          <CardContent className="p-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">Upload Your Photo</h3>
            <p className="text-sm text-muted-foreground">
              Minimum 700x1000 pixels for best results
            </p>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardContent className="p-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">AI Processing</h3>
            <p className="text-sm text-muted-foreground">
              Advanced AI creates realistic try-on results
            </p>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardContent className="p-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
              <Download className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">Download Result</h3>
            <p className="text-sm text-muted-foreground">
              Save your virtual try-on for future reference
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TryOnPage;
