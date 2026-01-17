import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  addClothImage,
  getClothImage,
  deleteClothImage,
} from "@/store/tryon-cloth-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Shirt, Upload, ImagePlus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

function TryonCloths() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const dispatch = useDispatch();
  const { clothImageList } = useSelector((state) => state.tryonCloth);
  const { toast } = useToast();

  function handleUploadFeatureImage() {
    dispatch(addClothImage(uploadedImageUrl)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getClothImage());
        setImageFile(null);
        setUploadedImageUrl("");
        toast({
          title: "Cloth image uploaded successfully!",
        });
      }
    });
  }

  function handleDeleteImage(id) {
    if (window.confirm("Are you sure you want to delete this cloth image?")) {
      dispatch(deleteClothImage(id)).then((data) => {
        if (data?.payload?.success) {
          dispatch(getClothImage());
          toast({
            title: "Cloth image deleted successfully!",
          });
        }
      });
    }
  }

  useEffect(() => {
    dispatch(getClothImage());
  }, [dispatch]);

  return (
    <div className="space-y-8 fade-in">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
            <Shirt className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
              Try-On Cloths
            </h1>
            <p className="text-muted-foreground text-lg">
              Upload clothing images for virtual try-on feature
            </p>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="border-2 border-primary/20 shadow-lg">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-white">
                Upload Cloth Image
              </h2>
              <p className="text-white/80 text-sm">
                Add new clothing items to the try-on collection
              </p>
            </div>
          </div>
        </div>
        <CardContent className="p-6 space-y-4">
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isCustomStyling={true}
          />
          <Button
            disabled={!imageFile}
            onClick={handleUploadFeatureImage}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all h-12 text-base"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Cloth Image
          </Button>
        </CardContent>
      </Card>

      {/* Images Grid */}
      <div className="space-y-4">
        <h3 className="text-2xl font-display font-bold">Uploaded Cloths</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {clothImageList && clothImageList.length > 0 ? (
            clothImageList.map((clothImgItem, index) => (
              <Card
                key={index}
                className="group overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-xl relative"
              >
                <img
                  src={clothImgItem.image}
                  className="w-full h-[280px] object-cover group-hover:scale-110 transition-transform duration-500"
                  alt={`Cloth ${index + 1}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                  <p className="text-white font-semibold">Cloth #{index + 1}</p>
                  <Button
                    onClick={() => handleDeleteImage(clothImgItem._id)}
                    variant="destructive"
                    size="sm"
                    className="shadow-lg"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <ImagePlus className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">
                No cloth images uploaded yet
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Upload your first cloth image to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TryonCloths;
