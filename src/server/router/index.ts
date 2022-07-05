// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { authRouter } from "./auth";
import { toursRouter } from "./tours";
import { tracksRouter } from "./tracks";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("auth.", authRouter)
  .merge("tours.", toursRouter)
  .merge("tracks.", tracksRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
