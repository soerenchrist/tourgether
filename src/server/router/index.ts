import { imagesRouter } from './images';
import { commentsRouter } from './comments';
import { likesRouter } from "./likes";
// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { toursRouter } from "./tours";
import { friendsRouter } from "./friends";
import { peaksRouter } from "./peaks";
import { wishlistRouter } from "./wishlist";
import { wikidataRouter } from './wikidata';
import { profileRouter } from './profile';
import { routingRouter } from './routing';
import { feedRouter } from './feed';

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("tours.", toursRouter)
  .merge("friends.", friendsRouter)
  .merge("peaks.", peaksRouter)
  .merge("wishlist.", wishlistRouter)
  .merge("likes.", likesRouter)
  .merge("comments.", commentsRouter)
  .merge("images.", imagesRouter)
  .merge("wikidata.", wikidataRouter)
  .merge("profile.", profileRouter)
  .merge("routing.", routingRouter)
  .merge("feed.", feedRouter)

// export type definition of API
export type AppRouter = typeof appRouter;
