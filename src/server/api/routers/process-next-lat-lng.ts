import { z } from "zod";
import WikiJS from 'wikijs'

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { PrismaClient } from "@prisma/client";
import { Page } from "wikijs";
import { Coordinates } from "wikijs";
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

export const latLngRouter = createTRPCRouter({
  processNext: publicProcedure.query(async () => {
    const prisma = new PrismaClient()
      const recordToProcess = await prisma.latLngToProcess.findFirstOrThrow({
        where: {
          status: 'pending'
        },
        orderBy: {
          createdAt: 'asc'
        }
      })
      const RADIUS = 1000;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await WikiJS().geoSearch(recordToProcess.lat, recordToProcess.lng, RADIUS)
        .then((res: string[]) => {
            // TODO: do we need to filter to just regions here?
            if(res?.length == 0){
              throw new Error(`No match found for ${recordToProcess.lat} ${recordToProcess.lng}`)
            }else{
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
});
