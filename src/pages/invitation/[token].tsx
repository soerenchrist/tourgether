import Button from "@/components/common/button";
import Spinner from "@/components/common/spinner";
import LayoutBase from "@/components/layout/layoutBase";
import { trpc } from "@/utils/trpc";
import { InvitationLink, Tour } from "@prisma/client";
import { NextRouter, useRouter } from "next/router";
import { useRef } from "react";



const DeclineButton: React.FC<{ token: string, router: NextRouter }> = ({ token, router }) => {
  const { mutate } = trpc.useMutation("invite.decline-invitation", {
    onSuccess: () => {
      router.push("/");
    }
  });

  const handleClick = () => {
    mutate({
      invite_token: token
    })
  }
  return (
    <Button onClick={handleClick}>Decline</Button>
  );
}


const AcceptButton: React.FC<{ token: string, router: NextRouter }> = ({ token, router }) => {
  const { mutate } = trpc.useMutation("invite.accept-invitation", {
    onSuccess: () => {
      router.push("/?invation_accepted=true");
    }
  });

  const handleClick = () => {
    mutate({
      invite_token: token
    })
  }
  return (
    <Button onClick={handleClick}>Accept</Button>
  );
}

const InvitationDisplay: React.FC<{ invite: (InvitationLink & { tour: Tour; }) }> = ({ invite }) => {
  const router = useRouter();
  return (
    <div>
      <p className="text-xl">You have been invited to share the tour {invite.tour.name} by user {invite.issuedBy}.</p>
      <AcceptButton router={router} token={invite.invite_token} />
      <DeclineButton router={router} token={invite.invite_token} />
    </div>
  )
}

const InvitationPageContent: React.FC<{ token: string }> = ({ token }) => {
  const enabled = useRef(true);
  const { data, error, isError, isLoading } = trpc.useQuery(["invite.get-invitation", { invite_token: token }], {
    onError: () => {
      enabled.current = false
    },
    retry: false,
    enabled: enabled.current
  })

  const errorMessage = <div>{error?.message}</div>

  return <LayoutBase>
    {isLoading ? <Spinner /> : (
      (isError || !data) ? errorMessage : (
        <InvitationDisplay invite={data} />
      )
    )}
  </LayoutBase>
}


const InvalidInvitation = () => {
  return <LayoutBase>
    <h1 className="text-3xl">Invalid invitation</h1>
  </LayoutBase>;
}

const InvitationPage = () => {
  const { query } = useRouter();
  const { token } = query;

  if (!token || typeof token !== "string") {
    return <InvalidInvitation />;
  }

  return <InvitationPageContent token={token} />;
};

export default InvitationPage;