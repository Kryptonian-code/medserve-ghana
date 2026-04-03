import PublicLayout from "@/components/layout/PublicLayout";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Login = () => (
  <PublicLayout>
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your MedServe Ghana account</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Email address</label>
                <Input type="email" placeholder="you@example.com" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
                <Input type="password" placeholder="Enter your password" />
              </div>
              <Button className="w-full" size="lg">Sign In</Button>
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              New to MedServe Ghana?{" "}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </PublicLayout>
);

export default Login;
