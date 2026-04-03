import PublicLayout from "@/components/layout/PublicLayout";
import { useBootstrap } from "@/hooks/use-bootstrap";

export default function HowItWorks() {
  const { data } = useBootstrap();
  const steps = data?.homepage?.howItWorks || [];

  return (
    <PublicLayout>
      <section className="py-14 md:py-20">
        <div className="container">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold">How MedServe Ghana works</h1>
            <p className="mt-3 text-lg text-muted-foreground">A clear path from product selection or prescription upload through review, payment, and delivery or pickup.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-3xl border border-border bg-card p-6">
                <div className="text-sm text-primary">Step {index + 1}</div>
                <h2 className="mt-3 text-xl font-semibold">{step.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.description}</p>
              </div>
            ))}
            {!steps.length ? (
              <div className="rounded-3xl border border-dashed border-border bg-card p-6 md:col-span-3">
                <h2 className="text-xl font-semibold">Ordering guidance will appear here soon.</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">Check back shortly for a step-by-step guide to shopping, prescription review, payment, and delivery.</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
