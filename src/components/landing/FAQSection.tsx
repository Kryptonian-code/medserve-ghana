import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Do I need a prescription to order medicines?",
    a: "Over-the-counter products can be ordered directly. Prescription medicines require you to upload a valid prescription, which our pharmacist will review before processing your order.",
  },
  {
    q: "How long does delivery take?",
    a: "Delivery within Accra typically takes 1 to 3 business days. For other regions across Ghana, delivery may take 3 to 5 business days depending on your location.",
  },
  {
    q: "What payment methods are available?",
    a: "We accept mobile money (MTN, Vodafone, AirtelTigo), Visa and Mastercard payments. All transactions are processed securely.",
  },
  {
    q: "Can I pick up my order instead of delivery?",
    a: "Yes. During checkout, you can select the pickup option and collect your order from our pharmacy location in Accra at a time that suits you.",
  },
  {
    q: "How do I know the medicines are genuine?",
    a: "We source all products directly from licensed pharmaceutical distributors in Ghana. Every product is verified for authenticity and stored under proper conditions.",
  },
  {
    q: "Can I reorder medicines I have ordered before?",
    a: "Absolutely. Once logged in, you can view your previous orders and reorder with just a few clicks from your account dashboard.",
  },
];

const FAQSection = () => {
  return (
    <section className="bg-card py-16 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Frequently asked questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Answers to common questions about ordering, delivery, and prescriptions.
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-medium text-foreground">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
