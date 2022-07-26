import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { Session } from "next-auth";
import { getServerSession } from "./getServerSession";
import { prisma } from "../db/client";

export type PageProps = {
  data: {
    session: Session;
  };
};

export const protectedServersideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
) => {
  const session = await getServerSession(ctx);
  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
      props: {},
    };
  }

  return {
    props: {
      data: { session },
    },
  };
};

export const redirectToFeedProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
) => {
  const session = await getServerSession(ctx);
  if (session) {
    return {
      redirect: {
        destination: "/feed",
        permanent: false,
      },
      props: {},
    };
  }

  return {
    props: {},
  };
};

export const redirectOnboardedProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
) => {
  const session = await getServerSession(ctx);
  if (!session || !session.user?.id) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
      props: {},
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user?.id,
    },
  });
  if (!user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
      props: {},
    };
  }

  if (user.hasOnboarded) {
    return {
      redirect: {
        destination: "/feed",
        permanent: false,
      },
      props: {},
    };
  }

  return {
    props: {
      data: { session },
    },
  };
};
