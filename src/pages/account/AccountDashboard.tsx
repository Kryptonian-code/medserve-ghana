import { Package, FileText, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AccountDashboard = () => (
  <div>
    <h1 className="mb-6 text-2xl font-bold text-foreground">Welcome back</h1>
    <div className="grid gap-4 sm:grid-cols-3">
      {[
        { icon: Package, label: "Orders", value: "0", desc: "You have not placed any orders yet.", to: "/account/orders" },
        { icon: FileText, label: "Prescriptions", value: "0", desc: "No prescriptions submitted yet.", to: "/account/prescriptions" },
        { icon: MapPin, label: "Addresses", value: "0", desc: "No saved addresses.", to: "/account/addresses" },
      ].map((card) => (
        <div key={card.label} className="rounded-xl border border-border bg-card p-5">
          <card.icon className="mb-3 h-6 w-6 text-primary" />
          <h3 className="mb-1 text-sm font-semibold text-foreground">{card.label}</h3>
          <p className="mb-3 text-xs text-muted-foreground">{card.desc}</p>
          <Link to={card.to}>
            <Button variant="outline" size="sm">View</Button>
          </Link>
        </div>
      ))}
    </div>
    <div className="mt-8">
      <h2 className="mb-3 text-lg font-semibold text-foreground">Quick actions</h2>
      <div className="flex flex-wrap gap-3">
        <Link to="/shop"><Button size="sm">Shop Medicines</Button></Link>
        <Link to="/upload-prescription"><Button size="sm" variant="outline">Upload Prescription</Button></Link>
      </div>
    </div>
  </div>
);

export default AccountDashboard;
