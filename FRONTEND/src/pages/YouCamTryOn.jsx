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
  Loader2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { grid } from "ldrs";
import { getClothImage } from "@/store/tryon-cloth-slice";
import { getModelImage } from "@/store/tryon-model-slice";

// YOUCAM API CONFIGURATION
const BASE_URL = "https://yce-api-01.makeupar.com/s2s/v2.0";
const API_KEYS = [
  "sk-Su7wCSpg4-mlNjb-D0MxEdzFsofa9TeTKkBnOynjoRK-MGUCcmKVvq2LAkaTQjuo", // Default
  "sk-sNR7lGQSXyq7ul9RTzxkyoTCLp-KkjCfsH2BSz76KyWDxPlJ5TxkMOYB4DoxNfKx", // Backup
  "sk-Mc-jNycb0SdDGsQgrRRBqcpmnMrfClywmq-JBi89ntpiyrZryd0MV1WS4wGyFtov", // Backup
  "sk-xOKsDnSZQLpdW0t3fPjcgkEjkdlDqIndNUH97-27fcHkaL7HhobDDQdqPCINu4UO",
  "sk-dCU3-fr1PdameMaR3kR4pQ6jOfYJAcGXuGx8Ef_1bkLG7Gu1JpdFdjcNlxvsKOv-",
  "sk-38i84cDUwZo-VuO05Vq2rSXIPu6fEHm1j_IYVDHfqHVq13ApihrkniJrkUQblSqB",
  "sk-t7kcuiNGTx8yvcHkdYhQ_kUOqYjTtBqe26Q4e16JPTCw2fec8U21YaWYuekJe6xy",
];
let currentKeyIndex = 0;

async function fetchWithRetry(url, options = {}) {
  const makeRequest = async (key) => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      ...(options.headers || {}),
    };
    return fetch(url, { ...options, headers });
  };

  let response = await makeRequest(API_KEYS[currentKeyIndex]);

  if (
    !response.ok &&
    (response.status === 401 ||
      response.status === 403 ||
      response.status === 429)
  ) {
    console.warn(
      `API Error ${response.status} with key ${currentKeyIndex}. Switching key...`,
    );
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    response = await makeRequest(API_KEYS[currentKeyIndex]);
  }

  return response;
}

const YouCamTryOn = () => {
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [exampleClothImgUrl, setExampleClothImgUrl] = useState(null);
  const [exampleModelImgUrl, setExampleModelImgUrl] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);

  const [isProcessed, setIsProcessed] = useState(false);
  const [garmentCategory, setGarmentCategory] = useState("full_body");
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

  // --- YOUCAM CLIENT-SIDE LOGIC ---

  async function uploadToYouCam(url, type = "cloth") {
    // 1. Fetch the image as Blob
    setStatus(`Downloading image...`);
    const imgRes = await fetch(url);
    if (!imgRes.ok) throw new Error("Failed to download source image");
    const blob = await imgRes.blob();
    const fileSize = blob.size;
    const contentType = blob.type || "image/jpeg";
    const fileName = `upload_${Date.now()}.${contentType.split("/")[1]}`;

    // 2. Init Upload
    const initRes = await fetchWithRetry(`${BASE_URL}/file/${type}`, {
      method: "POST",
      body: JSON.stringify({
        files: [
          {
            content_type: contentType,
            file_name: fileName,
            file_size: fileSize,
          },
        ],
      }),
    });

    if (!initRes.ok) {
      const errText = await initRes.text();
      throw new Error(`YouCam Init Failed: ${errText}`);
    }

    const initData = await initRes.json();
    // Handle array structure
    const fileInfo = initData.data.files
      ? initData.data.files[0]
      : initData.data;
    const fileId = fileInfo.file_id;
    const uploadUrl = fileInfo.requests[0].url;
    const uploadHeaders = fileInfo.requests[0].headers;

    // 3. Upload to S3
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        ...uploadHeaders, // e.g. x-amz-server-side-encryption defined by YouCam
        // 'Content-Length': fileSize // Browser automatically sets Content-Length
      },
      body: blob,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`S3 Upload Failed: ${errText}`);
    }

    return fileId;
  }

  async function handleTryOn() {
    if (!exampleModelImgUrl && !uploadedImageUrl) {
      toast({ title: "Model image required", variant: "destructive" });
      return;
    }
    if (!exampleClothImgUrl && !productDetails.image) {
      toast({ title: "Clothing image required", variant: "destructive" });
      return;
    }

    setLoading(true);
    setStatus("Starting process...");

    try {
      let humanImageUrl = exampleModelImgUrl || uploadedImageUrl;

      // If base64, we need to upload to a public URL or convert to blob directly.
      // Since our uploadToYouCam takes a URL, if it's base64, we can fetch(base64) to get blob.
      // But uploadToYouCam logic `await fetch(url)` works for data: urls too!
      // So no changes needed.

      setStatus("Uploading human image...");
      const srcFileId = await uploadToYouCam(humanImageUrl, "cloth");

      setStatus("Uploading garment image...");
      const garmentUrl = exampleClothImgUrl || productDetails.image;
      const refFileId = await uploadToYouCam(garmentUrl, "cloth");

      setStatus("Starting AI Task...");
      const startRes = await fetchWithRetry(`${BASE_URL}/task/cloth`, {
        method: "POST",
        body: JSON.stringify({
          src_file_id: srcFileId,
          ref_file_id: refFileId,
          garment_category: garmentCategory,
        }),
      });

      const startData = await startRes.json();
      if (!startRes.ok)
        throw new Error(`Task Start Failed: ${JSON.stringify(startData)}`);

      const taskId = startData.data.task_id;
      console.log("Task Started:", taskId);

      // Poll
      setStatus("Processing with AI...");
      let attempts = 0;
      const maxAttempts = 30; // 60 seconds

      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const pollRes = await fetchWithRetry(
            `${BASE_URL}/task/cloth/${taskId}`,
            {
              method: "GET",
            },
          );
          const pollData = await pollRes.json();

          if (pollData.data.task_status === "success") {
            clearInterval(pollInterval);
            setProcessedImageUrl(pollData.data.results.url);
            setIsProcessed(true);
            setLoading(false);
            setStatus("");
            toast({ title: "Success!", description: "Try-On Complete" });
          } else if (pollData.data.task_status === "error") {
            clearInterval(pollInterval);
            throw new Error(pollData.data.error || "Task failed");
          } else {
            console.log(
              `Polling attempt ${attempts}: ${pollData.data.task_status}`,
            );
            if (attempts >= maxAttempts) {
              clearInterval(pollInterval);
              throw new Error("Polling timeout");
            }
          }
        } catch (err) {
          clearInterval(pollInterval);
          handleError(err);
        }
      }, 2000);
    } catch (error) {
      handleError(error);
    }
  }

  function handleError(error) {
    console.error(error);
    setLoading(false);
    setStatus("");
    toast({
      title: "Error",
      description: error.message || "Failed to process",
      variant: "destructive",
    });
  }

  // --- HELPER FUNCTIONS ---
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
      link.download = "youcam-tryon-result.png";
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
            AI Virtual Try-On PRO
          </AlertTitle>
          <AlertDescription className="text-sm text-foreground/80">
            Premium high-fidelity virtual try-on powered by LuxarAI.
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
        <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          Virtual Try-On (PRO)
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
          Upload your photo and see the magic happen instantly.
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

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Garment Type
              </h3>
              <select
                value={garmentCategory}
                onChange={(e) => setGarmentCategory(e.target.value)}
                className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="full_body">Full Body (Dresses, Suits)</option>
                <option value="upper_body">Upper Body (Shirts, Jackets)</option>
                <option value="lower_body">Lower Body (Pants, Jeans)</option>
              </select>
            </div>

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
              Try-On Result (LuxarAi)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <div className="text-center space-y-2">
                  <p className="font-semibold text-lg">
                    {status || "Processing..."}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    LuxarAI is working its magic
                  </p>
                </div>
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
                    Using LuxarAI Premium
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
                  Try On with LuxarAI
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default YouCamTryOn;
