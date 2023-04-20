// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
serve(async (req:Request):Response => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const result = await req?.json();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const data = result?.data as RequestBodyContent

  const res = {
    message: `Hello ${data?.placeType?.wiki_id}!`,
  }

  return new Response(
    JSON.stringify(res),
    { headers: { "Content-Type": "application/json" } },
  )
})

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
