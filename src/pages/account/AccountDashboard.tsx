import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/api";
import type { Order, Prescription, Product } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";

type DashboardResponse = {
  summary: {
    totalOrders: number;
    openPrescriptions: number;
    savedAddresses: number;
  };
  orders: Order[];
  prescriptions: Prescription[];
  addresses: Array<{ id: number; label: string; line1: string; area: string; city: string }>;
  suggestedProducts: Product[];
};

export default function AccountDashboard() {
  const { data } = useQuery({
    queryKey: ["customer-dashboard"],
    queryFn: () => apiRequest<DashboardResponse>("/dashboard/customer"),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Your dashboard</h1>
        <p className="mt-2 text-muted-foreground">Recent activity, reorder options, and prescription updates in one place.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr_0.9fr]">
        <Card className="rounded-3xl p-6">
          <p className="text-sm text-muted-foreground">Recent orders</p>
          <p className="mt-2 text-3xl font-bold">{data?.summary.totalOrders ?? 0}</p>
          <p className="mt-2 text-sm text-muted-foreground">Orders you can review, track, or reorder.</p>
        </Card>
        <Card className="rounded-3xl p-6">
          <p className="text-sm text-muted-foreground">Open prescriptions</p>
          <p className="mt-2 text-3xl font-bold">{data?.summary.openPrescriptions ?? 0}</p>
          <p className="mt-2 text-sm text-muted-foreground">Items still waiting for pharmacist action.</p>
        </Card>
        <Card className="rounded-3xl p-6">
          <p className="text-sm text-muted-foreground">Saved addresses</p>
          <p className="mt-2 text-3xl font-bold">{data?.summary.savedAddresses ?? 0}</p>
          <p className="mt-2 text-sm text-muted-foreground">Delivery details ready for your next checkout.</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-3xl p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Recent orders</h2>
              <p className="text-sm text-muted-foreground">Your latest order activity.</p>
            </div>
            <Button asChild variant="outline"><Link to="/account/orders">See all orders</Link></Button>
          </div>
          <div className="mt-5 space-y-4">
            {(data?.orders || []).length ? data?.orders.map((order) => (
              <div key={order.id} className="rounded-2xl bg-secondary p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(order.total)}</p>
                    <p className="text-sm text-muted-foreground">{order.status}</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                <p className="font-medium">You have not placed any orders yet.</p>
                <p className="mt-2 text-sm text-muted-foreground">When you place your first order, it will appear here.</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="rounded-3xl p-6">
          <h2 className="text-xl font-semibold">Helpful next steps</h2>
          <div className="mt-5 grid gap-3">
            <Button asChild><Link to="/shop">Browse the catalogue</Link></Button>
            <Button asChild variant="outline"><Link to="/upload-prescription">Upload a prescription</Link></Button>
            <Button asChild variant="outline"><Link to="/account/addresses">Manage addresses</Link></Button>
          </div>
          <div className="mt-6 space-y-3">
            {(data?.prescriptions || []).slice(0, 3).map((prescription) => (
              <div key={prescription.id} className="rounded-2xl bg-secondary p-4">
                <p className="font-medium">{prescription.reference}</p>
                <p className="mt-1 text-sm text-muted-foreground">{prescription.status}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
