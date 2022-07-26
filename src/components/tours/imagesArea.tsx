import { trpc } from "@/utils/trpc";
import { mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { Card } from "flowbite-react";
import { useEffect, useState } from "react";
import CardTitle from "../common/cardTitle";
import Skeleton from "../common/skeleton";
import UploadImagesModal from "./uploadImagesModal";

const ImagesArea: React.FC<{ tourId: string; canAddImages: boolean }> = ({
  tourId,
  canAddImages,
}) => {
  const [addImages, setAddImages] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const { data: images, isLoading } = trpc.useQuery([
    "images.get-images",
    {
      tourId,
    },
  ]);
  return (
    <>
      <Card>
        <div className="flex justify-start h-full flex-col">
          <div className="flex justify-between items-center">
            <CardTitle title="Images" />
            {canAddImages && (
              <span onClick={() => setAddImages(true)}>
                <Icon path={mdiPlus} className="w-5 h-5 cursor-pointer" />
              </span>
            )}
          </div>
          {isLoading && (
            <div className="grid grid-cols-4 pt-4 gap-2">
              <Skeleton className="w-32 h-32 lg:w-52 lg:h-52" />
            </div>
          )}
          {(images?.length ?? 0) > 0 && (
            <div className="grid grid-cols-4 pt-4 gap-2">
              {images?.map((image) => (
                <img
                  src={image.url}
                  className="w-32 lg:w-52"
                  alt={image.filename}
                  key={image.id}
                />
              ))}
            </div>
          )}
          {images?.length === 0 && (
            <div className="py-4">There are no images yet...</div>
          )}
        </div>
      </Card>
      {mounted && (
        <UploadImagesModal
          show={addImages}
          tourId={tourId}
          onClose={() => setAddImages(false)}
        ></UploadImagesModal>
      )}
    </>
  );
};

export default ImagesArea;
