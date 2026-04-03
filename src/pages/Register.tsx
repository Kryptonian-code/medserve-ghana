import PublicLayout from "@/components/layout/PublicLayout";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Register = () => (
  <PublicLayout>
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-foreground">Create your account</h1>
            <p className="text-muted-foreground">Join MedServe Ghana for a better pharmacy experience</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">First name</label>
                  <Input placeholder="Kofi" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Last name</label>
                  <Input placeholder="Mensah" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Email address</label>
                <Input type="email" placeholder="you@example.com" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Phone number</label>
                <Input placeholder="024 123 4567" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
                <Input type="password" placeholder="Create a password" />
              </div>
              <Button className="w-full" size="lg">Create Account</Button>
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </PublicLayout>
);

export default Register;
