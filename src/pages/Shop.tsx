import PublicLayout from "@/components/layout/PublicLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, Filter } from "lucide-react";
import { useState } from "react";

const sampleProducts = [
  { id: 1, name: "Paracetamol 500mg", brand: "Efpac", price: 8.50, category: "Pain Relief", prescription: false, inStock: true },
  { id: 2, name: "Amoxicillin 250mg Capsules", brand: "Letap", price: 22.00, category: "Antibiotics", prescription: true, inStock: true },
  { id: 3, name: "Vitamin C 1000mg", brand: "Nature's Own", price: 35.00, category: "Vitamins", prescription: false, inStock: true },
  { id: 4, name: "Ibuprofen 400mg", brand: "Kinapharma", price: 12.00, category: "Pain Relief", prescription: false, inStock: true },
  { id: 5, name: "Cetirizine 10mg", brand: "Danadams", price: 15.00, category: "Allergy", prescription: false, inStock: true },
  { id: 6, name: "Multivitamin Tablets", brand: "Centrum", price: 65.00, category: "Vitamins", prescription: false, inStock: true },
  { id: 7, name: "ORS Sachets (Pack of 10)", brand: "WHO Formula", price: 18.00, category: "Baby Care", prescription: false, inStock: true },
  { id: 8, name: "Cough Syrup 100ml", brand: "Benylin", price: 28.00, category: "Cold and Flu", prescription: false, inStock: false },
  { id: 9, name: "Blood Pressure Monitor", brand: "Omron", price: 320.00, category: "Medical Devices", prescription: false, inStock: true },
  { id: 10, name: "Hand Sanitizer 500ml", brand: "Dettol", price: 25.00, category: "Personal Care", prescription: false, inStock: true },
  { id: 11, name: "Baby Diaper Rash Cream", brand: "Sudocrem", price: 45.00, category: "Baby Care", prescription: false, inStock: true },
  { id: 12, name: "Antacid Tablets (Pack of 20)", brand: "Maalox", price: 14.00, category: "Digestive Health", prescription: false, inStock: true },
];

const categories = ["All", "Pain Relief", "Vitamins", "Cold and Flu", "Baby Care", "Personal Care", "Medical Devices", "Allergy", "Antibiotics"];

const Shop = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = sampleProducts.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <PublicLayout>
      <section className="bg-card py-10">
        <div className="container">
          <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">Shop Medicines</h1>
          <p className="mb-8 text-muted-foreground">Browse our full range of genuine medicines and health products.</p>

          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search medicines, brands..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <div key={product.id} className="group rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                  </div>
                  {product.prescription && (
                    <Badge variant="secondary" className="shrink-0 text-xs">Rx</Badge>
                  )}
                </div>
                <div className="mb-1 text-xs text-muted-foreground">{product.category}</div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">GH₵ {product.price.toFixed(2)}</span>
                  {!product.inStock && (
                    <span className="text-xs font-medium text-destructive">Out of stock</span>
                  )}
                </div>
                <Button
                  size="sm"
                  className="w-full gap-2"
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {product.prescription ? "Requires Prescription" : "Add to Cart"}
                </Button>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
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
