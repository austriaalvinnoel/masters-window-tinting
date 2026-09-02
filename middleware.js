export default function middleware(request) {
  const url = new URL(request.url);

  // Normalize legacy CMS page labels so spelling, punctuation, encoding,
  // capitalization, and historical separators resolve consistently.
  const idPage = (url.searchParams.get("idpage") || "")
    .toLowerCase()
    .replace(/\uFFFD/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  const legacyDestination = (() => {
    if (!idPage) return null;
    if (idPage.includes("gallery")) return "/gallery";
    if (idPage.includes("residential")) return "/residential";
    if (idPage.includes("commercial window")) return "/commercial";
    if (idPage.includes("liquid paint protection") || idPage.includes("liquid ppf")) {
      return "/liquid-ppf";
    }
    if (idPage.includes("ceramic pro") || idPage.includes("ceramic coating")) {
      return "/ceramic-coating";
    }
    if (idPage.includes("detailing") || idPage.includes("testimonial")) {
      return "/detailing";
    }
    if (idPage.includes("boat tint") || idPage.includes("marine tint")) {
      return "/marine-window-tinting";
    }
    if (idPage.includes("headlight") || idPage.includes("tail light")) {
      return "/headlight-tail-light-tinting";
    }
    if (idPage === "about") return "/about";
    if (idPage === "contact") return "/contact";
    if (idPage.includes("f a q") || idPage === "faq") return "/contact";
    if (
      idPage.includes("window tint") ||
      idPage.includes("automotive") ||
      idPage.includes("specialty window film")
    ) {
      return "/window-tinting";
    }
    return null;
  })();

  // Consolidate valuable legacy service URLs into their closest current page.
  // This also covers old /index.php variants found in Google Search Console.
  if (
    legacyDestination &&
    (url.pathname === "/" || url.pathname === "/index.php")
  ) {
    return Response.redirect(new URL(legacyDestination, url.origin), 308);
  }

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

  // Unknown idpage values belong to retired services or malformed legacy CMS
  // routes. Returning 410 prevents them from becoming soft-404 duplicates.
  if (url.pathname === "/" && url.searchParams.has("idpage")) {
    return new Response("Gone", {
      status: 410,
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      }
    });
  }

  // Let all normal website requests continue.
}
