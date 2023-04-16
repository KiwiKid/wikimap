import { type Page } from "wikijs";

export interface MappedPage {
  id:string
  wiki_id:number
  url:string
  summary:string
  info:object
  mainImage:string
  images:string[]
  categories:string[]
  references:string[]
  lat:number
  lng:number
}

interface wikiContent {
  title:string
  content:string
}

const CONTENT_LENGTH = 1500

const mapWikiPage = async (page:Page):Promise<MappedPage> => {
  console.log('start mapWikiPage')
  const coords = await page.coordinates()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const urlParts:string[] = page.url().split('/')
  const id = urlParts[urlParts.length - 1];
  if(!id){
    throw new Error('could not get id from wiki url')
  }
    return {
      url: page.url(),
      id: id,
      wiki_id: page.raw.pageid,
      summary: (await page.content() as unknown as wikiContent[])
            .map((wc) => `${wc.title.toUpperCase()}:${wc.content}`).join('').substring(0, CONTENT_LENGTH),
      info: await page.fullInfo(),
      mainImage: await page.mainImage(),
      images: await page.images(),
      categories: await page.categories(),
      references: await page.references(),
      lat: coords.lat,
      lng: coords.lon,
    }
}

export default mapWikiPage