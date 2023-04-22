import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { defaultPlaceSelect } from "./placetype";

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
    getAll: publicProcedure
      .input(z.object({ page: z.number().min(0), length: z.number().min(0).max(50) }))
      .query(({ ctx }) => ctx.prisma.place.findMany({
          take: 1000,
          select: defaultPlaceSelect
        })),
    /*createTypeForPlace: publicProcedure
        .input(z.object({ placeId: z.string() }))
        .mutation(({ ctx, input }) => {ctx.prisma.place.findFirstOrThrow({
          select: {
            wiki_id: true
          },
          where: {
            id: input.placeId
          }
        })).then((res) => {

        }),*/
  })