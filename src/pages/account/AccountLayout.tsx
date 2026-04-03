import { Link, Outlet, useLocation } from "react-router-dom";
import { User, Package, FileText, MapPin, Settings } from "lucide-react";

const accountNav = [
  { label: "Dashboard", to: "/account", icon: User },
  { label: "Orders", to: "/account/orders", icon: Package },
  { label: "Prescriptions", to: "/account/prescriptions", icon: FileText },
  { label: "Addresses", to: "/account/addresses", icon: MapPin },
  { label: "Profile", to: "/account/profile", icon: Settings },
];

const AccountLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="font-heading text-lg font-bold text-foreground">
            MedServe <span className="text-primary">Ghana</span>
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            Back to shop
          </Link>
        </div>
      </div>
      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <nav className="space-y-1">
            {accountNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  location.pathname === item.to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;
