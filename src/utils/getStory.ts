import axios, {AxiosResponse} from 'axios';
import { createClient } from '@supabase/supabase-js'

interface GetStoryRequest {
    wiki_id:string
    wiki_url:string
    summary:string
    prompt_type:string
}

interface Response {
    data?: {
      wiki_id:string
      title:string
      content:string
      type:string
      status:string
    },
    error?:{
        message:string
    }
  }

const getClient = () => {
    if(!process.env.NEXT_PUBLIC_SBASE_URL){
        throw new Error("no SUPABASE_URL")
    }
    if(!process.env.NEXT_PUBLIC_SBASE_ANON_KEY){
        throw new Error("no SUPABASE_ANON_KEY")
    }
    return createClient(process.env.NEXT_PUBLIC_SBASE_URL, process.env.NEXT_PUBLIC_SBASE_ANON_KEY);
}


const getStory = async (wiki_id:string, wiki_url:string, summary:string, prompt_type:string) => {
    debugger;
    const supabase = getClient();
    const res = await supabase.rpc<'getPlaceStory', Response>('getPlaceStory', { wiki_url: wiki_url, wiki_id: wiki_id, summary: summary, prompt_type: prompt_type })
    
    if(res.error){

        return {
            text: res.error
        }
    }
    return res.data
}


export {
    getStory
}
