import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: user ? `${user.first_name} ${user.last_name}` : "",
    phone: user?.phone || "",
    email: user?.email || "",
    fulfilmentType: "delivery",
    address: "",
    notes: "",
  });

  const deliveryFee = useMemo(() => (form.fulfilmentType === "delivery" ? (subtotal >= 100 ? 0 : 15) : 0), [form.fulfilmentType, subtotal]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    setIsSubmitting(true);
    try {
      await apiRequest("/orders", {
        method: "POST",
        body: {
          phone: form.phone,
          notes: form.notes,
          fulfilmentType: form.fulfilmentType,
          address: {
            recipientName: form.fullName,
            line1: form.address,
          },
          items: items.map((item) => ({
            id: Number(item.id),
            quantity: item.quantity,
          })),
        },
      });
      clearCart();
      setSubmitted(true);
      toast.success("Order placed successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to complete that action right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <PublicLayout>
        <section className="py-20">
          <div className="container">
            <div className="mx-auto max-w-lg rounded-3xl border border-border bg-card p-10 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">Order placed successfully</h1>
              <p className="mt-3 text-muted-foreground">Your order has been saved. You can follow updates from your account dashboard.</p>
              <div className="mt-6 flex justify-center gap-3">
                <Button asChild><Link to="/account/orders">View orders</Link></Button>
                <Button asChild variant="outline"><Link to="/shop">Continue shopping</Link></Button>
              </div>
            </div>
          </div>
        </section>
      </PublicLayout>
    );
  }

  if (!items.length) {
    return (
      <PublicLayout>
        <section className="py-20">
          <div className="container">
            <div className="mx-auto max-w-lg rounded-3xl border border-border bg-card p-10 text-center">
              <h1 className="text-2xl font-semibold">Your cart is empty</h1>
              <p className="mt-2 text-muted-foreground">Add a few items to your cart before moving to checkout.</p>
              <Button asChild className="mt-6"><Link to="/shop">Browse the catalogue</Link></Button>
            </div>
          </div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="py-10 md:py-14">
        <div className="container">
          <h1 className="text-3xl font-bold">Checkout</h1>
          {!user ? (
            <div className="mt-4 rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
              Please sign in to place your order and track it from your account.
            </div>
          ) : null}

          <form className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold">Fulfilment method</h2>
                <div className="mt-4 flex gap-3">
                  {[
                    { label: "Delivery", value: "delivery", helper: "Delivered to your address" },
                    { label: "Pickup", value: "pickup", helper: "Collect from the pharmacy" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm({ ...form, fulfilmentType: option.value })}
                      className={`flex-1 rounded-2xl border px-4 py-4 text-left ${form.fulfilmentType === option.value ? "border-primary bg-primary/5" : "border-border bg-background"}`}
                    >
                      <div className="font-semibold">{option.label}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{option.helper}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold">Contact details</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium">Full name</label>
                    <Input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} placeholder="Enter your full name" required />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Phone number</label>
                    <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="024 123 4567" required />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Email address</label>
                    <Input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" required />
                  </div>
                </div>
              </div>

              {form.fulfilmentType === "delivery" ? (
                <div className="rounded-3xl border border-border bg-card p-6">
                  <h2 className="text-lg font-semibold">Delivery address</h2>
                  <label className="mt-4 block text-sm font-medium">Address details</label>
                  <Textarea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Enter your full address, area, and a useful landmark" rows={4} required />
                </div>
              ) : null}

              <div className="rounded-3xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold">Order notes</h2>
                <Textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Share any delivery notes or requests for the team." rows={4} className="mt-4" />
              </div>
            </div>

            <div className="h-fit rounded-3xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Order summary</h2>
              <div className="mt-5 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty {item.quantity}</p>
                    </div>
                    <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee)}</span>
                </div>
                <div className="flex justify-between pt-2 text-base font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(subtotal + deliveryFee)}</span>
                </div>
              </div>
              <Button className="mt-6 w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Placing order..." : "Place order"}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
}
