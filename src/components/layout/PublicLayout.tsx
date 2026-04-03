import { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useBootstrap } from "@/hooks/use-bootstrap";

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  const { data } = useBootstrap();

  useEffect(() => {
    const title = data?.seo?.siteTitle || data?.site?.brandName || "MedServe Ghana";
    const description = data?.seo?.siteDescription || data?.site?.tagline || "Online pharmacy support in Ghana.";
    const ogTitle = data?.seo?.ogTitle || title;
    const ogDescription = data?.seo?.ogDescription || description;

    document.title = title;

    const setMeta = (selector: string, attribute: "content" | "href", value: string) => {
      const element = document.querySelector(selector);
      if (element instanceof HTMLMetaElement || element instanceof HTMLLinkElement) {
        element.setAttribute(attribute, value);
      }
    };

    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", ogTitle);
    setMeta('meta[property="og:description"]', "content", ogDescription);
  }, [data?.seo, data?.site]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
