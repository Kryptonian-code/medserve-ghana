import { ShieldCheck, Clock, Truck, CreditCard, Stethoscope, RefreshCw } from "lucide-react";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Genuine medicines you can trust",
    description:
      "Every product is sourced from licensed distributors and verified for authenticity before reaching you.",
  },
  {
    icon: Clock,
    title: "Fast prescription review",
    description:
      "Our pharmacists review uploaded prescriptions promptly, so you can complete your order without unnecessary delays.",
  },
  {
    icon: Truck,
    title: "Convenient delivery options",
    description:
      "Choose home delivery in selected areas across Ghana or pick up your order from our pharmacy location.",
  },
  {
    icon: CreditCard,
    title: "Secure and easy payments",
    description:
      "Pay securely with mobile money or card. Your financial information is protected at every step.",
  },
  {
    icon: Stethoscope,
    title: "Support from a licensed pharmacist",
    description:
      "Have questions about your medication? Our team of licensed pharmacists is here to help you.",
  },
  {
    icon: RefreshCw,
    title: "Easy reordering for repeat needs",
    description:
      "Quickly reorder your regular medicines from your account. No need to start from scratch each time.",
  },
];

const BenefitsSection = () => {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Why thousands trust MedServe Ghana
          </h2>
          <p className="text-lg text-muted-foreground">
            We combine the reliability of a licensed pharmacy with the convenience of online ordering, 
            so you can focus on what matters most.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((item) => (
            <div
              key={item.title}
              className="group rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <item.icon className="h-6 w-6" />
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

export default BenefitsSection;
