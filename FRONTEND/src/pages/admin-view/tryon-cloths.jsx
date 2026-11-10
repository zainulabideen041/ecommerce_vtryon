import TryonLibrary from "@/components/admin-view/tryon-library";
import {
  addClothImage,
  getClothImage,
  deleteClothImage,
} from "@/store/tryon-cloth-slice";
export default function TryonCloths() {
  return (
    <TryonLibrary
      kind="garment"
      stateKey="tryonCloth"
      listKey="clothImageList"
      fetchImages={getClothImage}
      addImage={addClothImage}
      deleteImage={deleteClothImage}
    />
  );
}
