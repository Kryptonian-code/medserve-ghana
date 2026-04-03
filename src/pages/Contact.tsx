import PublicLayout from "@/components/layout/PublicLayout";
import ContactSection from "@/components/landing/ContactSection";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const Contact = () => (
  <PublicLayout>
    <ContactSection />
    <section className="bg-card py-16">
      <div className="container">
        <div className="mx-auto max-w-lg">
          <h2 className="mb-6 text-center text-2xl font-bold text-foreground">Send us a message</h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
                <Input placeholder="Your name" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                <Input type="email" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Message</label>
              <Textarea placeholder="How can we help you?" rows={5} />
            </div>
            <Button className="w-full">Send Message</Button>
          </div>
        </div>
      </div>
    </section>
  </PublicLayout>
);

export default Contact;
