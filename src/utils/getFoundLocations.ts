export interface FoundLocations {
    foundDate:string,
    placeId:string
  }

const setFoundLocation = (placeId:string) => {
  const newItem = {
    placeId: placeId,
    foundDate: new Date().toISOString()
  }

  if(!!window){
    const foundAlreadyString = window.localStorage.getItem(`found_pl`);
    if(foundAlreadyString){
      const existing = JSON.parse(foundAlreadyString) as unknown as FoundLocations[]

      window.localStorage.setItem(`found_pl`, JSON.stringify(existing.concat(newItem)))
    }else{
      window.localStorage.setItem(`found_pl`, JSON.stringify([newItem]))
    }
  }
}

  function getFoundLocations ():FoundLocations[] {
    const existing = window && window.localStorage.getItem(`found_pl`)
    if(existing){
      return JSON.parse(existing) as unknown as FoundLocations[]
    }else{
      return []
    }
  }

  export {
    setFoundLocation,
    getFoundLocations
  }