import { Link, Outlet, useLocation } from "react-router-dom";
import { BarChart3, FileText, Home, LayoutDashboard, Package, PenSquare, Settings, ShoppingCart, Tag, UserCog, Users, Warehouse } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions";

const navItems = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, permission: "dashboard.view" },
  { label: "Medicines", to: "/admin/products", icon: Package, permission: "products.view" },
  { label: "Categories", to: "/admin/categories", icon: Tag, permission: "categories.view" },
  { label: "Orders", to: "/admin/orders", icon: ShoppingCart, permission: "orders.view" },
  { label: "Prescriptions", to: "/admin/prescriptions", icon: FileText, permission: "prescriptions.view" },
  { label: "Customers", to: "/admin/customers", icon: Users, permission: "customers.view" },
  { label: "Inventory", to: "/admin/inventory", icon: Warehouse, permission: "inventory.view" },
  { label: "Website Content", to: "/admin/content", icon: PenSquare, permission: "content.view" },
  { label: "Homepage", to: "/admin/homepage", icon: Home, permission: "content.view" },
  { label: "FAQs", to: "/admin/faq", icon: FileText, permission: "content.view" },
  { label: "Settings", to: "/admin/settings", icon: Settings, permission: "content.view" },
  { label: "Users", to: "/admin/users", icon: UserCog, permission: "users.view" },
  { label: "Reports", to: "/admin/reports", icon: BarChart3, permission: "reports.view" },
];

export default function AdminLayout() {
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-border bg-card p-4">
          <div className="rounded-3xl bg-primary px-4 py-5 text-primary-foreground">
            <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">MedServe Ghana</p>
            <h1 className="mt-2 text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <nav className="mt-6 space-y-1">
            {navItems.filter((item) => hasPermission(user?.role, item.permission)).map((item) => (
              <Link
                key={item.to}
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
              <div>
                <p className="text-sm text-muted-foreground">Manage medicines, orders, website content, and customer activity</p>
              </div>
              <div className="flex items-center gap-3">
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
