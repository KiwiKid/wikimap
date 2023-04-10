import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";


export const placeRouter = createTRPCRouter({
    /*search: publicProcedure
      .input(z.object({ lat: z.number(), lng: z.number() }))
      .query(({ input, ctx }) => {
        return ctx.prisma.place.findMany({
            orderBy: {
              distance: {
                  asc: true,
                  point: {
                    lat: input.lat,
                    lng: input.lng
                  }
              }
            }
        })
      }),*/
      getAll: publicProcedure.query(({ ctx }) => ctx.prisma.place.findMany({
          take: 1000,
          select: {
            id: true,
            generatedTitle: true,
            lat: true,
            lng: true
          }
        }))
      });
  