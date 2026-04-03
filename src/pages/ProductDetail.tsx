import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ChevronLeft, ShieldCheck, ShoppingCart } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/api";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/contexts/CartContext";

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();

  const { data, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => apiRequest<{ product: Product; relatedProducts: Product[] }>(`/products/${slug}`),
    enabled: Boolean(slug),
  });

  const product = data?.product;
  const relatedProducts = data?.relatedProducts || [];

  if (isLoading) {
    return <PublicLayout><div className="container py-20"><div className="h-80 animate-pulse rounded-3xl bg-secondary" /></div></PublicLayout>;
  }

  if (!product) {
    return (
      <PublicLayout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-semibold">Product not found</h1>
          <p className="mt-2 text-muted-foreground">The product you are looking for is no longer available in the catalogue.</p>
          <Button asChild className="mt-6"><Link to="/shop">Back to shop</Link></Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="py-8 md:py-12">
        <div className="container">
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            Back to shop
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 to-secondary p-8">
              <div className="flex h-full min-h-[360px] flex-col justify-between rounded-3xl bg-card p-8">
                <div>
                  <p className="text-sm text-muted-foreground">{product.categoryName}</p>
                  <h1 className="mt-3 text-3xl font-bold">{product.name}</h1>
                  <p className="mt-2 text-muted-foreground">{product.brand}</p>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{product.stockStatus}</Badge>
                    {product.prescriptionRequired && <Badge>Prescription required</Badge>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-primary">{formatCurrency(product.price)}</span>
                    {product.comparePrice ? <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.comparePrice)}</span> : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold">Full product information</h2>
                <p className="mt-3 leading-7 text-muted-foreground">{product.description}</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-secondary p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Dosage form</p>
                    <p className="mt-2 font-medium">{product.dosageForm || "See pack label"}</p>
                  </div>
                  <div className="rounded-2xl bg-secondary p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pack size</p>
                    <p className="mt-2 font-medium">{product.packSize || "Standard pack"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold">Usage guidance</h2>
                <p className="mt-3 leading-7 text-muted-foreground">{product.usageGuidance}</p>
              </div>

              <div className="rounded-3xl border border-warning/20 bg-warning/5 p-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Warnings
                </h2>
                <p className="mt-3 leading-7 text-muted-foreground">{product.warnings}</p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <h2 className="font-semibold">Dispensing note</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {product.prescriptionRequired
                        ? "This product is supplied only after pharmacist review of a valid prescription."
                        : "This item is available for regular checkout while stock lasts."}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    disabled={product.stockStatus === "Out of Stock" || product.prescriptionRequired}
                    onClick={() => addItem({
                      id: String(product.id),
                      name: product.name,
                      brand: product.brand,
                      price: product.price,
                      slug: product.slug,
                      requires_prescription: product.prescriptionRequired,
                    })}
                    className="gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {product.prescriptionRequired ? "Upload a prescription first" : "Add to cart"}
                  </Button>
                  {product.prescriptionRequired ? (
                    <Button asChild variant="outline">
                      <Link to="/upload-prescription">Upload prescription</Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {relatedProducts.length > 0 ? (
            <div className="mt-12">
              <h2 className="text-2xl font-bold">Related products</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {relatedProducts.map((item) => (
                  <Link key={item.id} to={`/product/${item.slug}`} className="rounded-3xl border border-border bg-card p-5 transition hover:shadow-md">
                    <p className="text-sm text-muted-foreground">{item.categoryName}</p>
                    <h3 className="mt-2 font-semibold">{item.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.brand}</p>
                    <p className="mt-4 text-primary">{formatCurrency(item.price)}</p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </PublicLayout>
  );
}
