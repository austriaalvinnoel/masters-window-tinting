export default function middleware(request) {
  const url = new URL(request.url);

  // Retire obsolete legacy FineArt URLs from the previous CMS.
  if (
    url.pathname === "/" &&
    url.searchParams.get("part") === "fineart"
  ) {
    return new Response("Gone", {
      status: 410,
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      }
    });
  }

  // Retire obsolete legacy session-style URLs from the previous CMS, but
  // preserve idpage URLs so Vercel's targeted permanent redirects can
  // consolidate their SEO signals into the current service/location pages.
  if (
    url.pathname === "/" &&
    url.searchParams.has("sid") &&
    !url.searchParams.has("idpage")
  ) {
    return new Response("Gone", {
      status: 410,
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      }
    });
  }

  // Retire the old PHP front controller. The current site is static and
  // does not use /index.php for any live public page.
  if (url.pathname === "/index.php") {
    return new Response("Gone", {
      status: 410,
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      }
    });
  }

  // Let all normal website requests continue.
}
