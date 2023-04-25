import { z } from "zod";
import WikiJS from 'wikijs'

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {  RADIUS } from "~/pages/debug/init-latlng";
import mapWikiPage, { type MappedPage } from "~/utils/mapWikiPage";
import { prisma } from "~/server/db";
import { type PrismaClientValidationError } from "@prisma/client/runtime";

interface WikiSearchResult {
  lat: number,
  lng: number,
  pageNames: string[]
}
export const latLngRouter = createTRPCRouter({
  getPageNames: publicProcedure
    .input(z.object({ lat: z.number(), lng: z.number() }))
    .mutation(async ({ input }) => {
        return await WikiJS().geoSearch(input.lat, input.lng, RADIUS)
          .then((res: string[]) => {
              if(res?.length == 0){
                return {
                  pageNames: [],
                  lat: input.lat,
                  lng: input.lng
                } as WikiSearchResult;
              } else {
                console.log(`Found ${res.length} matches`)
                return {
                  pageNames: res as unknown as string[],
                  lat: input.lat,
                  lng: input.lng
                } as WikiSearchResult;
              }
          })
        }),
  /*  getSummary: publicProcedure
      .query(({ ctx}) => ctx.prisma.latLngToProcess.count({
        select: {
          id: true,
          status: true,
          lat: true,
          lng: true,
        },
    })),
    getAll: publicProcedure
    .input(z.object({ page: z.number().default(0), length: z.number().default(50)}))
    .query(({ ctx, input }) => ctx.prisma.latLngToProcess.findMany({
      take: input.length,
      skip: (input.length * Math.min(input.page, 1)),
      select: {
        id: true,
        status: true,
        lat: true,
        lng: true
      },
    })),
    getInside: publicProcedure
    .input(z.object({ topLeftLat: z.number(), topLeftLng: z.number(), bottomRightLat: z.number(), bottomRightLng: z.number() }))
    .query(({ ctx, input}) => ctx.prisma.latLngToProcess.findMany({
      select: {
        id: true,
        created_at: true,
        lat: true,
        lng: true,
        status:true
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
    })),  
    initSeedLatLng: publicProcedure
      .input(z.object({ page: z.number().default(0), length: z.number().default(50) }))
      .query(async ({ctx, input}) => {
        const allPoints = getPointsSquare(input.page, input.length);

        const res = await Promise.allSettled(
          allPoints.map((point: [number, number]) =>
            ctx.prisma.latLngToProcess.create({
              data: {
                lat: point[0],
                lng: point[1],
                status: 'pending',
              },
            })
          )
        );

        const failures = res.filter((r) => r.status === 'rejected');
        if(failures.length > 0){
          console.error('Some lat/lng failed to seed', { failures });
        }
        

        return res
          .filter((r) => r.status === 'fulfilled')
          .map((r) => (r as PromiseFulfilledResult<LatLngToProcess>).value);
      }),
      createLatLng: publicProcedure
        .input(z.object({ lat: z.number(), lng: z.number()}))
        .mutation(async ({ctx, input}) => ctx.prisma.latLngToProcess.create({
          data: {
            lat: input.lat,
            lng: input.lng,
            status: 'pending',
          },
        }))*/
})
