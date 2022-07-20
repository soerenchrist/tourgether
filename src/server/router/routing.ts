import { TRPCError } from "@trpc/server";
import { string, z } from "zod";
import { createRouter } from "./context";

const routingEndpoint = process.env.BROUTER_ENDPOINT;
const profile = "Hiking-Alpine-SAC6";

export type Coord = [number, number, number];

export type FeatureGeometry = {
  type: "LineString";
  coordinates: Coord[];
};

export type FeatureProperties = {
  creator: string;
  name: string;
  "track-length": string;
  "filtered ascend": string;
  "plain-ascend": string;
  "total-time": string;
  "total-energy": string;
  cost: string;
  messages: string[][];
};

type Feature = {
  type: "Feature";
  properties: FeatureProperties;
  times: number[];
  geometry: FeatureGeometry;
};

type RoutingResult = {
  type: "FeatureCollection";
  features: Feature[];
};

export const routingRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    const userId = ctx.session?.userId;
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx: { ...ctx, userId } });
  })
  .query("check-route", {
    input: z.object({
      start: z.object({
        lon: z.number(),
        lat: z.number(),
      }),
      end: z.object({
        lon: z.number(),
        lat: z.number(),
      }),
    }),
    async resolve({ input }) {
      // ?lonlats=10.870885848999023,46.79471246843784|10.860328674316406,46.78824837870084&profile=Hiking-Alpine-SAC6&alternativeidx=0&format=geojson
      const lonLat = `lonlats=${input.start.lon},${input.start.lat}|${input.end.lon},${input.end.lat}`;
      const queryString = `?${lonLat}&profile=${profile}&alternativeidx=0&format=geojson`;

      const response = await fetch(routingEndpoint + queryString);
      if (response.status != 200) throw new TRPCError({code: "NOT_FOUND", message: "Could not find a route for this location"})
      const result = await response.json();
      return result as RoutingResult;
    },
  });
