import { z } from "zod";
import WikiJS from 'wikijs'

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { LatLngToProcess, PrismaClient } from "@prisma/client";
import { Page } from "wikijs";
import { Coordinates } from "wikijs";
import { RADIUS } from "~/pages/debug/seeds";
import { getPointsSquare } from "~/pages/debug/seeds";
import { RouterOutputs } from "~/utils/api";
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
  processNext: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const prisma = new PrismaClient()
        const recordToProcess = await prisma.latLngToProcess.findFirstOrThrow({
          where: {
            status: 'pending',
            id: input.id
          },
          orderBy: {
            createdAt: 'asc'
          }
        })
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = await WikiJS().geoSearch(recordToProcess.lat, recordToProcess.lng, RADIUS)
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
              .then(async (page:Page) => {
                return {
                  url: page.url(),
                  summary: await page.summary(),
                  info: await page.fullInfo(),
                  content: await page.content(),
                  latLng: await page.coordinates()
                }
              })
              .then((fp) => prisma.place.create({
                  data: {
                    lat: fp.latLng.lat,
                    lng: fp.latLng.lon,
                    generatedTitle: 'Woah',
                    wikiUrl: fp.url
                  }
                }).then((res) => {
                  console.log('place updated')
                  return {
                    status: 'success',
                    res: res
                  }
                }).catch(() => {
                  console.error('failed to update place')
                })
              )
              .catch((err) => {
                console.error(err)
              })
          )))


      return {
          result,
      };
    }),
    getAll: publicProcedure
    .input(z.object({ page: z.number().default(0), length: z.number().default(50)}))
    .query(({ ctx }) => ctx.prisma.latLngToProcess.findMany({
      take: 1000,
      select: {
        id: true,
        status: true,
        lat: true,
        lng: true
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
      })
})
