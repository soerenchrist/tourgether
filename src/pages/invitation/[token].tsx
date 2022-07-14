import CardTitle from "@/components/common/cardTitle";
import LayoutBase from "@/components/layout/layoutBase";
import { trpc } from "@/utils/trpc";
import { BanIcon, CheckIcon } from "@heroicons/react/solid";
import { InvitationLink, Tour } from "@prisma/client";
import { Button, Card, Spinner } from "flowbite-react";
import { Session } from "next-auth";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { NextRouter, useRouter } from "next/router";
import { ReactNode, useRef } from "react";

const DeclineButton: React.FC<{ token: string; router: NextRouter }> = ({
  token,
  router,
}) => {
  const { mutate } = trpc.useMutation("invite.decline-invitation", {
    onSuccess: () => {
      router.push("/");
    },
  });

  const handleClick = () => {
    mutate({
      invite_token: token,
    });
  };
  return (
    <Button outline color="dark" onClick={handleClick}>
      <BanIcon className="w-5 h-5 mr-2 text-gray-800" />
      Decline
    </Button>
  );
};

const AcceptButton: React.FC<{ token: string; router: NextRouter }> = ({
  token,
  router,
}) => {
  const { mutate } = trpc.useMutation("invite.accept-invitation", {
    onSuccess: () => {
      router.push("/tours?invation_accepted=true");
    },
  });

  const handleClick = () => {
    mutate({
      invite_token: token,
    });
  };
  return (
    <Button color="success" onClick={handleClick}>
      <CheckIcon className="w-5 h-5 mr-2 text-white" /> Accept
    </Button>
  );
};

const InvitationDisplay: React.FC<{
  invite: InvitationLink & { tour: Tour };
  session: Session;
}> = ({ invite, session }) => {
  const router = useRouter();
  return (
    <Card>
      <CardTitle title="You received an Invitation!"></CardTitle>
      <p className="text-xl">Hello {session.user!.name},</p>
      <p className="text-xl">
        {invite.issuedBy} invited you to join the tour <b>{invite.tour.name}</b>
        !
      </p>
      <p className="text-xl">Do you accept the invitation?</p>

      <div className="flex justify-start gap-4 mt-4">
        <AcceptButton router={router} token={invite.invite_token} />
        <DeclineButton router={router} token={invite.invite_token} />
      </div>
    </Card>
  );
};

const InvitationPageContent: React.FC<{ token: string; session: Session }> = ({
  token,
  session,
}) => {
  const enabled = useRef(true);
  const { data, error, isError, isLoading } = trpc.useQuery(
    ["invite.get-invitation", { invite_token: token }],
    {
      onError: () => {
        enabled.current = false;
      },
      retry: false,
      enabled: enabled.current,
    }
  );

  if (isError) return <InvalidInvitation error={error!.message} />;

  return (
    <>
      {isLoading || !data ? (
        <Spinner size="xl" aria-label="page is loading" />
      ) : (
        <InvitationDisplay invite={data} session={session} />
      )}
    </>
  );
};

const InvalidInvitation: React.FC<{ error: string }> = ({ error }) => {
  return (
    <Card>
      <CardTitle title="So sad..." />
      <h1 className="text-xl">{error}</h1>
      <Link href="/tours">
        <span className="text-blue-500 font-medium hover:underline cursor-pointer">Back to your Tours</span>
      </Link>
    </Card>
  );
};

const Unauthorized = () => {
  return <Card>
    <CardTitle title="You are not logged in"></CardTitle>
    <p>Please sign in or create an account to accept this invitation.</p>
    <Button onClick={() => signIn()}>Sign in</Button>
  </Card>
}

const InvitationPage = () => {
  const { data: session, status } = useSession();
  const { query } = useRouter();
  const { token } = query;

  let content: ReactNode;
  if (status === "loading") content = <Spinner size="xl" />;
  else if (status === "unauthenticated") content = <Unauthorized />
  else if (!token || typeof token !== "string") {
    content = (
      <InvalidInvitation error="This invitation link is not valid. Please request a new one." />
    );
  } else {
    content = <InvitationPageContent token={token} session={session!} />;
  }

  return <LayoutBase>{content}</LayoutBase>;
};

export default InvitationPage;
