import { z } from "zod";
import WikiJS from 'wikijs'

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { type LatLngToProcess, type Place, } from "@prisma/client";
import { getPointsSquare, RADIUS } from "~/pages/debug/init-latlng";
import mapWikiPage, { type MappedPage } from "~/utils/mapWikiPage";
import { prisma } from "~/server/db";
import { type PrismaClientValidationError } from "@prisma/client/runtime";

interface WikiSearchResult {
  lat: number,
  lng: number,
  pageNames: string[]
}
export const latLngRouter = createTRPCRouter({
  process: publicProcedure
    .input(z.object({ id: z.string().optional() }))
    .mutation(async ({ input }) => {
        const recordToProcess = await prisma.latLngToProcess.findFirstOrThrow({
          where: {
            status: 'pending',
            id: input.id
          },
          orderBy: {
            created_at: 'asc'
          }
        })
        return await WikiJS().geoSearch(recordToProcess.lat, recordToProcess.lng, RADIUS)
          .then(async (res: string[]) => {
              if(res?.length == 0){
                await prisma.latLngToProcess.update({
                  where: {
                    id: recordToProcess.id
                  },
                  data: {
                    status: 'no-matches'
                  }
                })
                return {
                  pageNames: [],
                  lat: recordToProcess.lat,
                  lng: recordToProcess.lng
                };
              } else {
                console.log(`Found ${res.length} matches`)
                return {
                  pageNames: res as unknown as string[],
                  lat: recordToProcess.lat,
                  lng: recordToProcess.lng
                };
              }
          })
          .then(async (results:WikiSearchResult) => {
            const newPlaces = await Promise.allSettled(results.pageNames.map((pn: string) => WikiJS().page(pn)
              .then(mapWikiPage)
              .then(async (fp:MappedPage) => {

                const newItem = {
                    lat: fp.lat,
                    lng: fp.lng,
                    wiki_id: fp.wiki_id.toString(),
                    wiki_url: fp.url,
                    status: 'pending',
                    info: JSON.stringify(fp.info),
                    summary: fp.summary,
                    main_image_url: fp.mainImage || '',
                  }
                console.log(`Creating ${newItem.wiki_url}  ${newItem?.lat} ${newItem?.lat}`)

                return await prisma.place.create({data: newItem}).catch((err:PrismaClientValidationError) => {
                  console.error('failed to create place (could already exist?', {
                    err: err?.message,
                    stack: err?.stack
                  })
                })
              })))

              const failures = newPlaces.filter((r) => r.status === 'rejected');
              if(failures.length > 0){
                console.error('Some places failed to create', { failures });
              }

              return newPlaces
                .filter((r) => r.status === 'fulfilled')
                .map((r) => (r as PromiseFulfilledResult<Place>).value);
            })
      }),
    getSummary: publicProcedure
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
        }))
})
