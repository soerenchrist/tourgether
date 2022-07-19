import { trpc } from "@/utils/trpc";
import { DownloadIcon } from "@heroicons/react/solid";
import { Tour } from "@prisma/client";
import { Spinner, Tooltip } from "flowbite-react";
import { useState } from "react";

const DownloadGpxButton: React.FC<{ tour: Tour }> = ({ tour }) => {
  const [requested, setRequested] = useState(false);
  const [isLoading, setLoading] = useState(false);
  if (!tour.gpxUrl) return null;

  const downloadURI = (uri: string, name: string) => {
    fetch(uri)
      .then(res => res.blob())
      .then(data => {
        const a = document.createElement("a");
        a.href = window.URL.createObjectURL(data)
        a.download = name;
        a.click();
      })
  }

  trpc.useQuery(
    [
      "tours.get-download-url",
      {
        gpxUrl: tour.gpxUrl,
      },
    ],
    {
      retry: false,
      refetchOnWindowFocus: false,
      enabled: requested,
      onSuccess: (url) => {
        const name = `${tour.name.replace(" ", "_")}.gpx`;
        downloadURI(url, name);
        setRequested(false);
        setLoading(false);
      }
    }
  );  

  const handleClick = () => {
    setRequested(true);
    setLoading(true);
  }

  if (isLoading) return <Spinner></Spinner>

  return (
    <Tooltip content="Download GPX file">
      <DownloadIcon onClick={handleClick} className="w-7 h-7 cursor-pointer"></DownloadIcon>
    </Tooltip>
  );
};

export default DownloadGpxButton;
