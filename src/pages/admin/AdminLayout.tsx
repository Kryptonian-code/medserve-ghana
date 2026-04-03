import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, Tag, ShoppingCart, FileText,
  Users, Warehouse, PenSquare, HelpCircle, Home,
  Settings, UserCog, BarChart3,
} from "lucide-react";

const adminNav = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Categories", to: "/admin/categories", icon: Tag },
  { label: "Orders", to: "/admin/orders", icon: ShoppingCart },
  { label: "Prescriptions", to: "/admin/prescriptions", icon: FileText },
  { label: "Customers", to: "/admin/customers", icon: Users },
  { label: "Inventory", to: "/admin/inventory", icon: Warehouse },
  { label: "Content", to: "/admin/content", icon: PenSquare },
  { label: "FAQ", to: "/admin/faq", icon: HelpCircle },
  { label: "Homepage", to: "/admin/homepage", icon: Home },
  { label: "Settings", to: "/admin/settings", icon: Settings },
  { label: "Users and Roles", to: "/admin/users", icon: UserCog },
  { label: "Reports", to: "/admin/reports", icon: BarChart3 },
];

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card lg:block">
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link to="/admin" className="font-heading text-lg font-bold text-foreground">
            MedServe <span className="text-primary">Admin</span>
          </Link>
        </div>
        <nav className="space-y-0.5 p-3">
          {adminNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
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
      </aside>
      <div className="flex-1">
        <div className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
          <span className="text-sm text-muted-foreground">Admin Panel</span>
          <Link to="/" className="text-sm text-primary hover:underline">View Site</Link>
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
