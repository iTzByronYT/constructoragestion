import { authMiddleware } from "@clerk/nextjs";
 
// Configuración de rutas públicas
export default authMiddleware({
  publicRoutes: [
    "/",
    "/api/webhook/clerk",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/trpc(.*)",
  ],
  ignoredRoutes: [
    "/api/webhook/clerk",
    "/api/trpc(.*)",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
