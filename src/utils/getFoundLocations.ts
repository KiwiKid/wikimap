export interface FoundLocations {
    foundDate:string,
    placeId:string
  }

const setFoundLocation = (pos:string) => {
  const newItem = {
    placeId: pos,
    foundDate: new Date().toISOString()
  }

  if(!!window){
    const foundAlreadyString = window.localStorage.getItem(`found_pl`);
    if(foundAlreadyString){
      const existing = JSON.parse(foundAlreadyString) as unknown as FoundLocations[]

      window.localStorage.setItem(`found_pl`, JSON.stringify([...existing, newItem]))
    }else{
      window.localStorage.setItem(`found_pl`, JSON.stringify([newItem]))
    }
  }
}

  function getFoundLocations ():FoundLocations[] {
    const existing = window && window.localStorage.getItem(`found_pl`) as unknown as FoundLocations[]

    if(existing){
      return existing;
    }else{
      return []
    }
  }

  export {
    setFoundLocation,
    getFoundLocations
  }