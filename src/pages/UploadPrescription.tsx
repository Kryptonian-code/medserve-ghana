import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, CheckCircle } from "lucide-react";
import { useState } from "react";

const UploadPrescription = () => {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <PublicLayout>
        <section className="py-20">
          <div className="container">
            <div className="mx-auto max-w-lg text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
              <h1 className="mb-4 text-3xl font-bold text-foreground">Prescription submitted successfully</h1>
              <p className="mb-8 text-muted-foreground">
                Our pharmacist will review your prescription shortly. You will receive a notification once your order is ready for payment.
              </p>
              <Button onClick={() => setSubmitted(false)}>Upload Another Prescription</Button>
            </div>
          </div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="py-12 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">Upload your prescription</h1>
              <p className="text-lg text-muted-foreground">
                Send us a clear photo or scan of your prescription. Our licensed pharmacist will review it 
                and prepare your medicines for delivery or pickup.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 md:p-8">
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-foreground">Prescription file</label>
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-background p-10 transition-colors hover:border-primary/50">
                  <div className="text-center">
                    <Upload className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                    <p className="mb-1 text-sm font-medium text-foreground">
                      Drag and drop your file here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">Supports JPG, PNG, and PDF up to 10 MB</p>
                  </div>
                </div>
              </div>

              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Full name</label>
                  <Input placeholder="Enter your full name" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Phone number</label>
                  <Input placeholder="e.g. 024 123 4567" />
                </div>
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-foreground">Additional notes (optional)</label>
                <Textarea placeholder="Let us know if you have specific requirements, preferred brands, or any allergies." rows={3} />
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-foreground">Preferred fulfilment</label>
                <div className="flex gap-3">
                  <button className="flex-1 rounded-lg border-2 border-primary bg-primary/5 p-3 text-center text-sm font-medium text-foreground">
                    Delivery
                  </button>
                  <button className="flex-1 rounded-lg border border-border p-3 text-center text-sm font-medium text-muted-foreground hover:border-primary/30">
                    Pickup
                  </button>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={() => setSubmitted(true)}>
                <FileText className="mr-2 h-4 w-4" />
                Submit Prescription
              </Button>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Your prescription is reviewed by a licensed pharmacist. We will contact you if we need any clarification.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default UploadPrescription;
