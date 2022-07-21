import { trpc } from "@/utils/trpc";
import { DownloadIcon } from "@heroicons/react/solid";
import { Tour } from "@prisma/client";
import { Spinner, Tooltip } from "flowbite-react";
import { useState } from "react";

const DownloadGpxButton: React.FC<{ tour: Tour; downloadUrl?: string }> = ({
  tour,
  downloadUrl,
}) => {
  const [isLoading, setLoading] = useState(false);
  if (!tour.gpxUrl) return null;

  const downloadURI = (uri: string, name: string) => {
    fetch(uri)
      .then((res) => res.blob())
      .then((data) => {
        const a = document.createElement("a");
        a.href = window.URL.createObjectURL(data);
        a.download = name;
        a.click();
      });
  };
  if (!downloadUrl) return <></>;
  const handleClick = async () => {
    
    setLoading(true);

    const name = `${tour.name.replace(" ", "_")}.gpx`;
    downloadURI(downloadUrl, name);
    setLoading(false);
  };

  if (isLoading) return <Spinner></Spinner>;

  return (
    <Tooltip content="Download GPX file">
      <DownloadIcon
        onClick={handleClick}
        className="w-7 h-7 cursor-pointer"
      ></DownloadIcon>
    </Tooltip>
  );
};

export default DownloadGpxButton;
