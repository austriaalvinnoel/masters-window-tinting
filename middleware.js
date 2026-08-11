export default function middleware(request) {
  const url = new URL(request.url);

  // Retire obsolete legacy FineArt URLs
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

  // Let all normal website requests continue
}
