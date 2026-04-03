import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, Upload } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function UploadPrescription() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    patientName: user ? `${user.first_name} ${user.last_name}` : "",
    phone: user?.phone || "",
    fulfilmentType: "delivery",
    notes: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) {
      navigate("/login", { state: { from: "/upload-prescription" } });
      return;
    }

    if (!file) {
      toast.error("Please upload a prescription file before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("patientName", form.patientName);
      payload.append("phone", form.phone);
      payload.append("fulfilmentType", form.fulfilmentType);
      payload.append("notes", form.notes);
      payload.append("file", file);
      await apiRequest("/prescriptions", { method: "POST", rawBody: payload });
      toast.success("Prescription submitted successfully.");
      setSubmitted(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to complete that action right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <PublicLayout>
        <section className="py-20">
          <div className="container">
            <div className="mx-auto max-w-lg rounded-3xl border border-border bg-card p-10 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">Prescription submitted successfully</h1>
              <p className="mt-3 text-muted-foreground">
                Your file is now in the pharmacist review queue. We will update your account as soon as the review is complete.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button asChild><Link to="/account/prescriptions">View prescriptions</Link></Button>
                <Button variant="outline" onClick={() => setSubmitted(false)}>Upload another file</Button>
              </div>
            </div>
          </div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="py-12 md:py-18">
        <div className="container">
          <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-8 shadow-sm">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Upload a prescription for pharmacist review</h1>
              <p className="mt-2 text-muted-foreground">Send a clear image or PDF. We review prescriptions throughout the day and contact you if clarification is needed.</p>
            </div>

            {!user ? (
              <div className="mb-8 rounded-2xl bg-secondary p-4 text-sm text-muted-foreground">
                Please sign in before submitting a prescription so we can attach the review to your account.
              </div>
            ) : null}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <label className="block rounded-3xl border-2 border-dashed border-border bg-secondary/40 p-8 text-center">
                <Upload className="mx-auto h-9 w-9 text-primary" />
                <p className="mt-3 font-medium">{file ? file.name : "Choose a prescription file"}</p>
                <p className="mt-1 text-sm text-muted-foreground">JPG, PNG, or PDF up to 10MB</p>
                <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Patient name</label>
                  <Input value={form.patientName} onChange={(event) => setForm({ ...form, patientName: event.target.value })} placeholder="Enter the patient's full name" required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Phone number</label>
                  <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="024 123 4567" required />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Additional notes</label>
                <Textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Share any brand preferences, allergies, or questions for the pharmacist." rows={4} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Preferred fulfilment</label>
                <div className="flex gap-3">
                  {[
                    { label: "Delivery", value: "delivery" },
                    { label: "Pickup", value: "pickup" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`flex-1 rounded-2xl border px-4 py-3 text-sm ${form.fulfilmentType === option.value ? "border-primary bg-primary/5 text-foreground" : "border-border bg-background text-muted-foreground"}`}
                      onClick={() => setForm({ ...form, fulfilmentType: option.value })}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting prescription..." : "Submit prescription"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
