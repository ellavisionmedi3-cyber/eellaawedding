import connectToDatabase, { Service } from "@/lib/db";
import ServicesClient from "./ServicesClient";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  await connectToDatabase();
  const services = await Service.find().sort({ order: 1 }).lean();

  const mappedServices = services.map((s: any) => {
    const id = s._id.toString();
    const newItem = { ...s, id };
    delete (newItem as any)._id;
    delete (newItem as any).__v;
    return newItem;
  });

  return <ServicesClient services={mappedServices} />;
}
