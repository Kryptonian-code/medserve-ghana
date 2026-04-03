import { Phone, Mail, Clock, MapPin } from "lucide-react";

const ContactSection = () => {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Need help? We are here for you
          </h2>
          <p className="mb-10 text-lg text-muted-foreground">
            Our support team is ready to assist with orders, prescriptions, and product enquiries.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Phone, label: "Call us", value: "+233 30 123 4567" },
              { icon: Mail, label: "Email us", value: "support@medserveghana.com" },
              { icon: Clock, label: "Working hours", value: "Mon to Sat, 8 AM to 8 PM" },
              { icon: MapPin, label: "Location", value: "Accra, Ghana" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-border bg-card p-5">
                <item.icon className="mx-auto mb-3 h-6 w-6 text-primary" />
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </div>
                <div className="mt-1 text-sm font-medium text-foreground">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
