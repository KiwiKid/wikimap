import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import WikiJS from "wikijs";
import mapWikiPage from "~/utils/mapWikiPage";
import { Configuration, OpenAIApi } from "openai";
import { prisma } from "~/server/db";

interface AIResponse {
  title?:string
  content?:string
}

function parseAIResponse(input: string): AIResponse {
  const startIndex = (input.indexOf("TITLE:") || input.indexOf('Title:')) + 7;
  const endIndex = (input.indexOf("CONTENT:")|| input.indexOf('Content:')) - 1;
  const title = input.substring(startIndex, endIndex).trim();

  const contentIndex = input.indexOf("CONTENT:") + 9;
  const content = input.substring(contentIndex).replaceAll(/\[(\d+)\]/, ' ').trim();
  
  return { title, content };
}

export const defaultPlaceTypeSelect = {
  id: true,
  wiki_id: true,
  title: true,
  content: true,
  type: true,
  upvotes: true,
  downvotes: true
}

export const defaultPlaceSelect = {
  id: true,
  lat: true,
  lng: true,
  status: true,
  wiki_url: true,
  summary: true,
  wiki_id: true,
  info: true,
  main_image_url: true,
}


export const placeTypeRouter = createTRPCRouter({
    delete: publicProcedure
    .input(z.object({ id: z.string() }))
      .mutation((m) => m.ctx.prisma.placeType.delete({
        where: {
          id: m.input.id
        }
      })),
    request: publicProcedure
      .input(z.object({ wiki_id: z.string(), promptType: z.string() }))
      .mutation(async ({ ctx, input }) => ctx.prisma.place.findFirstOrThrow({
          select: {
            wiki_id: true,
            summary: true,
            info: true,
            lat: true,
            lng: true
          },
          where: {
              wiki_id: input.wiki_id
          }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/restrict-template-expressions
      })
      .then((res) => WikiJS().findById(`${res.wiki_id}`).catch((err) => {
          console.error(err)
          throw new Error('wiki js failed')
        })
        .then(mapWikiPage)
        .then(async (fp) => {
          const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
          });
          const openai = new OpenAIApi(configuration);
          try {

            const promptRow = await ctx.prisma.prompt.findFirst({
              select:{
                text: true,
                type: true
              },
              where: {
                type: input.promptType
              }
            })

            console.log(promptRow)
           // if(!promptRow){
            //  throw new Error("No matching row")
           // }

            const prompt = `Write a short related Lord of the Rings story with themes from this place information, when responding use the format:
            TITLE:
            CONTENT:
            This is the place information:
            [${fp.url}] ${fp.summary}`
            
              const completion = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: prompt,
                max_tokens: 500,
              })

              if(!completion || !completion.data || completion?.data?.choices?.length == 0 || !completion?.data?.choices[0]?.text){
                console.error('Open API error response', {
                  data: completion.data
                })
                return {
                  result: 'OPENAI-Error - no response',
                  wiki_id: fp.wiki_id,
                  lat: fp.lat,
                  lng: fp.lng,
                }
              }

              const firstChoice = completion.data.choices[0]

              if(!firstChoice || !firstChoice.text){
                console.error('Failed to get choices')
                return {
                  result: 'OPENAI-Error, no choices',
                  wiki_id: fp.wiki_id,
                  lat: fp.lat,
                  lng: fp.lng,
                  raw: completion
                }
              }


              const { title, content } = parseAIResponse(firstChoice?.text)
              
              if(!title || !content || title.length == 0 || content.length == 0){
                console.error('OPENAI-Could not parseAIResponse', {aires: firstChoice?.text})
              }
              
              return {
                title: title,
                content: content,
                wiki_id: fp.wiki_id,
                lat: fp.lat,
                lng: fp.lng,
                raw: completion
              }

          } catch(err) {
            return {
              result: JSON.stringify(err),
              wiki_id: fp.wiki_id,
              lat: fp.lat,
              lng: fp.lng,
            }
          }
        })
      ).then((openAIRes) => {
        return prisma.placeType.create({data: {
          wiki_id: openAIRes.wiki_id.toString(),
          title: openAIRes.title || '',
          content: openAIRes?.content || '',
          type: input.promptType,
          upvotes: 0,
          downvotes: 0
        }}).then((res) => {
          return {
            ...res,
            lat: openAIRes.lat,
            lng: openAIRes.lng
          }
        })
      })
      ),
      getInside: publicProcedure
        .input(z.object({ topLeftLat: z.number(), topLeftLng: z.number(), bottomRightLat: z.number(), bottomRightLng: z.number() }))
        .query(async ({ ctx, input}) => {
          
          const places = await ctx.prisma.place.findMany({
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
          });

          const getPlaceTypes = async (wiki_id:string) => ctx.prisma.placeType.findMany({
                      select: defaultPlaceTypeSelect,
                      where: {
                        wiki_id: wiki_id
                      }
                    })

              return Promise.all(places.map(async (p) => {
                  const placeTypes = await getPlaceTypes(p.wiki_id);
                  return {
                    place: p,
                    placeTypes
                  }
                }))
              }),
              upvote: publicProcedure
                .input(z.object({ id: z.string() }))
                .mutation((m) => m.ctx.prisma.placeType.update({
                  data: {
                    upvotes: { increment: 1}
                  },
                  where: {
                    id: m.input.id
                  }
                })),
                downvote: publicProcedure
                  .input(z.object({ id: z.string() }))
                  .mutation((m) => m.ctx.prisma.placeType.update({
                    data: {
                      downvotes: { increment: 1}
                    },
                    where: {
                      id: m.input.id
                    }
                  }))
                  
  })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    
   /* .then((page:Page) => {
        console.log(page)
        return page
    })*/