import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import WikiJS from "wikijs";
import mapWikiPage from "~/utils/mapWikiPage";
import { Configuration, OpenAIApi } from "openai";
import { prisma } from "~/server/db";

interface AIResponse {
  title:string
  content:string
}

function parseAIResponse(input: string): AIResponse {
  const startIndex = (input.indexOf("TITLE:") || input.indexOf('Title:')) + 7;
  const endIndex = (input.indexOf("CONTENT:")|| input.indexOf('Content:')) - 1;
  const title = input.substring(startIndex, endIndex).trim();

  const contentIndex = input.indexOf("CONTENT:") + 9;
  const content = input.substring(contentIndex).trim();

  return { title, content };
}


export const placeTypeRouter = createTRPCRouter({
    request: publicProcedure
      .input(z.object({ wiki_id: z.string(), type: z.string() }))
      .mutation(({ ctx, input }) => ctx.prisma.place.findFirstOrThrow({
          select: {
            wiki_id: true,
            summary: true,
            info: true,
          },
          where: {
              wiki_id: input.wiki_id
          }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/restrict-template-expressions
        }).then((res) => WikiJS().findById(`${res.wiki_id}`).catch((err) => {
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

            const prompt = `Create short related Lord of the Rings style backstory related to the following place information, dont include any Christian nationalism or crusades, use the format
            TITLE:
            CONTENT:

            ${fp.url} 
            ${fp.summary}`
            
              const completion = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: prompt,
                max_tokens: 500
              })

              if(!completion || !completion.data || completion?.data?.choices?.length == 0 || !completion?.data?.choices[0]?.text){
                console.error('Open API error response', {
                  data: completion.data
                })
                return {
                  result: 'Error - no response',
                  wiki_id: fp.wiki_id
                }
              }

              const firstChoice = completion.data.choices[0]

              if(!firstChoice || !firstChoice.text){
                console.error('Failed to get choices')
                return {
                  result: 'Error, no choices',
                  wiki_id: fp.wiki_id,
                  raw: completion
                }
              }


              const { title, content } = parseAIResponse(firstChoice?.text)
        
              return {
                title: title,
                content: content,
                wiki_id: fp.wiki_id,
                raw: completion
              }

          } catch(err) {
            return {
              result: JSON.stringify(err),
              wiki_id: fp.wiki_id,
            }
          }
        })
      ).then((openAIRes) => {
        return prisma.placeType.create({data: {
          wiki_id: openAIRes.wiki_id.toString(),
          title: openAIRes.title || 'NA',
          content: openAIRes?.content || 'no content?',
          type: input.type,
        }})
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
                    select: {
                      id: true,
                      wiki_id: true,
                      title: true,
                      content: true,
                      type: true,
                    },
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
            })
            
  })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    
   /* .then((page:Page) => {
        console.log(page)
        return page
    })*/