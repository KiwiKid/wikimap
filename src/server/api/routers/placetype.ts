import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import WikiJS from "wikijs";
import mapWikiPage, { type MappedPage} from "~/utils/mapWikiPage";
//import { Configuration, OpenAIApi } from "openai";
//import { prisma } from "~/server/db";

import * as openaiChat from "langchain/chat_models/openai";
import * as chains from "langchain/chains";
//import { CallbackManager } from "langchain/callbacks";
import * as prompts from "langchain/prompts";
import { type PrismaClientValidationError } from "@prisma/client/runtime";
import { Prisma } from "@prisma/client";


export const defaultPlaceTypeSelect = {
  id: true,
  wiki_id: true,
  title: true,
  content: true,
  type: true,
  status: true,
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
    text:string
}
          


export const placeTypeRouter = createTRPCRouter({
    delete: publicProcedure
    .input(z.object({ id: z.string() }))
      .mutation((m) => m.ctx.prisma.placeType.delete({
        where: {
          id: m.input.id
        }
      })),
      processPageName: publicProcedure
        .input(z.object({ pageName: z.string()}))
        .mutation(({input, ctx}) => WikiJS().page(input.pageName)
          .then(mapWikiPage)
          .then(async (fp:MappedPage) => {

            const place = await ctx.prisma.place.findFirst({
              where:{
                lat: fp.lat,
                lng: fp.lng
              },
              select: {
                id: true,
                lat: true,
                lng: true,
                wiki_id: true,
                wiki_url: true,
                status: true,
                info: true,
                summary: true,
                main_image_url: true,
                placeTypePopulated: true
              }
            })
//hmm
            if(!!place){
              return place;
            }else{
              const newItem = {
                  lat: fp.lat,
                  lng: fp.lng,
                  wiki_id: fp.wiki_id.toString(),
                  wiki_url: fp.url,
                  info: fp.info !== null ? fp.info.general as Prisma.JsonObject : Prisma.JsonNull,
                  summary: fp.summary,
                  status: 'empty',

                  main_image_url: fp.mainImage || '',
                }
              console.log(`Creating ${newItem.wiki_url}  ${newItem?.lat} ${newItem?.lng}`)

              return await ctx.prisma.place.create({data: newItem})
            }
          })
        ),

        saveStory: publicProcedure
          .input(z.object({ 
            wiki_id: z.string(),
            title: z.string(),
            content: z.string(),
            promptType: z.string(),
            status: z.string(),
          })).mutation(async ({ctx, input}) => ctx.prisma.placeType.update({data: {
            wiki_id: input.wiki_id.toString(),
            title: input.title,
            content: input.content,
            type: input.promptType,
            upvotes: 0,
            downvotes: 0,
            status: input.status,
          },
          where:{
            LookupUnique: {
              wiki_id: input.wiki_id.toString(),
              type: input.promptType
            } 
          }
          }).then((pt) => ctx.prisma.place.findFirstOrThrow({
            where:{
              wiki_id: pt.wiki_id
            }
          }))
          .then((p) => ctx.prisma.place.update({
            data: {
              placeTypePopulated: {
                push: input.promptType
              }
            },
            where: {
              wiki_id: input.wiki_id
            }
          }))),
          setStoryLoading: publicProcedure.input(z.object({
            wiki_id: z.string(),
            promptType: z.string()
          })).mutation(async ({ctx, input}) => ctx.prisma.placeType.create({
            data: {
              wiki_id: input.wiki_id,
              type: input.promptType,
              title: '',
              content: '',
              status: 'loading'
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
              wiki_id: input.wiki_id,
          }});

          if(!place){
            return;
          }

          const prompt = prompts.ChatPromptTemplate.fromPromptMessages([
            prompts.SystemMessagePromptTemplate.fromTemplate(
              "In the style of J.R.R. Tolkien's \"Lord of the Rings,\" write an exciting short story. Include some details from the {place_information} below"
            )
            //prompts.HumanMessagePromptTemplate.fromTemplate("{input}"),
          ]);

          const llm = new openaiChat.ChatOpenAI();
          const chain = new chains.LLMChain({ prompt, llm });
          const response = await chain.call({ 
            place_information: place.summary
          });

          let res:{text:string};
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if(!response || (response.text && response.text.length == 0)){
            res = {
              text: 'failed',
            }
          }else{
            res = {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              text: response.text,
            }
          }
          
          return ctx.prisma.placeType.update({data: {
            wiki_id: place.wiki_id.toString(),
            title: 'Placeholder title',
            content: res.text || 'No content',
            type: input.promptType,
            upvotes: 0,
            downvotes: 0,
            status: 'success',
          },
          where: {
            LookupUnique: {
              wiki_id: place.wiki_id,
              type: input.promptType,
            }
          }}).then((res) => {
            return {
              placeType: res,
              lat: place.lat,
              lng: place.lng
            }
          })
        }),
/*
          const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
          });
          const openai = new OpenAIApi(configuration);
          let openAIRes:OpenAIRes
          try {

          /*  const promptRow = await ctx.prisma.prompt.findFirst({
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
      }),*/

      getSingle: publicProcedure
        .input(z.object({ placeId: z.string() }))
        .query(async ({ ctx, input}) => {

          const place = await ctx.prisma.place.findFirst({
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
              id: {
                equals: input.placeId
              }
            }
          });
          if(!place || !place.wiki_id){
            throw new Error("no place or wiki_id?")
          }

          const getPlaceTypes = async (wiki_id:string) => 
                ctx.prisma.placeType.findMany({
                    select: defaultPlaceTypeSelect,
                    where: {
                      wiki_id: wiki_id,
                      NOT: {
                        content: 'failed'
                      }
                    }
                  })

          const placeTypes = await getPlaceTypes(place?.wiki_id);
          return {
            place: place,
            placeTypes
          }
        }),
      getInside: publicProcedure
        .input(z.object({ 
          topLeftLat: z.number()
          , topLeftLng: z.number()
          , bottomRightLat: z.number()
          , bottomRightLng: z.number()
          , promptType: z.string() 
          , ignoreIds: z.string().array().optional()
        }))
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
              wiki_id: true,
              placeTypePopulated: true,
            },
            where: {
              lat: {
                lt: input.topLeftLat,
                gt: input.bottomRightLat,
              },
              lng: {
                lt: input.bottomRightLng,
                gt: input.topLeftLng
              },
              id: {
                notIn: input.ignoreIds || []
              }
            },
            take: 200,
          });

         /* const getPlaceTypes = async (wiki_id:string) => ctx.prisma.placeType.findMany({
                      select: defaultPlaceTypeSelect,
                      where: {
                        wiki_id: wiki_id,
                        type: input.promptType
                      }
                    })

              return Promise.all(places.map(async (p) => {
                  const placeTypes = await getPlaceTypes(p.wiki_id);
                  return {
                    place: p,
                    placeTypes
                  }
                }))*/
                return {
                  places
                }
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