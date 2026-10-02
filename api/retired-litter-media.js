export const retiredLitterMediaPath = "/images/litters/winnie-redford.webp";

// Retire this pairing image without removing the preserved internal source asset.
export default function retiredLitterMedia(request, response) {
  response.statusCode = 410;
  response.setHeader("Content-Type", "text/plain; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Robots-Tag", "noindex");
  response.end(request.method === "HEAD" ? undefined : "Gone");
}
