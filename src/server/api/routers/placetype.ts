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
  const trimedInput = input.replace(/^\n+/, '').trim();
  const startIndex = (trimedInput.indexOf("TITLE: ") || trimedInput.indexOf('Title:')) + 7;
  const endIndex = (trimedInput.indexOf("CONTENT: ")|| trimedInput.indexOf('Content: ')) - 1;
  const title = trimedInput.substring(startIndex, endIndex).trim();

  const contentIndex = trimedInput.indexOf("CONTENT:") + 9;
  const content = trimedInput.substring(contentIndex).replaceAll(/\[(\d+)\]/g, ' ').trim();
  
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

type OpenAIRes = {
    title?: string,
    content?: string,
    wiki_id: string,
    lat: number,
    lng: number,
    raw: string
    status: string
}


export const placeTypeRouter = createTRPCRouter({
    delete: publicProcedure
    .input(z.object({ id: z.string() }))
      .mutation((m) => m.ctx.prisma.placeType.delete({
        where: {
          id: m.input.id
        }
      })),
    getAndPopulateStory: publicProcedure
      .input(z.object({ wiki_id: z.string(), promptType: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const place = await ctx.prisma.place.findFirstOrThrow({
          select: {
            wiki_id: true,
            wiki_url: true,
            summary: true,
            info: true,
            lat: true,
            lng: true
          },
          where: {
              wiki_id: input.wiki_id
          }});

          const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
          });
          const openai = new OpenAIApi(configuration);
          let openAIRes:OpenAIRes
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

            const prompt = `In the style of J.R.R. Tolkien's "Lord of the Rings," write an exciting short story. Include some details from the [place information] below. 
            This is the [place information]:
            [${place.wiki_url}] ${place.summary}

            When responding use the format:
            TITLE:
            CONTENT:`
            
              const completion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [{
                  role: "system",
                  content: prompt
                }],
                max_tokens: 300,
                temperature: 0.8,
              })

              if(!completion || !completion.data || completion?.data?.choices?.length == 0 || !completion?.data?.choices[0]?.text){
                console.error('Open API error response', {
                  data: completion.data
                })
                openAIRes = {
                  wiki_id: place.wiki_id,
                  lat: place.lat,
                  lng: place.lng,
                  status: 'error-no-response',
                  raw: 'none'
                }
              }

              const firstChoice = completion.data.choices[0]
              
              if(!firstChoice || !firstChoice.message || !firstChoice.message.content){
                console.error('Failed to get choices')
                openAIRes =  {
                  status: 'error-2',
                  wiki_id: place.wiki_id,
                  lat: place.lat,
                  lng: place.lng,
                  raw: JSON.stringify(completion.data.choices)
                }
              }else{

                const { title, content } = parseAIResponse(firstChoice?.message.content)
                
                if(!title || !content || title.length == 0 || content.length == 0){
                  console.error('OPENAI-Could not parseAIResponse', {aires: firstChoice?.message.content})
                }

                openAIRes = {
                  title: title,
                  content: content,
                  status: 'success',
                  wiki_id: place.wiki_id,
                  lat: place.lat,
                  lng: place.lng,
                  raw: firstChoice?.message.content
                }
              }

          } catch(err) {
            openAIRes = {
              status: 'error-3',
              wiki_id: place.wiki_id,
              lat: place.lat,
              lng: place.lng,
              raw: JSON.stringify(err),
            }
          }

        return prisma.placeType.create({data: {
          wiki_id: openAIRes.wiki_id.toString(),
          title: openAIRes.title || '',
          content: openAIRes?.content || '',
          type: input.promptType,
          upvotes: 0,
          downvotes: 0,
          failed_ai_res: openAIRes.raw,
          status: openAIRes.status
        }}).then((res) => {
          return {
            placeType: res,
            lat: openAIRes.lat,
            lng: openAIRes.lng
          }
        })
      }),
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