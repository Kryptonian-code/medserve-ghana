import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, ShoppingCart } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/contexts/CartContext";

const availabilityOptions = [
  { label: "All availability", value: "all" },
  { label: "In stock", value: "in-stock" },
  { label: "Low stock", value: "low-stock" },
];

const prescriptionOptions = [
  { label: "All products", value: "all" },
  { label: "Over-the-counter", value: "otc" },
  { label: "Prescription required", value: "required" },
];

const sortOptions = [
  { label: "Most relevant", value: "relevance" },
  { label: "Price: Low to high", value: "price-low" },
  { label: "Price: High to low", value: "price-high" },
  { label: "Name", value: "name" },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("search") || "");
  const { addItem } = useCart();

  const query = useMemo(
    () => ({
      search: params.get("search") || "",
      category: params.get("category") || "all",
      availability: params.get("availability") || "all",
      prescription: params.get("prescription") || "all",
      sort: params.get("sort") || "relevance",
    }),
    [params]
  );

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiRequest<{ categories: Category[] }>("/categories"),
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", query],
    queryFn: () => {
      const queryString = new URLSearchParams(
        Object.entries(query).filter(([, value]) => value && value !== "all")
      ).toString();
      return apiRequest<{ products: Product[] }>(`/products${queryString ? `?${queryString}` : ""}`);
    },
  });

  const setFilter = (name: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === "all") next.delete(name);
    else next.set(name, value);
    setParams(next);
  };

  return (
    <PublicLayout>
      <section className="py-10 md:py-14">
        <div className="container">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold md:text-4xl">Shop medicines and health essentials</h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Search the live catalogue, browse by category, and filter by availability or prescription status.
              </p>
            </div>
            <div className="rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
              {(productsData?.products || []).length} products available
            </div>
          </div>

          <div className="grid gap-4 rounded-3xl border border-border bg-card p-5 md:grid-cols-[1.3fr_repeat(3,0.7fr)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") setFilter("search", search);
                }}
                placeholder="Search by medicine, brand, or need"
                className="pl-10"
              />
            </div>
            <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={query.availability} onChange={(event) => setFilter("availability", event.target.value)}>
              {availabilityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={query.prescription} onChange={(event) => setFilter("prescription", event.target.value)}>
              {prescriptionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={query.sort} onChange={(event) => setFilter("sort", event.target.value)}>
              {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button className={`rounded-full px-4 py-2 text-sm ${query.category === "all" ? "bg-primary text-primary-foreground" : "bg-secondary"}`} onClick={() => setFilter("category", "all")}>
              All categories
            </button>
            {(categoriesData?.categories || []).map((category) => (
              <button
                key={category.id}
                className={`rounded-full px-4 py-2 text-sm ${query.category === category.slug ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
                onClick={() => setFilter("category", category.slug)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-64 animate-pulse rounded-3xl bg-secondary" />
              ))}
            </div>
          ) : (productsData?.products || []).length > 0 ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {productsData?.products.map((product) => (
                <div key={product.id} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm text-muted-foreground">{product.categoryName}</div>
                      <Link to={`/product/${product.slug}`} className="mt-1 block text-xl font-semibold hover:text-primary">
                        {product.name}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">{product.brand}</p>
                    </div>
                    {product.prescriptionRequired && <Badge variant="secondary">Rx</Badge>}
                  </div>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">{product.description}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-lg font-semibold text-primary">{formatCurrency(product.price)}</span>
                    <span className="text-sm text-muted-foreground">{product.stockStatus}</span>
                  </div>
                  <div className="mt-5 flex gap-3">
                    <Button asChild variant="outline" className="flex-1">
                      <Link to={`/product/${product.slug}`}>View details</Link>
                    </Button>
                    <Button
                      className="flex-1 gap-2"
                      disabled={product.stockStatus === "Out of Stock" || product.prescriptionRequired}
                      onClick={() => addItem({
                        id: String(product.id),
                        name: product.name,
                        brand: product.brand,
                        price: product.price,
                        slug: product.slug,
                        requires_prescription: product.prescriptionRequired,
                      })}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {product.prescriptionRequired ? "Upload prescription" : "Add to cart"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-3xl border border-border bg-card p-10 text-center">
              <h2 className="text-xl font-semibold">No products matched that search</h2>
              <p className="mt-2 text-muted-foreground">Try another category, remove a filter, or search with a broader term.</p>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
