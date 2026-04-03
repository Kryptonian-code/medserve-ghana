import { useParams, Link } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, AlertTriangle, ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("slug", slug!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ["related-products", product?.category_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", product!.category_id!)
        .neq("id", product!.id)
        .eq("is_active", true)
        .limit(4);
      if (error) throw error;
      return data;
    },
    enabled: !!product?.category_id,
  });

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container py-20 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </PublicLayout>
    );
  }

  if (!product) {
    return (
      <PublicLayout>
        <div className="container py-20 text-center">
          <h1 className="mb-4 text-2xl font-bold text-foreground">Product not found</h1>
          <p className="mb-6 text-muted-foreground">We could not find the product you are looking for.</p>
          <Button asChild><Link to="/shop">Back to Shop</Link></Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="py-8 md:py-12">
        <div className="container">
          <Link to="/shop" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" /> Back to shop
          </Link>

          <div className="grid gap-10 md:grid-cols-2">
            {/* Image */}
            <div className="flex items-center justify-center rounded-xl border border-border bg-card p-12">
              <div className="text-center text-muted-foreground">
                <div className="mx-auto mb-2 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                  <ShoppingCart className="h-12 w-12 text-primary" />
                </div>
                <p className="text-sm">Product image</p>
              </div>
            </div>

            {/* Info */}
            <div>
              {product.categories && (
                <Link to={`/shop?category=${(product.categories as any).slug}`} className="mb-2 inline-block text-xs font-medium uppercase tracking-wider text-primary hover:underline">
                  {(product.categories as any).name}
                </Link>
              )}
              <h1 className="mb-2 text-3xl font-bold text-foreground">{product.name}</h1>
              {product.brand && <p className="mb-4 text-muted-foreground">by {product.brand}</p>}

              <div className="mb-4 flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">GH₵ {Number(product.price).toFixed(2)}</span>
                {product.requires_prescription && <Badge variant="secondary">Prescription Required</Badge>}
                {!product.in_stock && <Badge variant="destructive">Out of Stock</Badge>}
              </div>

              {product.description && (
                <p className="mb-6 leading-relaxed text-muted-foreground">{product.description}</p>
              )}

              <Button
                size="lg"
                className="mb-6 w-full gap-2 md:w-auto"
                disabled={!product.in_stock || product.requires_prescription}
                onClick={() =>
                  addItem({
                    id: product.id,
                    name: product.name,
                    brand: product.brand || "",
                    price: Number(product.price),
                    slug: product.slug,
                    requires_prescription: product.requires_prescription || false,
                  })
                }
              >
                <ShoppingCart className="h-4 w-4" />
                {product.requires_prescription ? "Requires Prescription" : "Add to Cart"}
              </Button>

              {product.usage_guidance && (
                <div className="mb-4 rounded-lg bg-secondary p-4">
                  <h3 className="mb-2 text-sm font-semibold text-foreground">Usage guidance</h3>
                  <p className="text-sm text-muted-foreground">{product.usage_guidance}</p>
                </div>
              )}

              {product.warnings && (
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <AlertTriangle className="h-4 w-4 text-warning" /> Warnings
                  </h3>
                  <p className="text-sm text-muted-foreground">{product.warnings}</p>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="mb-6 text-2xl font-bold text-foreground">Related products</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((p) => (
                  <Link key={p.id} to={`/product/${p.slug}`} className="group rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
                    <h3 className="font-semibold text-foreground group-hover:text-primary">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">{p.brand}</p>
                    <p className="mt-2 text-lg font-bold text-primary">GH₵ {Number(p.price).toFixed(2)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export default ProductDetail;
