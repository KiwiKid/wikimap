// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
// import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "std"
import WikiJS from "wikijs";
import { Configuration, OpenAIApi } from "openai";

interface PlaceType {
  wiki_id: string,
  wiki_url: string,
  summary: string,
  info: string,
  lat: number,
  lng: number
}

interface Prompt {
  prompt:string
}

interface RequestBodyContent {
  placeType:PlaceType
  prompt:Prompt
}

interface ResponseBodyContent {
  wiki_id:string
  title:string
  content:string
  type:string
  failed_ai_res:string
  status:string
}


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

serve(async (req:RequestBodyContent):Promise<ResponseBodyContent> => {
  console.log('start')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const result = await req.json<RequestBodyContent>();

  const data = result as unknown as RequestBodyContent

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

    console.log(promptRow)*/
   // if(!promptRow){
    //  throw new Error("No matching row")
   // }

    const prompt = `In the style of J.R.R. Tolkien's "Lord of the Rings," write an exciting short story. Include some details from the [place information] below. 
    This is the [place information]:
    [${data.placeType.wiki_url}] ${data.placeType.summary}

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

      if(!completion || !completion.data || completion?.data?.choices?.length == 0 || !completion?.data?.choices[0]?.content){
        console.error('Open API error response', {
          data: completion.data
        })
        openAIRes = {
          wiki_id: data.placeType.wiki_id,
          lat: data.placeType.lat,
          lng: data.placeType.lng,
          status: 'error-no-response',
          raw: 'none'
        }
      }

      const firstChoice = completion.data.choices[0]
      
      if(!firstChoice || !firstChoice.message || !firstChoice.message){
        console.error('Failed to get choices')
        openAIRes =  {
          status: 'error-2',
          wiki_id: data.placeType.wiki_id,
          lat: data.placeType.lat,
          lng: data.placeType.lng,
          raw: JSON.stringify(completion.data.choices)
        }
      }else{

        const { title, content } = parseAIResponse(firstChoice?.message)
        
        if(!title || !content || title.length == 0 || content.length == 0){
          console.error('OPENAI-Could not parseAIResponse', {aires: firstChoice?.message})
        }

        openAIRes = {
          title: title,
          content: content,
          status: 'success',
          wiki_id: data.placeType.wiki_id,
          lat: data.placeType.lat,
          lng: data.placeType.lng,
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

  return new Response(
    JSON.stringify(openAIRes),
    { headers: { "Content-Type": "application/json" } },
  )
})

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
