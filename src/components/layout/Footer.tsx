import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-foreground text-primary-foreground">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">M</span>
              </div>
              <span className="font-heading text-lg font-bold">MedServe Ghana</span>
            </div>
            <p className="text-sm leading-relaxed opacity-80">
              Ghana's trusted online pharmacy. We provide genuine medicines, pharmacist-reviewed prescriptions, 
              and convenient delivery to your doorstep. Licensed and committed to your health.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wider opacity-60">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Shop Medicines", to: "/shop" },
                { label: "Upload Prescription", to: "/upload-prescription" },
                { label: "How It Works", to: "/how-it-works" },
                { label: "FAQ", to: "/faq" },
                { label: "Contact Us", to: "/contact" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="opacity-80 transition-opacity hover:opacity-100">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wider opacity-60">
              Policies
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                "Privacy Policy",
                "Terms of Service",
                "Return Policy",
                "Delivery Information",
                "Prescription Policy",
              ].map((label) => (
                <li key={label}>
                  <span className="cursor-pointer opacity-80 transition-opacity hover:opacity-100">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wider opacity-60">
              Get in Touch
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 opacity-60" />
                <span className="opacity-80">+233 30 123 4567</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 opacity-60" />
                <span className="opacity-80">support@medserveghana.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 opacity-60" />
                <span className="opacity-80">Accra, Ghana</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 opacity-60" />
                <span className="opacity-80">Mon to Sat: 8:00 AM to 8:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/10 pt-6 text-center text-xs opacity-60">
          &copy; {new Date().getFullYear()} MedServe Ghana. All rights reserved. Licensed Pharmacy.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
