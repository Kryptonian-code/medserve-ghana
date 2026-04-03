import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-pharmacy.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-card">
      <div className="container py-16 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
              Licensed Online Pharmacy
            </div>
            <h1 className="mb-5 text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Your trusted online pharmacy in Ghana
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              Order genuine medicines, upload prescriptions securely, and choose delivery or 
              pickup with ease. Quality healthcare made convenient for you and your family.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/shop">
                <Button size="lg" className="text-base font-semibold">
                  Shop Medicines
                </Button>
              </Link>
              <Link to="/upload-prescription">
                <Button size="lg" variant="outline" className="text-base font-semibold">
                  Upload Prescription
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-success" />
                Licensed pharmacy
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-success" />
                Fast delivery
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-success" />
                Genuine products
              </span>
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={heroImage}
                alt="A pharmacist assisting a customer at MedServe Ghana"
                className="h-auto w-full object-cover"
                loading="eager"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 rounded-xl bg-card p-4 shadow-lg">
              <div className="text-2xl font-bold text-primary">5,000+</div>
              <div className="text-xs text-muted-foreground">Products available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
