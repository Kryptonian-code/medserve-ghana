import { Package, ShoppingCart, FileText, Users, TrendingUp, DollarSign } from "lucide-react";

const stats = [
  { label: "Total Products", value: "156", icon: Package, change: "+12 this month" },
  { label: "Active Orders", value: "23", icon: ShoppingCart, change: "8 pending delivery" },
  { label: "Prescriptions", value: "14", icon: FileText, change: "5 awaiting review" },
  { label: "Customers", value: "1,247", icon: Users, change: "+89 this month" },
  { label: "Revenue (MTD)", value: "GH₵ 45,320", icon: DollarSign, change: "+18% vs last month" },
  { label: "Conversion Rate", value: "3.2%", icon: TrendingUp, change: "+0.4% improvement" },
];

const AdminDashboard = () => (
  <div>
    <h1 className="mb-6 text-2xl font-bold text-foreground">Dashboard Overview</h1>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{s.label}</span>
            <s.icon className="h-5 w-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">{s.value}</div>
          <div className="mt-1 text-xs text-muted-foreground">{s.change}</div>
        </div>
      ))}
    </div>
  </div>
);

export default AdminDashboard;
