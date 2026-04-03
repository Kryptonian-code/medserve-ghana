import PublicLayout from "@/components/layout/PublicLayout";
import { useBootstrap } from "@/hooks/use-bootstrap";

export default function FAQ() {
  const { data } = useBootstrap();
  const faqItems = data?.faq || [];

  return (
    <PublicLayout>
      <section className="py-14 md:py-20">
        <div className="container max-w-4xl">
          <h1 className="text-4xl font-bold">Frequently asked questions</h1>
          <p className="mt-3 text-lg text-muted-foreground">Helpful answers about prescription review, delivery timelines, payments, and reorders.</p>
          <div className="mt-10 space-y-4">
            {faqItems.map((item) => (
              <div key={item.question} className="rounded-3xl border border-border bg-card p-6">
                <h2 className="text-xl font-semibold">{item.question}</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.answer}</p>
              </div>
            ))}
            {!faqItems.length ? (
              <div className="rounded-3xl border border-dashed border-border bg-card p-6">
                <h2 className="text-xl font-semibold">Frequently asked questions will appear here soon.</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">Check back shortly for guidance on prescription reviews, payments, delivery timelines, and reorders.</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
