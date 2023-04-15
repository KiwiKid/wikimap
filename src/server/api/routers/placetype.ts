import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import WikiJS from "wikijs";
import mapWikiPage from "~/utils/mapWikiPage";
import { Configuration, OpenAIApi } from "openai";

export const placeTypeRouter = createTRPCRouter({
    request: publicProcedure
      .input(z.object({ wiki_id: z.string(), type: z.enum(['oldLegend']) }))
      .mutation(({ ctx, input }) => ctx.prisma.place.findFirstOrThrow({
          take: 1000,
          select: {
            wiki_id: true,
            summary: true,
            info: true,
          },
          where: {
              id: input.wiki_id
          }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        }).then((res) => WikiJS().findById(res.wiki_id))
        .then(mapWikiPage)
        .then(async (fp) => {
          const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
          });
          const openai = new OpenAIApi(configuration);
          try {

            const prompt = `Return a title for the following information in a old english style:
                
            ${fp.url}`
            
              const completion = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: prompt,
              })

              if(!completion || !completion.data || completion?.data?.choices?.length > 0 && completion?.data?.choices[0]?.text){
                return {
                  result: 'Error - no response'
                }
              }

              const firstChoice = completion.data.choices[0]

              if(!firstChoice){
                return {
                  result: 'Error, no choices'
                }
              }
        
              return {
                result: firstChoice?.text
              }

          } catch(err) {
            return {
              result: JSON.stringify(err)
            }
          }
        })
      )
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    
   /* .then((page:Page) => {
        console.log(page)
        return page
    })*/
  })