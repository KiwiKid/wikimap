import axios, {AxiosResponse} from 'axios';
import { createClient } from '@supabase/supabase-js'

interface GetStoryRequest {
    wiki_id:string
    wiki_url:string
    summary:string
    prompt_type:string
}

interface StoryResponse {
  wiki_id:string
  title?:string
  content?:string
  type:string
  status:string
}
interface Response {
    data?: StoryResponse,
    error?:{
        message:string
    }
  }
/*
const getClient = () => {
    if(!process.env.NEXT_PUBLIC_SBASE_URL){
        throw new Error("no SUPABASE_URL")
    }
    if(!process.env.NEXT_PUBLIC_SBASE_ANON_KEY){
        throw new Error("no SUPABASE_ANON_KEY")
    }
    return createClient(process.env.NEXT_PUBLIC_SBASE_URL, process.env.NEXT_PUBLIC_SBASE_ANON_KEY);
}*/


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

const getStory = async (wiki_id:string, wiki_url:string, summary:string, prompt_type:string):Promise<StoryResponse|void|null> => {
   // const supabase = getClient();


    if(!process.env.NEXT_PUBLIC_SBASE_URL || !process.env.NEXT_PUBLIC_SBASE_ANON_KEY){
        throw new Error('could not get story')
    }
    const payload = { wiki_url: wiki_url, wiki_id: wiki_id, summary: summary, prompt_type: prompt_type }
    
    return axios.post(`${process.env.NEXT_PUBLIC_SBASE_URL}getPlaceStory`, payload, {
        headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SBASE_ANON_KEY}`,
            'Content-Type': 'application/json',
        }
    })
  .then((response: AxiosResponse<Response>) => {
    if(response.data){
        const { title, content } = parseAIResponse(response.data.data?.content ?? '');
        if(!response.data.data?.wiki_id){
          return;
        }

        return {
            ...response.data.data,
            title: title,
            content: content,
        }
    }else{
        console.error('oculd not get story response.data')
    }
    
    // handle successful response here
  })
  .catch((error: Error) => {
    console.error(error)
    // handle error here
  });

}

export {
    getStory
}
