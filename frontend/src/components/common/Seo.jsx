import { useEffect } from 'react';

const SITE_NAME = 'Zebick';
const SITE_URL = 'https://www.zebick.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setJsonLd(id, data) {
  let el = document.getElementById(id);
  if (!data) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/**
 * Sets per-page <title>, meta description, canonical link, Open Graph /
 * Twitter tags and (optionally) a JSON-LD block. Mutates the single shared
 * <head> tags in place — same pattern as the pre-existing document.title
 * usage in BlogPage/BlogPostPage/ToolsPage — rather than mounting new DOM
 * nodes, so nothing needs cleanup on route change: the next page's <Seo>
 * just overwrites the same tags.
 *
 * `path` must be the CANONICAL path for this page — hardcode it rather
 * than deriving it from the current URL, since several routes have
 * English/German alias paths that should all canonicalize to one URL
 * (see App.js route list).
 */
const Seo = ({ title, description, path = '/', image, type = 'website', jsonLd, noindex = false }) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} – Digitalagentur & Cyber Security`;
    const url = `${SITE_URL}${path}`;
    // `image` may be a relative path (e.g. "/og-image.png") or already an
    // absolute URL (e.g. a blog post's external cover_image) — don't
    // double-prefix the latter.
    const ogImage = image ? (/^https?:\/\//.test(image) ? image : `${SITE_URL}${image}`) : DEFAULT_OG_IMAGE;

    document.title = fullTitle;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setLink('canonical', url);

    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:image', ogImage);
    setMeta('property', 'og:locale', 'de_DE');

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', ogImage);

    setJsonLd('seo-jsonld', jsonLd || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, image, type, noindex, JSON.stringify(jsonLd)]);

  return null;
};

export default Seo;
export { SITE_URL, SITE_NAME };
