import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from "lucide-react";

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [fulfilment, setFulfilment] = useState<"delivery" | "pickup">("delivery");
  const [submitted, setSubmitted] = useState(false);

  const deliveryFee = fulfilment === "delivery" ? (subtotal > 100 ? 0 : 15) : 0;
  const total = subtotal + deliveryFee;

  if (submitted) {
    return (
      <PublicLayout>
        <section className="py-20">
          <div className="container">
            <div className="mx-auto max-w-lg text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
              <h1 className="mb-4 text-3xl font-bold text-foreground">Order placed successfully</h1>
              <p className="mb-8 text-muted-foreground">
                Thank you for your order. We will send you a confirmation shortly. You can track your order status from your account.
              </p>
              <Button onClick={() => navigate("/shop")}>Continue Shopping</Button>
            </div>
          </div>
        </section>
      </PublicLayout>
    );
  }

  if (items.length === 0) {
    return (
      <PublicLayout>
        <section className="py-20">
          <div className="container">
            <div className="mx-auto max-w-lg text-center">
              <h1 className="mb-4 text-2xl font-bold text-foreground">Your cart is empty</h1>
              <p className="mb-6 text-muted-foreground">Add some items to your cart before checking out.</p>
              <Button onClick={() => navigate("/shop")}>Browse Medicines</Button>
            </div>
          </div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="py-10 md:py-16">
        <div className="container">
          <h1 className="mb-8 text-3xl font-bold text-foreground">Checkout</h1>
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* Form */}
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Fulfilment method</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFulfilment("delivery")}
                    className={`flex-1 rounded-lg border-2 p-4 text-center text-sm font-medium transition-colors ${
                      fulfilment === "delivery" ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <div className="font-semibold">Delivery</div>
                    <div className="mt-1 text-xs text-muted-foreground">Delivered to your door</div>
                  </button>
                  <button
                    onClick={() => setFulfilment("pickup")}
                    className={`flex-1 rounded-lg border-2 p-4 text-center text-sm font-medium transition-colors ${
                      fulfilment === "pickup" ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <div className="font-semibold">Pickup</div>
                    <div className="mt-1 text-xs text-muted-foreground">Collect from our pharmacy</div>
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Contact details</h2>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Full name</label>
                      <Input placeholder="Enter your full name" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Phone number</label>
                      <Input placeholder="e.g. 024 123 4567" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                    <Input type="email" placeholder="you@example.com" />
                  </div>
                </div>
              </div>

              {fulfilment === "delivery" && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="mb-4 text-lg font-semibold text-foreground">Delivery address</h2>
                  <Textarea placeholder="Enter your full delivery address including area and landmark" rows={3} />
                </div>
              )}

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Order notes (optional)</h2>
                <Textarea placeholder="Any special instructions for your order" rows={2} />
              </div>
            </div>

            {/* Summary */}
            <div className="h-fit rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Order summary</h2>
              <div className="mb-4 space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium text-foreground">GH₵ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-t border-border pt-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">GH₵ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-foreground">{deliveryFee === 0 ? "Free" : `GH₵ ${deliveryFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary">GH₵ {total.toFixed(2)}</span>
                </div>
              </div>
              <Button
                className="mt-6 w-full"
                size="lg"
                onClick={() => {
                  clearCart();
                  setSubmitted(true);
                }}
              >
                Place Order
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Payment will be collected on delivery or at pickup
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Checkout;
