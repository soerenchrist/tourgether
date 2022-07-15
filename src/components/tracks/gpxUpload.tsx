import { AnalysisResult, parseGpx } from "@/lib/gpxLib";
import { Alert } from "flowbite-react";
import { ChangeEventHandler, useState } from "react";
import FileInput from "../common/fileInput";

const GPXUpload: React.FC<{ onChange: (result: AnalysisResult) => void }> = ({
  onChange,
}) => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [file, setFile] = useState<File>();

  const handleTracksChanged: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { files } = event.target;
    if (!files) return;

    if (files.length !== 1) return;

    setLoading(true);
    const file = files[0];
    setFile(file);
    const reader = new FileReader();
    reader.onload = async () => {
      const content = reader.result as string;
      try {
        const result = parseGpx(content);
        onChange(result);
      } catch(e: any) {
        setError(e.message)
      }
      setLoading(false);
      setMessage("GPX file successfully uploaded");
      setTimeout(() => setMessage(undefined), 2000);
    };
    reader.readAsText(file!);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="p-2"></div>
      {error && <Alert color="failure">{error}</Alert>}
      {message && <Alert color="success">{message}</Alert>}
      <FileInput
        files={file ? [file] : []}
        accept=".gpx"
        isLoading={isLoading}
        onChange={handleTracksChanged}
        label="Upload your GPX tracks or drag and drop"
      />
    </div>
  );
};


export default GPXUpload;
