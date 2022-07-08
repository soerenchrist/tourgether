import { trpc } from "@/utils/trpc";
import { Tour } from "@prisma/client";
import { Button } from "flowbite-react";
import { useState } from "react";

type Props = {
  tour: Tour;
};

const CopyInputField: React.FC<{ url: string }> = ({ url }) => {
  return (
    <div className="flex items-stretch mt-2">
      <div className="relative w-full">
        <div className="absolute text-gray-500 flex items-center px-2 border-r h-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="icon icon-tabler icon-tabler-link"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" />
            <path d="M10 14a3.5 3.5 0 0 0 5 0l4 -4a3.5 3.5 0 0 0 -5 -5l-.5 .5" />
            <path d="M14 10a3.5 3.5 0 0 0 -5 0l-4 4a3.5 3.5 0 0 0 5 5l.5 -.5" />
          </svg>
        </div>
        <input
          id="link"
          disabled
          value={url}
          className="pr-24 text-gray-600 bg-gray-100 focus:outline-none focus:border focus:border-indigo-700 font-normal w-full h-10 flex items-center pl-12 text-sm border-gray-300 rounded border"
        />
        <button 
          onClick={() => navigator.clipboard.writeText(url)}
          className="focus:ring-2 focus:ring-offset-2 rounded-md focus:ring-indigo-600 absolute right-0 top-0 transition duration-150 ease-in-out hover:bg-indigo-600 focus:outline-none bg-indigo-700 rounded-r text-white px-5 h-10 text-sm">
          Copy
        </button>
      </div>
    </div>
  );
};

const CreateInvitationButton: React.FC<Props> = ({ tour }) => {
  const [url, setUrl] = useState<string | undefined>();

  const { mutate } = trpc.useMutation("invite.create-invitation-link", {
    onSuccess: (data) => {
      console.log(data);
      setUrl(data.url);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const handleClick = () => {
    mutate({ tourId: tour.id });
  };
  return (
    <div className="pt-2">
      <Button onClick={handleClick}>Share with your friends!</Button>
      {url && <CopyInputField url={url} />}
    </div>
  );
};

export default CreateInvitationButton;
