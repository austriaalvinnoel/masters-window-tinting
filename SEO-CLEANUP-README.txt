Masters Window Tinting — Site-wide SEO cleanup

Changes included:
- Fixed blog canonicals from Vercel domain to masterswindowtinting.com.
- Cleaned blog article canonical URLs (.html removed).
- Fixed privacy-policy canonical to production clean URL.
- Fixed about canonical to /about.
- Converted public internal .html links to clean URLs where applicable.
- Removed known footer href=# location placeholders (kept location text).
- Replaced public Vercel-domain references in blog metadata/assets with production domain.
- Added blog index, five blog articles, and privacy policy to sitemap.xml.

Not changed:
- Admin/API/deployment helper pages.
- Page designs, forms, CMS logic, or service copy except URL/link cleanup.

After deployment:
1. Verify homepage and /blog/ load normally.
2. Open each blog article once.
3. Check sitemap.xml.
4. Re-submit sitemap in Google Search Console only once if desired.
