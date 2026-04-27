import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://thedailydraft.xyz',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://thedailydraft.xyz/dashboard',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.8,
    },
  ]
}