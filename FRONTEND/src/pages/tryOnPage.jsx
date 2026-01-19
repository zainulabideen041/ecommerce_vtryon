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
      let avatarImageUrl = exampleModelImgUrl || uploadedImageUrl;

      // If uploaded image is base64, upload to backend/Cloudinary first
      if (uploadedImageUrl && uploadedImageUrl.startsWith("data:")) {
        toast({
          title: "Uploading image...",
          description: "Please wait while we process your image.",
        });

        // Convert base64 to blob
        const base64Response = await fetch(uploadedImageUrl);
        const blob = await base64Response.blob();

        // Create FormData and upload to backend
        const formData = new FormData();
        formData.append("my_file", blob, "user-image.jpg");

        const uploadResponse = await fetch(
          "https://ecomtryonbackend.vercel.app/api/admin/products/upload-image",
          {
            method: "POST",
            body: formData,
          },
        );

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }

        const uploadData = await uploadResponse.json();

        if (!uploadData.success) {
          throw new Error("Failed to upload image to server");
        }

        avatarImageUrl = uploadData.result.url;
      }

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
            avatar_image_url: avatarImageUrl,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("RapidAPI Error:", errorData);
        throw new Error(errorData.detail || "Try-on API request failed");
      }

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

      toast({
        title: "Try-On Failed",
        description: error.message || "Something went wrong. Please try again.",
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
        <Alert className="relative mb-8 border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 shadow-lg">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <AlertTitle className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">
            AI Virtual Try-On
          </AlertTitle>
          <AlertDescription className="text-sm text-foreground/80">
            Processing takes 10-15 seconds. Your processed image is not stored
            in our database for privacy.
          </AlertDescription>
          <button
            className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
            onClick={() => setVisible(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </Alert>
      )}

      {/* Header */}
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-primary mb-4 shadow-glow">
          <Sparkles className="w-10 h-10 text-white animate-pulse" />
        </div>
        <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          Virtual Try-On
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
          See how this outfit looks on you with our AI-powered virtual try-on
          technology
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Clothing Section */}
        <Card className="border-2 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-accent/5">
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
              <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto hide-scrollbar">
                {clothImageList && clothImageList.length > 0 ? (
                  clothImageList.map((clothImgItem, index) => (
                    <div
                      key={index}
                      onClick={() => setExampleClothImgUrl(clothImgItem.image)}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                        exampleClothImgUrl === clothImgItem.image
                          ? "border-primary shadow-lg ring-2 ring-primary/20"
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
              <div className="relative rounded-xl overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-muted/20 to-muted/40 shadow-lg">
                <img
                  src={exampleClothImgUrl || productDetails?.image}
                  alt={productDetails?.title || "Clothing"}
                  className="w-full h-80 object-contain p-4"
                />
              </div>
              <Button
                variant="outline"
                className="w-full hover:border-primary hover:text-primary transition-all"
                onClick={handleChangeCloth}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Change Clothing
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Model Section */}
        <Card className="border-2 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-accent/5">
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
              <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto hide-scrollbar">
                {modelImageList && modelImageList.length > 0 ? (
                  modelImageList.map((modelImgItem, index) => (
                    <div
                      key={index}
                      onClick={() => setExampleModelImgUrl(modelImgItem.image)}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                        exampleModelImgUrl === modelImgItem.image
                          ? "border-primary shadow-lg ring-2 ring-primary/20"
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
                  <div className="relative rounded-xl overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-muted/20 to-muted/40 shadow-lg">
                    <img
                      src={exampleModelImgUrl || uploadedImageUrl}
                      alt="Your image"
                      className="w-full h-80 object-contain p-4"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full hover:border-primary hover:text-primary transition-all"
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
        <Card className="border-2 hover:border-primary/50 transition-all duration-300 shadow-xl">
          <CardHeader className="border-b bg-gradient-primary text-white shadow-lg">
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
                <div className="relative rounded-xl overflow-hidden border-2 border-primary shadow-2xl bg-gradient-to-br from-muted/10 to-muted/30">
                  <img
                    src={processedImageUrl}
                    alt="Try-on result"
                    className="w-full h-[500px] object-contain p-4"
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
                  className="group shadow-lg hover:shadow-xl transition-all"
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
              Auto-resized to 700x1000px minimum
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
