import { MetadataRoute } from 'next';
import connectToDatabase, { Service, BlogPost } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://eellaawedding.com';
  
  // Static Routes
  const routes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/packages`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 }
  ];

  try {
    await connectToDatabase();

    // Dynamically add blog posts to sitemap
    const posts = await BlogPost.find({ published: 1 }).select('slug updated_at created_at').lean();
    for (const post of posts) {
      routes.push({
        url: `${baseUrl}/blog/${(post as any).slug}`,
        lastModified: (post as any).updated_at || (post as any).created_at || new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }

    // Dynamically add services to sitemap
    const services = await Service.find().select('_id updatedAt createdAt').lean();
    for (const srv of services) {
      routes.push({
        url: `${baseUrl}/services/${(srv as any)._id}`,
        lastModified: (srv as any).updatedAt || (srv as any).createdAt || new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }

  } catch (error) {
    console.error('Error fetching data for sitemap:', error);
  }

  return routes;
}
