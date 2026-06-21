import type { Metadata } from "next";
import { MapPin, Phone, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Store Directory | EVORA",
  description: "Find EVORA store locations near you.",
};

const stores = [
  {
    name: "EVORA flagship",
    address: "123 Fashion Ave, New York, NY 10001",
    phone: "+1 (555) 123-4567",
    hours: "Mon–Sat: 10am–8pm, Sun: 11am–6pm",
  },
  {
    name: "EVORA SoHo",
    address: "456 Style Blvd, New York, NY 10012",
    phone: "+1 (555) 987-6543",
    hours: "Mon–Sat: 10am–9pm, Sun: 11am–7pm",
  },
  {
    name: "EVORA Beverly Hills",
    address: "789 Rodeo Dr, Beverly Hills, CA 90210",
    phone: "+1 (555) 456-7890",
    hours: "Mon–Sat: 10am–8pm, Sun: 12pm–6pm",
  },
];

export default function StoresPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />
      <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4 text-center">
        Store Directory
      </h1>
      <p className="text-muted-foreground mb-12 text-center max-w-lg mx-auto">
        Visit us in person and experience the EVORA collection.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stores.map((store) => (
          <div key={store.name} className="p-6 border border-border">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
              {store.name}
            </h2>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <MapPin className="size-4 mt-0.5 flex-shrink-0 text-gold" />
                <span>{store.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="size-4 flex-shrink-0 text-gold" />
                <span>{store.phone}</span>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="size-4 mt-0.5 flex-shrink-0 text-gold" />
                <span>{store.hours}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}