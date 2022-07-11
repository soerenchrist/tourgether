// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { toursRouter } from "./tours";
import { tracksRouter } from "./tracks";
import { inviteRouter } from "./invite";
import { peaksRouter } from "./peaks";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("tours.", toursRouter)
  .merge("tracks.", tracksRouter)
  .merge("invite.", inviteRouter)
  .merge("peaks.", peaksRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
