import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { Order } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";

export default function AccountOrders() {
  const { data } = useQuery({
    queryKey: ["account-orders"],
    queryFn: () => apiRequest<{ orders: Order[] }>("/account/orders"),
  });

  return (
    <div>
      <h1 className="text-3xl font-bold">Orders</h1>
      <p className="mt-2 text-muted-foreground">Track delivery and pickup updates across all your orders.</p>

      <div className="mt-6 space-y-4">
        {(data?.orders || []).length ? data?.orders.map((order) => (
          <div key={order.id} className="rounded-3xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{order.orderNumber}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-primary">{formatCurrency(order.total)}</p>
                <p className="text-sm text-muted-foreground">{order.status}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {order.items.map((item) => (
                <div key={item.id} className="rounded-2xl bg-secondary p-4">
                  <p className="font-medium">{item.productName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Qty {item.quantity}</p>
                </div>
              ))}
            </div>
          </div>
        )) : (
          <div className="rounded-3xl border border-border bg-card p-10 text-center">
            <p className="text-lg font-medium">You have not placed any orders yet.</p>
            <p className="mt-2 text-muted-foreground">When you place your first order, it will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
