import { Link, Outlet, useLocation } from "react-router-dom";
import { CheckCircle, ClipboardList, Home, StickyNote, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Dashboard", to: "/pharmacist", icon: Home },
  { label: "Prescription Queue", to: "/pharmacist", icon: ClipboardList },
  { label: "Reviewed Prescriptions", to: "/pharmacist/reviewed", icon: CheckCircle },
  { label: "Notes", to: "/pharmacist/notes", icon: StickyNote },
  { label: "Profile", to: "/pharmacist/profile", icon: User },
];

export default function PharmacistLayout() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[240px_1fr]">
        <aside className="border-r border-border bg-card p-4">
          <div className="rounded-3xl bg-primary px-4 py-5 text-primary-foreground">
            <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">MedServe Ghana</p>
            <h1 className="mt-2 text-2xl font-bold">Pharmacist Console</h1>
          </div>
          <nav className="mt-6 space-y-1">
            {navItems.map((item) => (
              <Link
                key={`${item.label}-${item.to}`}
                to={item.to}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm ${location.pathname === item.to ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div>
          <header className="border-b border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
              <p className="text-sm text-muted-foreground">Prescription review queue, notes, and patient follow-up</p>
              <div className="flex gap-3">
                <Button asChild variant="outline"><Link to="/">View public site</Link></Button>
                <Button variant="outline" onClick={() => void logout()}>Logout</Button>
              </div>
            </div>
          </header>
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
