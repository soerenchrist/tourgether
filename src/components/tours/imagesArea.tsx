import { mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { Card } from "flowbite-react";
import { useState } from "react";
import CardTitle from "../common/cardTitle";
import UploadImagesModal from "./uploadImagesModal";

const ImagesArea: React.FC<{ tourId: string }> = ({ tourId }) => {
  const [addImages, setAddImages] = useState(false);

  return (
    <>
      <Card>
        <div className="flex justify-between items-center">
          <CardTitle title="Images" />

          <span onClick={() => setAddImages(true)}>
            <Icon path={mdiPlus} className="w-5 h-5 cursor-pointer" />
          </span>
        </div>
      </Card>
      <UploadImagesModal
        show={addImages}
        tourId={tourId}
        onClose={() => setAddImages(false)}
      ></UploadImagesModal>
    </>
  );
};

export default ImagesArea;
