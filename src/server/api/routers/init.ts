import { z } from "zod";
import WikiJS from 'wikijs'

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { LatLngToProcess, Place, PrismaClient } from "@prisma/client";
import { Page } from "wikijs";
import { Coordinates } from "wikijs";
import { getPointsSquare, RADIUS } from "~/pages/debug/init-latlng";
import { RouterOutputs } from "~/utils/api";
import mapWikiPage, { MappedPage } from "~/utils/mapWikiPage";
/*
interface WikiContent {
  title: string;
  content: string;
}*/

interface PageData {
  summary:string
  info:unknown
  content:unknown
  latLng:Coordinates
    // content:WikiContent
}

interface InitResult {
  status: 'success'|'failure'
}

export const latLngRouter = createTRPCRouter({
  process: publicProcedure
    .input(z.object({ id: z.string().optional() }))
    .mutation(async ({ input }) => {
      const prisma = new PrismaClient()
        const recordToProcess = await prisma.latLngToProcess.findFirstOrThrow({
          where: {
            status: 'pending',
            id: input.id
          },
          orderBy: {
            created_at: 'asc'
          }
        })
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        return await WikiJS().geoSearch(recordToProcess.lat, recordToProcess.lng, RADIUS)
          .then(async (res: string[]) => {
              // TODO: do we need to filter to just regions here?
              if(res?.length == 0){
                await prisma.latLngToProcess.update({
                  where: {
                    id: recordToProcess.id
                  },
                  data: {
                    status: 'no-matches'
                  }
                })
                console.error(`No match found for ${recordToProcess.lat} ${recordToProcess.lng}`)
                return [];
              }else{
                console.log(`Found ${res.length} matches`)
                return res;
              }
          })
          .then((pageName:string[]) => Promise.allSettled(pageName.map((pn) => WikiJS().page(pn)
              .then(mapWikiPage)
              .then((fp:MappedPage) => {

                const newItem = {
                    lat: fp.lat,
                    lng: fp.lng,
                    wiki_id: fp.wiki_id.toString(),
                    wiki_url: fp.url,
                    status: 'pending',
                    info: JSON.stringify(fp.info),
                    summary: fp.summary,
                    main_image_url: fp.mainImage,
                  }
                console.log(`Creating ${newItem?.lat} ${newItem?.lat}`)

                return prisma.place.create({data: newItem}).then((res) => {
                  console.log(`Place created: ${fp.id}`)
                  return res;
                })
              })
          )))
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
