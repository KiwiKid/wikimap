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
    getInside: publicProcedure
    .input(z.object({ topLeftLat: z.number(), topLeftLng: z.number(), bottomRightLat: z.number(), bottomRightLng: z.number() }))
    .query(({ ctx, input}) => ctx.prisma.place.findMany({
      select: {
        id: true,
        wiki_url: true,
        lat: true,
        lng: true,
        status:true,
        summary: true,
        info:true,
        main_image_url: true,
        wiki_id: true
      },
      where: {
        lat: {
          lt: input.topLeftLat,
          gt: input.bottomRightLat,
        },
        lng: {
          lt: input.bottomRightLng,
          gt: input.topLeftLng
        }
      }
    }))
  })