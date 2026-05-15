import connectToDatabase, { Booking, Package, GalleryItem, BlogPost, SiteSetting, NewsletterSubscriber, TeamMember, Service, Addon, Review } from "@/lib/db";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await connectToDatabase();

  const bookings = await Booking.find().sort({ created_at: -1 }).lean();
  
  // Fetch real package prices from DB
  const dbPackages = await Package.find({}, 'tier price').lean();
  const packagePrices: Record<string, number> = {};
  dbPackages.forEach(p => {
    packagePrices[(p as any).tier] = (p as any).price;
  });

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b: any) => b.status === "pending").length;
  const confirmedBookings = bookings.filter((b: any) => b.status === "confirmed").length;
  const newToday = bookings.filter((b: any) => {
    const today = new Date().toISOString().split('T')[0];
    const bDate = new Date(b.created_at).toISOString().split('T')[0];
    return bDate === today;
  }).length;

  const revenue = bookings
    .filter((b: any) => b.status === "confirmed" || b.status === "completed")
    .reduce((sum, b: any) => sum + (packagePrices[b.package] || 0), 0);

  const galleryCount = await GalleryItem.countDocuments();
  const blogCount = await BlogPost.countDocuments({ published: 1 });
  const subscriberCount = await NewsletterSubscriber.countDocuments();

  const galleryItems = await GalleryItem.find().sort({ created_at: -1 }).lean();
  const blogPosts = await BlogPost.find().sort({ created_at: -1 }).lean();
  const packagesList = await Package.find().lean();
  const subscribers = await NewsletterSubscriber.find().sort({ created_at: -1 }).lean();
  
  const dbSettings = await SiteSetting.find().lean();
  const settingsMap: Record<string, string> = {};
  dbSettings.forEach((s: any) => { settingsMap[s.key] = s.value; });

  const teamMembers = await TeamMember.find().sort({ order: 1 }).lean();
  const services = await Service.find().sort({ order: 1 }).lean();
  const addons = await Addon.find().lean();
  const reviewsList = await Review.find().sort({ created_at: -1 }).lean();

  // Map _id to id for client components
  const mapIds = (arr: any[]) => arr.map(item => {
    const id = item._id.toString();
    const newItem = { ...item, id };
    delete (newItem as any)._id;
    delete (newItem as any).__v;
    return newItem;
  });

  return (
    <AdminDashboardClient
      bookings={mapIds(bookings)}
      stats={{
        totalBookings,
        pendingBookings,
        confirmedBookings,
        newToday,
        revenue,
        galleryCount,
        blogCount,
        subscriberCount,
      }}
      galleryItems={mapIds(galleryItems)}
      blogPosts={mapIds(blogPosts)}
      packages={mapIds(packagesList)}
      subscribers={mapIds(subscribers)}
      settings={settingsMap}
      teamMembers={mapIds(teamMembers)}
      services={mapIds(services)}
      addons={mapIds(addons)}
      reviews={mapIds(reviewsList)}
    />
  );
}
