// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain/chains";
import { CallbackManager } from "langchain/callbacks";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";

interface Request {
  wiki_id:string
  wiki_url:string
  summary:string
  prompt_type:string
}

serve(async (req) => {
  try{
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { 
      wiki_id,
      wiki_url,
      summary,
      prompt_type
    } = await req.json() as Request

    const data = {
      message: `Hello ${wiki_id} ${wiki_url} ${summary}!`,
    }

    const prompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(
        "In the style of J.R.R. Tolkien's \"Lord of the Rings,\" write an exciting short story. Include some details from the {place_information} below"
      )
      //prompts.HumanMessagePromptTemplate.fromTemplate("{input}"),
    ]);

    const llm = new ChatOpenAI();
    const chain = new LLMChain({ prompt, llm });
    const response = await chain.call({ 
      place_information: summary
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
    
    return new Response(
      JSON.stringify({
      wiki_id: wiki_id,
      title: 'Placeholder title',
      content: res.text || 'No content',
      type: prompt_type,
      upvotes: 0,
      downvotes: 0,
      status: 'success'
    }),
    { headers: { "Content-Type": "application/json" } }
    )




    return new Response(
      JSON.stringify(data),
      { headers: { "Content-Type": "application/json" } },
    )
  }catch(err){
    return new Response(
      JSON.stringify(err),
      { headers: { "Content-Type": "application/json" } },
    )
  }
})

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
