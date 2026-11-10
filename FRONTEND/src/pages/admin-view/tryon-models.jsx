import TryonLibrary from "@/components/admin-view/tryon-library";
import {
  addModelImage,
  getModelImage,
  deleteModelImage,
} from "@/store/tryon-model-slice";
export default function TryonModel() {
  return (
    <TryonLibrary
      kind="model"
      stateKey="tryonModel"
      listKey="modelImageList"
      fetchImages={getModelImage}
      addImage={addModelImage}
      deleteImage={deleteModelImage}
    />
  );
}
