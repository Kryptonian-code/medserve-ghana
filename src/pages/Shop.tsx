import PublicLayout from "@/components/layout/PublicLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Link, useSearchParams } from "react-router-dom";

const Shop = () => {
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const { addItem } = useCart();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = products?.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "all" || (p.categories as any)?.slug === activeCategory;
    return matchSearch && matchCat;
  });

  const categoryFilters = [{ name: "All", slug: "all" }, ...(categories || [])];

  return (
    <PublicLayout>
      <section className="bg-card py-10">
        <div className="container">
          <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">Shop Medicines</h1>
          <p className="mb-8 text-muted-foreground">Browse our full range of genuine medicines and health products.</p>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search medicines, brands..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            {categoryFilters.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === cat.slug
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="py-16 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered?.map((product) => (
                <div key={product.id} className="group rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
                  <div className="mb-3 flex items-start justify-between">
                    <Link to={`/product/${product.slug}`} className="flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-primary">{product.name}</h3>
                      <p className="text-xs text-muted-foreground">{product.brand}</p>
                    </Link>
                    {product.requires_prescription && (
                      <Badge variant="secondary" className="shrink-0 text-xs">Rx</Badge>
                    )}
                  </div>
                  <div className="mb-1 text-xs text-muted-foreground">{(product.categories as any)?.name}</div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">GH₵ {Number(product.price).toFixed(2)}</span>
                    {!product.in_stock && (
                      <span className="text-xs font-medium text-destructive">Out of stock</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="w-full gap-2"
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
                </div>
              ))}
            </div>
          )}

          {filtered && filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-lg text-muted-foreground">No products match your search. Try a different keyword or category.</p>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export default Shop;
