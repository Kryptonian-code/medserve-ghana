import { Link, Outlet, useLocation } from "react-router-dom";
import { Home, MapPin, Package, Settings, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", to: "/account", icon: Home },
  { label: "Orders", to: "/account/orders", icon: Package },
  { label: "Prescriptions", to: "/account/prescriptions", icon: User },
  { label: "Addresses", to: "/account/addresses", icon: MapPin },
  { label: "Profile", to: "/account/profile", icon: Settings },
];

export default function AccountLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <Link to="/" className="text-xl font-bold">MedServe Ghana</Link>
            <p className="text-sm text-muted-foreground">Customer account centre</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-sm">
              <div className="font-medium">{user?.first_name} {user?.last_name}</div>
              <div className="text-muted-foreground">{user?.email}</div>
            </div>
            <Button variant="outline" onClick={() => void logout()}>Logout</Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-1 rounded-3xl border border-border bg-card p-3">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm ${location.pathname === item.to ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </aside>
          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
