import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: 'Googlebot', allow: ['/'], disallow: ['/private/', '/admin/'] },
      { userAgent: 'Bingbot', allow: ['/'], disallow: ['/private/', '/admin/'] },
      { userAgent: 'Applebot', allow: ['/'], disallow: ['/private/', '/admin/'] },
      { userAgent: 'Grokbot', allow: ['/'], disallow: ['/private/', '/admin/'] },
      { userAgent: '*', allow: ['/'], disallow: ['/private/', '/admin/'] },
    ]
  }
}