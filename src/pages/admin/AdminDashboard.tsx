import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/api";
import type { Order, Prescription } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";

type AdminDashboardResponse = {
  summary: {
    orders: number;
    revenue: number;
    awaitingReview: number;
    lowStock: number;
  };
  recentOrders: Order[];
  recentPrescriptions: Prescription[];
  topCategories: Array<{ name: string; total_products: number }>;
  inventoryAlerts: Array<{ name: string; stock_quantity: number }>;
  recentCustomers: Array<{ first_name: string; last_name: string; email: string; created_at: string }>;
  notices: string[];
};

export default function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => apiRequest<AdminDashboardResponse>("/dashboard/admin"),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin dashboard</h1>
        <p className="mt-2 text-muted-foreground">A working view of orders, prescriptions, stock pressure, and customer activity.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr_1fr_1fr]">
        <Card className="rounded-3xl p-6"><p className="text-sm text-muted-foreground">Total orders</p><p className="mt-2 text-3xl font-bold">{data?.summary.orders ?? 0}</p></Card>
        <Card className="rounded-3xl p-6"><p className="text-sm text-muted-foreground">Revenue summary</p><p className="mt-2 text-3xl font-bold text-primary">{formatCurrency(data?.summary.revenue ?? 0)}</p></Card>
        <Card className="rounded-3xl p-6"><p className="text-sm text-muted-foreground">Prescriptions awaiting review</p><p className="mt-2 text-3xl font-bold">{data?.summary.awaitingReview ?? 0}</p></Card>
        <Card className="rounded-3xl p-6"><p className="text-sm text-muted-foreground">Low stock alerts</p><p className="mt-2 text-3xl font-bold">{data?.summary.lowStock ?? 0}</p></Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-3xl p-6">
          <h2 className="text-xl font-semibold">Recent orders</h2>
          <div className="mt-5 space-y-4">
            {(data?.recentOrders || []).map((order) => (
              <div key={order.id} className="rounded-2xl bg-secondary p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">{order.customerName} • {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(order.total)}</p>
                    <p className="text-sm text-muted-foreground">{order.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-3xl p-6">
            <h2 className="text-xl font-semibold">Operational notices</h2>
            <div className="mt-4 space-y-3">
              {(data?.notices || []).map((notice) => (
                <div key={notice} className="rounded-2xl bg-secondary p-4 text-sm text-muted-foreground">{notice}</div>
              ))}
            </div>
          </Card>
          <Card className="rounded-3xl p-6">
            <h2 className="text-xl font-semibold">Low stock watchlist</h2>
            <div className="mt-4 space-y-3">
              {(data?.inventoryAlerts || []).map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-2xl bg-secondary p-4">
                  <span>{item.name}</span>
                  <span className="text-sm text-muted-foreground">{item.stock_quantity} left</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-3xl p-6">
          <h2 className="text-xl font-semibold">Recent prescriptions</h2>
          <div className="mt-4 space-y-3">
            {(data?.recentPrescriptions || []).map((item) => (
              <div key={item.id} className="rounded-2xl bg-secondary p-4">
                <p className="font-medium">{item.reference}</p>
                <p className="text-sm text-muted-foreground">{item.customerName}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.status}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="rounded-3xl p-6">
          <h2 className="text-xl font-semibold">Top-selling categories</h2>
          <div className="mt-4 space-y-3">
            {(data?.topCategories || []).map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-2xl bg-secondary p-4">
                <span>{item.name}</span>
                <span className="text-sm text-muted-foreground">{item.total_products} products</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="rounded-3xl p-6">
          <h2 className="text-xl font-semibold">Customer activity summary</h2>
          <div className="mt-4 space-y-3">
            {(data?.recentCustomers || []).map((customer) => (
              <div key={customer.email} className="rounded-2xl bg-secondary p-4">
                <p className="font-medium">{customer.first_name} {customer.last_name}</p>
                <p className="text-sm text-muted-foreground">{customer.email}</p>
                <p className="mt-1 text-sm text-muted-foreground">Joined {formatDate(customer.created_at)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
