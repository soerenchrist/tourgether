import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";

const getDominance = (claims: any) => {
  const dominanceClaim = claims["P2659"];
  if (!dominanceClaim) return null;
  if (dominanceClaim.length === 0) return null;
  const first = dominanceClaim[0];
  const snak = first.mainsnak;
  if (!snak) return null;
  const datavalue = snak.datavalue;
  if (!datavalue) return null;
  const value = datavalue.value;
  if (!value) return null;
  const amount = value.amount;
  if (!amount) return null;
  const dominance = parseFloat(amount);
  if (isNaN(dominance)) return null;
  return dominance;
};

const getImage = (claims: any) => {
  
  const imageClaim = claims["P18"];
  if (!imageClaim) return null;
  if (imageClaim.length === 0) return null;
  const first = imageClaim[0];
  const snak = first.mainsnak;
  if (!snak) return null;
  const datavalue = snak.datavalue;
  if (!datavalue) return null;
  const value = datavalue.value as string;
  if (!value) return null;

  const replaced = value.replace(" ", "_");

  return `https://commons.wikimedia.org/w/thumb.php?width=300&f=${replaced}`;
}

export const wikidataRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    const userId = ctx.session?.userId;
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx: { ...ctx, userId } });
  })
  .query("get-wikidata", {
    input: z.object({
      wikidataId: z.string(),
    }),
    async resolve({ input }) {
      if (!input.wikidataId) throw new TRPCError({ code: "NOT_FOUND" });
      const result = await fetch(
        `http://www.wikidata.org/entity/${input.wikidataId}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );
      const data = await result.json();
      const entities = data.entities;

      const entity = entities[input.wikidataId];
      if (!entity) throw new TRPCError({ code: "NOT_FOUND" });
      const description = entity.descriptions["en"];

      const claims = entity.claims;
      const dominance = getDominance(claims);
      const image = getImage(claims);
      console.log(image);
      return {
        description: description["value"],
        dominance,
        image
      }
    },
  });
