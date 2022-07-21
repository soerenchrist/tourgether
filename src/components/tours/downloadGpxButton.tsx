import { trpc } from "@/utils/trpc";
import { mdiDownload } from "@mdi/js";
import Icon from "@mdi/react";
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
      <span onClick={handleClick}>
        <Icon path={mdiDownload} className="w-5 h-5 cursor-pointer"></Icon>
      </span>
    </Tooltip>
  );
};

export default DownloadGpxButton;
