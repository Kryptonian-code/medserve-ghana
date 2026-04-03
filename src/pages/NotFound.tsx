import { Link } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";

const NotFound = () => {
  return (
    <PublicLayout>
      <section className="py-20 md:py-28">
        <div className="container max-w-2xl text-center">
          <div className="rounded-3xl border border-border bg-card p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Page not found</p>
            <h1 className="mt-4 text-4xl font-bold">This page is not available.</h1>
            <p className="mt-4 text-muted-foreground">The link may be out of date, or the page may have been moved. You can return to the homepage or continue browsing the shop.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/" className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
                Go to homepage
              </Link>
              <Link to="/shop" className="rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground transition hover:bg-secondary">
                Browse products
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default NotFound;
