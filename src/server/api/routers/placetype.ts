import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import WikiJS from "wikijs";
import mapWikiPage from "~/utils/mapWikiPage";
import { Configuration, OpenAIApi } from "openai";
import { prisma } from "~/server/db";

export const placeTypeRouter = createTRPCRouter({
    request: publicProcedure
      .input(z.object({ wiki_id: z.string(), type: z.enum(['oldLegend']) }))
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

            const prompt = `Return a title for the following place in a old english style:
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

              if(!firstChoice){
                return {
                  result: 'Error, no choices',
                  wiki_id: fp.wiki_id
                }
              }
        
              return {
                result: firstChoice?.text,
                wiki_id: fp.wiki_id
              }

          } catch(err) {
            return {
              result: JSON.stringify(err),
              wiki_id: fp.wiki_id
            }
          }
        })
      ).then((openAIRes) => {
        return prisma.placeType.create({data: {
          wiki_id: openAIRes.wiki_id.toString(),
          title: openAIRes.result || 'NA',
          type: input.type,
        }})
      })
      )
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    
   /* .then((page:Page) => {
        console.log(page)
        return page
    })*/
  })