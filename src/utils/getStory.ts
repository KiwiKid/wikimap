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


const getStory = async (wiki_id:string, wiki_url:string, summary:string, prompt_type:string) => {
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
        return response.data;
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
