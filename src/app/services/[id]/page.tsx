import { Metadata } from 'next';
import connectToDatabase, { Service } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 60; // Revalidate every 60 seconds

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    await connectToDatabase();
    const service = await Service.findById(id).lean();
    if (!service) return { title: 'Service Not Found' };

    const title = (service as any).title_ar || (service as any).title;
    const desc = (service as any).desc_ar || (service as any).desc;

    return {
      title: `${title} | إيلا ميديا`,
      description: desc?.substring(0, 160) || 'خدمات تصوير احترافية من إيلا ميديا',
      openGraph: {
        title: `${title} | إيلا ميديا`,
        description: desc?.substring(0, 160),
        images: (service as any).image_url ? [(service as any).image_url] : [],
      }
    };
  } catch (error) {
    return { title: 'Service | Ella Media' };
  }
}

export default async function DynamicServicePage({ params }: Props) {
  const { id } = await params;
  await connectToDatabase();
  
  let service;
  try {
    service = await Service.findById(id).lean();
  } catch (e) {
    notFound();
  }

  if (!service) {
    notFound();
  }

  const s = service as any;
  const title = s.title_ar || s.title;
  const desc = s.desc_ar || s.desc;

  return (
    <div className="anim-fade-in" style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '60px var(--px)' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontFamily: 'var(--font-display)', color: 'var(--pink)', marginBottom: '20px' }}>
          {title}
        </h1>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.8, maxWidth: '800px', marginBottom: '40px', color: 'var(--text-muted)' }}>
          {desc}
        </p>
        
        {s.image_url && (
          <div style={{ marginBottom: '60px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
            <img src={s.image_url} alt={title} style={{ width: '100%', maxHeight: '600px', objectFit: 'cover' }} />
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link href="/contact" className="btn btn-primary" style={{ padding: '15px 40px', fontSize: '1.1rem' }}>
            احجزي جلستك الآن
          </Link>
        </div>
      </div>
    </div>
  );
}
