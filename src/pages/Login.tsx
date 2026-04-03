import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await login({ email, password });
      toast.success("Signed in successfully.");
      navigate((location.state as { from?: string } | null)?.from || "/account");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign you in right now.");
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
              <h1 className="text-3xl font-bold">Sign in to your account</h1>
              <p className="mt-2 text-muted-foreground">Track orders, upload prescriptions, and manage delivery details.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium">Email address</label>
                <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Password</label>
                <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required />
              </div>
              <Button className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              New to MedServe Ghana?{" "}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
