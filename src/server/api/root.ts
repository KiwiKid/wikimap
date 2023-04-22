import { createTRPCRouter } from "~/server/api/trpc";
import { latLngRouter } from "./routers/latlng";
import { placeRouter } from "./routers/place";
import { placeTypeRouter } from "./routers/placetype";
import { utilsRouter } from "./routers/utils";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  latLng: latLngRouter,
  place: placeRouter,
  placeType: placeTypeRouter,
  utils: utilsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
