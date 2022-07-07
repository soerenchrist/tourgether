import { trpc } from "@/utils/trpc";
import { Tour } from "@prisma/client";
import { useState } from "react";
import Button from "../common/button";
import Input from "../common/input";

type Props = {
    tour: Tour
}

const CreateInvitationButton: React.FC<Props> = ({ tour }) => {
    const [url, setUrl] = useState<string | undefined>();

    const { mutate } = trpc.useMutation("invite.create-invitation-link", {
        onSuccess: (data) => {
            console.log(data);
            setUrl(data.url);
        },
        onError: (error) => {
            console.log(error);
        }
    });

    const handleClick = () => {
        mutate({ tourId: tour.id });
    };
    return (
        <div>
            <Button onClick={handleClick}>Share with your friends!</Button>
            {url && <Input disabled={true} id="url-input" value={url} />}
        </div>
    )
};

export default CreateInvitationButton;