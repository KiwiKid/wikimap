import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const utilsRouter = createTRPCRouter({
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
    resetAll: publicProcedure
        .input(z.object({ secretDeleteCode: z.string()}))
        .mutation(({ ctx, input}) => {
            if(input.secretDeleteCode !== process.env.SECRET_DELETE_CODE){
                throw new Error("Not this time buddy")
            }

            const res = Promise.all([
                ctx.prisma.place.deleteMany(),
                ctx.prisma.placeType.deleteMany(),
                ctx.prisma.latLngToProcess.deleteMany()
            ])

            return res;
        })
  })