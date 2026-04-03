import { Link } from "react-router-dom";
import { Pill, Thermometer, Apple, Baby, Sparkles, Heart } from "lucide-react";

const categories = [
  { icon: Pill, name: "Pain Relief", slug: "pain-relief", count: 48 },
  { icon: Thermometer, name: "Cold and Flu", slug: "cold-flu", count: 35 },
  { icon: Apple, name: "Vitamins and Supplements", slug: "vitamins", count: 62 },
  { icon: Baby, name: "Baby Care", slug: "baby-care", count: 41 },
  { icon: Sparkles, name: "Personal Care", slug: "personal-care", count: 55 },
  { icon: Heart, name: "Medical Devices", slug: "medical-devices", count: 28 },
];

const CategoriesSection = () => {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Shop by category
          </h2>
          <p className="text-lg text-muted-foreground">
            Find what you need quickly across our well-stocked product categories.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/shop?category=${cat.slug}`}
              className="group flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <cat.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-foreground">{cat.name}</h3>
              <span className="text-xs text-muted-foreground">{cat.count} products</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
