// src/server/router/context.ts
import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { getCookie } from "cookies-next";
import { prisma } from "../db/client";

export const createContext = async (
  opts?: trpcNext.CreateNextContextOptions
) => {
  const req = opts?.req;
  const res = opts?.res;

  let token = getCookie("next-auth.session-token", { req, res }) as string;
  if (!token) {
    token = getCookie("__Secure-next-auth.session-token", {
      req,
      res,
    }) as string;
  }
  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
  });

  return {
    req,
    res,
    session,
    prisma,
  };
};

type Context = trpc.inferAsyncReturnType<typeof createContext>;

export const createRouter = () => trpc.router<Context>();
