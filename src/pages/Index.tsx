import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, ShieldCheck, Truck, Stethoscope } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import { useBootstrap } from "@/hooks/use-bootstrap";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

const icons = [ShieldCheck, Stethoscope, Truck, BadgeCheck];

export default function Index() {
  const { data } = useBootstrap();
  const site = data?.site;
  const navigation = data?.navigation;
  const homepage = data?.homepage;
  const hero = homepage?.hero;
  const announcements = homepage?.announcements || [];
  const trustIndicators = homepage?.trustIndicators || [];
  const benefits = homepage?.benefits || [];
  const faqItems = data?.faq || [];

  return (
    <PublicLayout>
      <section className="border-b border-border bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container py-12 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                {hero?.eyebrow || site?.announcementBar || "Online pharmacy support"}
              </div>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
                  {hero?.title || "Order everyday medicines with support from a pharmacy team you can trust."}
                </h1>
                <p className="max-w-2xl text-lg text-muted-foreground">
                  {hero?.subtitle || "Shop essentials, upload prescriptions securely, and choose delivery or pickup with clear updates at every step."}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/shop">{hero?.primaryCtaLabel || navigation?.primaryCtaLabel || "Shop"}</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/upload-prescription">{hero?.secondaryCtaLabel || navigation?.prescriptionCtaLabel || "Upload Prescription"}</Link>
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {announcements.map((item) => (
                  <div key={item} className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4">
              <Card className="rounded-3xl border-border bg-card p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Live snapshot</p>
                <p className="mt-3 text-4xl font-bold text-primary">{hero?.statValue || "Live"}</p>
                <p className="text-sm text-muted-foreground">{hero?.statLabel || "Pharmacy updates and service information"}</p>
                <div className="mt-6 grid gap-3">
                  {trustIndicators.map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl bg-secondary px-4 py-3 text-sm">
                      <BadgeCheck className="h-4 w-4 text-primary" />
                      {item}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-18">
        <div className="container">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">Built for everyday pharmacy needs</h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">Real support, clear pricing, and reliable order updates across the customer journey.</p>
            </div>
            <Link to="/how-it-works" className="hidden items-center gap-2 text-sm font-medium text-primary md:inline-flex">
              See how it works <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {benefits.map((benefit, index) => {
              const Icon = icons[index % icons.length];
              return (
                <Card key={benefit.title} className="rounded-3xl p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{benefit.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-secondary/60 py-14 md:py-18">
        <div className="container">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Shop popular categories</h2>
            <p className="mt-2 text-muted-foreground">Browse Ghana-friendly essentials across common pharmacy needs.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {(data?.categories || []).slice(0, 8).map((category) => (
              <Link key={category.id} to={`/shop?category=${category.slug}`} className="rounded-3xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="text-sm text-primary">{category.productCount} products</div>
                <h3 className="mt-2 text-xl font-semibold">{category.name}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{category.heroText || category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-18">
        <div className="container">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">Ready to order</h2>
              <p className="mt-2 text-muted-foreground">Popular items from the live catalogue.</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/shop">Browse all products</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(data?.featuredProducts || []).map((product) => (
              <Link key={product.id} to={`/product/${product.slug}`} className="rounded-3xl border border-border bg-card p-6 transition hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{product.categoryName}</p>
                    <h3 className="mt-1 text-xl font-semibold">{product.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{product.brand}</p>
                  </div>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">{product.stockStatus}</span>
                </div>
                <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-lg font-semibold text-primary">{formatCurrency(product.price)}</span>
                  <span className="text-sm text-muted-foreground">{product.prescriptionRequired ? "Prescription required" : "Over-the-counter"}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-foreground py-14 text-primary-foreground">
        <div className="container grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-3xl font-bold">Common questions</h2>
            <p className="mt-3 text-sm text-primary-foreground/75">Everything customers ask most often before placing an order or submitting a prescription.</p>
          </div>
          <div className="grid gap-4">
            {faqItems.slice(0, 4).map((item) => (
              <div key={item.question} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <h3 className="font-semibold">{item.question}</h3>
                <p className="mt-2 text-sm leading-6 text-primary-foreground/75">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
