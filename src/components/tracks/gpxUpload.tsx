import { Alert } from "flowbite-react";
import { ChangeEventHandler, useState } from "react";
import FileInput from "../common/fileInput";

export type AnalysisResult = {
  distance: number;
  name: string;
  elevationDown: number;
  elevationUp: number;
  date: Date;
  end: string;
  start: string;
  points: any[];
};

const GPXUpload: React.FC<{ onChange: (result: AnalysisResult) => void }> = ({
  onChange,
}) => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const onAnalyzeSuccess = (result: any) => {
    setLoading(false);
    onChange(result.data);
  };

  const onAnalyzeError = (err: any) => {
    setLoading(false);
    setError(err as string);
  };

  const handleTracksChanged: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { files } = event.target;
    if (!files) return;

    if (files.length !== 1) return;

    setLoading(true);
    const file = files[0];
    const reader = new FileReader();
    reader.onload = async () => {
      const content = reader.result as string;
      /*const result = analyze(content);
      if (result)
        onChange(result);*/
    };
    reader.readAsText(file!);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="p-2"></div>
      {error && <Alert color="failure">{error}</Alert>}
      <FileInput
        files={[]}
        accept=".gpx"
        isLoading={isLoading}
        onChange={handleTracksChanged}
        label="Upload your GPX tracks or drag and drop"
      />
    </div>
  );
};


export default GPXUpload;
