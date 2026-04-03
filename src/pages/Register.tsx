import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await register(form);
      toast.success("Account created successfully.");
      navigate("/account");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create your account right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold">Create your account</h1>
              <p className="mt-2 text-muted-foreground">Set up your customer account for faster checkout, order tracking, and prescription updates.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">First name</label>
                  <Input value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} placeholder="Kofi" required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Last name</label>
                  <Input value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} placeholder="Mensah" required />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Email address</label>
                <Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Phone number</label>
                <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="024 123 4567" required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Password</label>
                <Input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Create a password" required />
              </div>
              <Button className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
