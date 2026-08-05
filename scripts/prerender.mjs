import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, resolveMeta, staticPaths } from '../.ssr/entry-server.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const template = await readFile(join(dist, 'index.html'), 'utf8');

const escapeAttribute = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

const escapeJson = (value) => JSON.stringify(value).replaceAll('<', '\\u003c');

const replaceMeta = (html, attribute, value, replacement) => {
  const pattern = new RegExp(`<meta\\s+${attribute}=["']${value}["'][^>]*>`, 'i');
  return pattern.test(html) ? html.replace(pattern, replacement) : html.replace('</head>', `    ${replacement}\n  </head>`);
};

const applyHead = (html, meta) => {
  let output = html.replace(/<html([^>]*)\slang=["'][^"']*["']/i, `<html$1 lang="${meta.locale ?? 'tr'}"`);
  output = output.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttribute(meta.title)}</title>`);
  output = output.replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${escapeAttribute(meta.canonical)}" />`);
  output = output.replace(/\s*<link\s+rel=["']alternate["'][^>]*hreflang=["'](?:tr|en|x-default)["'][^>]*>/gi, '');
  if (meta.alternates) {
    const localeLinks = [
      ['tr', meta.alternates.tr],
      ['en', meta.alternates.en],
      ['x-default', meta.alternates.xDefault],
    ].map(([hrefLang, href]) => `<link rel="alternate" hreflang="${hrefLang}" href="${escapeAttribute(href)}" />`).join('\n    ');
    output = output.replace('</head>', `    ${localeLinks}\n  </head>`);
  }
  output = replaceMeta(output, 'name', 'description', `<meta name="description" content="${escapeAttribute(meta.description)}" />`);
  output = output.replace(/<meta\s+name=["']robots["'][^>]*>/i, `<meta name="robots" content="${meta.noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}" />`);
  const openGraph = [
    ['og:title', meta.title], ['og:description', meta.description], ['og:url', meta.canonical], ['og:type', meta.type],
    ['og:locale', meta.locale === 'en' ? 'en_GB' : 'tr_TR'],
    ...(meta.alternates ? [['og:locale:alternate', meta.locale === 'en' ? 'tr_TR' : 'en_GB']] : []),
  ];
  output = output.replace(/\s*<meta\s+property=["']og:locale:alternate["'][^>]*>/gi, '');
  for (const [property, content] of openGraph) {
    const pattern = new RegExp(`<meta\\s+property=["']${property}["'][^>]*>`, 'i');
    const tag = `<meta property="${property}" content="${escapeAttribute(content)}" />`;
    output = pattern.test(output) ? output.replace(pattern, tag) : output.replace('</head>', `    ${tag}\n  </head>`);
  }
  for (const [name, content] of [['twitter:title', meta.title], ['twitter:description', meta.description]]) {
    const pattern = new RegExp(`<meta\\s+name=["']${name}["'][^>]*>`, 'i');
    const tag = `<meta name="${name}" content="${escapeAttribute(content)}" />`;
    output = pattern.test(output) ? output.replace(pattern, tag) : output.replace('</head>', `    ${tag}\n  </head>`);
  }
  if (meta.structuredData) output = output.replace('</head>', `    <script type="application/ld+json" data-ack-structured-data="true">${escapeJson(meta.structuredData)}</script>\n  </head>`);
  return output;
};

for (const path of staticPaths) {
  const markup = render(path);
  const meta = resolveMeta(path);
  const page = applyHead(template, meta).replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
  const destination = path === '/' ? join(dist, 'index.html') : join(dist, path.slice(1), 'index.html');
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, page);
}

const noIndexStudio = applyHead(template, {
  title: 'ACKaraca Studio', description: 'Private content studio.', canonical: 'https://ackaraca.me/studio', locale: 'tr', type: 'website', noIndex: true,
});
await mkdir(join(dist, 'studio'), { recursive: true });
await writeFile(join(dist, 'studio', 'index.html'), noIndexStudio);

const noIndexPafta = applyHead(template, {
  title: 'Dijital mimari pafta — ACKaraca',
  description: 'QR kodla erişilen güvenli dijital mimari pafta.',
  canonical: 'https://ackaraca.me/pafta',
  locale: 'tr',
  type: 'article',
  noIndex: true,
});
await mkdir(join(dist, 'pafta'), { recursive: true });
await writeFile(join(dist, 'pafta', 'index.html'), noIndexPafta);

// Keep the custom 404 shell empty: Firebase serves it for every unknown URL,
// and the client can then render the correct locale without hydrating markup
// produced for a different pathname.
const notFound = applyHead(template, {
  ...resolveMeta('/404'),
  // A generic error document has no reciprocal localized route. Advertising
  // /en/404 would create an hreflang target that is neither prerendered nor canonical.
  alternates: undefined,
});
await writeFile(join(dist, '404.html'), notFound);

const sitemapPaths = staticPaths.filter((path) => !resolveMeta(path).noIndex);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${sitemapPaths.map((path) => {
  const meta = resolveMeta(path);
  const alternates = meta.alternates
    ? `\n    <xhtml:link rel="alternate" hreflang="tr" href="${escapeAttribute(meta.alternates.tr)}" />\n    <xhtml:link rel="alternate" hreflang="en" href="${escapeAttribute(meta.alternates.en)}" />\n    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeAttribute(meta.alternates.xDefault)}" />`
    : '';
  return `  <url>\n    <loc>${escapeAttribute(meta.canonical)}</loc>${alternates}\n  </url>`;
}).join('\n')}\n</urlset>\n`;
await writeFile(join(dist, 'sitemap.xml'), sitemap);
await writeFile(join(dist, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: https://ackaraca.me/sitemap.xml\n');
await rm(join(root, '.ssr'), { recursive: true, force: true });
