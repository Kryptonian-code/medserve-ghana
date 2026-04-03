import { ShieldCheck, Lock, Package, Headphones } from "lucide-react";

const indicators = [
  { icon: ShieldCheck, label: "Licensed pharmacy support" },
  { icon: Lock, label: "Secure checkout" },
  { icon: Package, label: "Genuine product sourcing" },
  { icon: Headphones, label: "Helpful customer care" },
];

const TrustSection = () => {
  return (
    <section className="bg-primary py-12 md:py-16">
      <div className="container">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {indicators.map((item) => (
            <div key={item.label} className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/20">
                <item.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-primary-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
