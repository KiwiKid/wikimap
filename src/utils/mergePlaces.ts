import { Place } from "@prisma/client";

export function mergePlaces(array1: Place[], array2: Place[]): Place[] {
    return array1.map((item: Place) => {
      const matchingItem = array2.find((i: Place) => i.id === item.id);
      return { ...item, ...matchingItem };
    });
  }