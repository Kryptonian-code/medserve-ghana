import PublicLayout from "@/components/layout/PublicLayout";
import { useBootstrap } from "@/hooks/use-bootstrap";
import { Card } from "@/components/ui/card";

export default function Contact() {
  const { data } = useBootstrap();
  const site = data?.site;
  const contactPage = data?.contactPage;
  const bestWays = contactPage?.bestWaysBody?.length
    ? contactPage.bestWaysBody
    : [
        "Email is best for non-urgent requests such as order changes, invoice support, and product availability checks.",
        "Phone or WhatsApp is best for prescription guidance, delivery timing questions, and same-day support during business hours.",
        "For prescriptions that need review, upload them through the secure prescription page so the pharmacy team can track them properly.",
      ];
  const urgentHelp = contactPage?.urgentHelpBody?.length
    ? contactPage.urgentHelpBody
    : [
        `Call: ${site?.supportPhone?.join(" / ") || "Phone support details will be available shortly."}`,
        `Email: ${site?.supportEmail || "Email support details will be available shortly."}`,
        `WhatsApp: ${site?.whatsappNumber || "WhatsApp support details will be available shortly."}`,
      ];

  return (
    <PublicLayout>
      <section className="py-14 md:py-20">
        <div className="container grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl border border-border bg-card p-8">
            <h1 className="text-4xl font-bold">{contactPage?.introTitle || "Contact the pharmacy team"}</h1>
            <p className="mt-3 text-muted-foreground">{contactPage?.introDescription || "Speak with us about product availability, prescription review, delivery support, or reorder help."}</p>
            <div className="mt-8 space-y-4 text-sm">
              <div><div className="font-semibold">Support email</div><div className="text-muted-foreground">{site?.supportEmail || "Support email will be available shortly."}</div></div>
              <div><div className="font-semibold">Phone</div><div className="text-muted-foreground">{site?.supportPhone?.join(" / ") || "Support phone lines will be available shortly."}</div></div>
              <div><div className="font-semibold">Address</div><div className="text-muted-foreground">{site?.address || "Location details will be available shortly."}</div></div>
              <div><div className="font-semibold">Business hours</div><div className="text-muted-foreground">{site?.businessHours?.join(" | ") || "Business hours will be available shortly."}</div></div>
              <div className="rounded-2xl bg-secondary p-4 text-muted-foreground">{site?.deliveryNotice || "Delivery guidance will be available shortly."}</div>
            </div>
          </div>

          <div className="grid gap-4">
            <Card className="rounded-3xl p-8">
              <h2 className="text-2xl font-semibold">{contactPage?.bestWaysTitle || "Best ways to reach us"}</h2>
              <div className="mt-6 space-y-4 text-sm text-muted-foreground">
                {bestWays.map((item) => <p key={item}>{item}</p>)}
              </div>
            </Card>
            <Card className="rounded-3xl p-8">
              <h2 className="text-2xl font-semibold">{contactPage?.urgentHelpTitle || "Need help right away?"}</h2>
              <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                {urgentHelp.map((item) => <p key={item}>{item}</p>)}
              </div>
            </Card>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
