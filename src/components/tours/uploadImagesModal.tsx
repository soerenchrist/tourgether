import { trpc } from "@/utils/trpc";
import { Button, Modal } from "flowbite-react";
import { ChangeEventHandler, useRef, useState } from "react";
import FileInput from "../common/fileInput";

const UploadImagesModal: React.FC<{
  tourId: string;
  show: boolean;
  onClose: () => void;
}> = ({ tourId, show, onClose }) => {
  const presignedUrls = useRef(new Map<string, string>());
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setLoading] = useState(false);
  const { mutate: createUrl } = trpc.useMutation("images.create-upload-url", {
    onSuccess: (data) => {
      presignedUrls.current.set(data.originalFilename, data.url);
    },
  });
  const { mutate: registerImage } = trpc.useMutation("images.save-image", {
    onSuccess() {
      setLoading(false);
    },
  });

  const upload = () => {
    setLoading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;
      const fileReader = new FileReader();

      fileReader.onloadend = async (e) => {
        const data: ArrayBuffer = fileReader.result as ArrayBuffer;
        const blob = new Blob([data]);
        const url = presignedUrls.current.get(file.name);
        if (!url) return;

        await fetch(url, {
          method: "PUT",
          body: blob,
        });
        registerImage({
          filename: file.name,
          tourId,
          url,
        });
      };
      fileReader.readAsArrayBuffer(file);
    }
    onClose();
  };

  const handleFilesChanged: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { files } = event.target;
    if (!files) return;
    presignedUrls.current.clear();
    const results: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;
      results.push(file);
      createUrl({
        filename: file.name,
        tourId,
      });
    }
    setFiles(results);
  };

  return (
    <Modal show={show} onClose={onClose}>
      <Modal.Header>Upload images</Modal.Header>
      <Modal.Body>
        <FileInput
          multiple
          files={files}
          label="Drop images here or click to upload"
          isLoading={false}
          accept=".jpg,.png"
          onChange={handleFilesChanged}
        />
      </Modal.Body>
      <Modal.Footer>
        <div className="flex justify-end">
          <Button disabled={isLoading} onClick={upload}>
            Upload images
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default UploadImagesModal;
