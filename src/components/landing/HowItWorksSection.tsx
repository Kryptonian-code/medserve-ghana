import { Search, FileCheck, CreditCard, Package } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "1",
    title: "Browse or upload",
    description: "Search for products in our shop or upload your prescription for pharmacist review.",
  },
  {
    icon: FileCheck,
    step: "2",
    title: "Pharmacist review",
    description: "Our licensed pharmacist reviews your prescription and confirms the right products for you.",
  },
  {
    icon: CreditCard,
    step: "3",
    title: "Pay securely",
    description: "Complete payment safely using mobile money or card through our secure checkout.",
  },
  {
    icon: Package,
    step: "4",
    title: "Receive your order",
    description: "Get your medicines delivered to your door or pick them up at our location.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="bg-card py-16 md:py-24">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground">
            Getting your medicines is simple. Four easy steps from search to delivery.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, i) => (
            <div key={item.step} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-border lg:block" />
              )}
              <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <item.icon className="h-7 w-7" />
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs font-bold text-primary-foreground">
                  {item.step}
                </span>
              </div>
              <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
