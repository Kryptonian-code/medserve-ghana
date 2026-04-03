import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useBootstrap } from "@/hooks/use-bootstrap";

const Footer = () => {
  const { data } = useBootstrap();
  const site = data?.site;
  const navigation = data?.navigation;
  const footerLinks = navigation?.footerLinks?.length
    ? navigation.footerLinks
    : [
        { label: "Shop", to: "/shop" },
        { label: "Categories", to: "/shop" },
        { label: "Upload Prescription", to: "/upload-prescription" },
        { label: "How It Works", to: "/how-it-works" },
        { label: "FAQ", to: "/faq" },
        { label: "Contact", to: "/contact" },
      ];
  const policyLinks = navigation?.policyLinks || [];

  return (
    <footer className="border-t border-border bg-foreground text-primary-foreground">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">{site?.logoLetter || "M"}</span>
              </div>
              <span className="font-heading text-lg font-bold">{site?.brandName || "MedServe Ghana"}</span>
            </div>
            <p className="text-sm leading-relaxed opacity-80">
              {site?.tagline || "Online pharmacy support for everyday health and pharmacist-reviewed prescriptions."}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wider opacity-60">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.map((link, index) => (
                <li key={`${link.label}-${link.to}-${index}`}>
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
              {policyLinks.map((link, index) => (
                <li key={`${link.label}-${link.to}-${index}`}>
                  <Link to={link.to} className="opacity-80 transition-opacity hover:opacity-100">
                    {link.label}
                  </Link>
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
                <span className="opacity-80">{site?.supportPhone?.join(" / ") || ""}</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 opacity-60" />
                <span className="opacity-80">{site?.supportEmail || ""}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 opacity-60" />
                <span className="opacity-80">{site?.address || ""}</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 opacity-60" />
                <span className="opacity-80">{site?.businessHours?.[0] || ""}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/10 pt-6 text-center text-xs opacity-60">
          &copy; {new Date().getFullYear()} {site?.brandName || "MedServe Ghana"}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
