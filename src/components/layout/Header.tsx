import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

const publicNav = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Upload Prescription", to: "/upload-prescription" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setIsOpen, itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">M</span>
          </div>
          <span className="font-heading text-xl font-bold text-foreground">
            MedServe <span className="text-primary">Ghana</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {publicNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="ghost" size="icon" className="relative text-muted-foreground" onClick={() => setIsOpen(true)}>
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Button>
          <Link to="/login">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              Login
            </Button>
          </Link>
          <Link to="/upload-prescription">
            <Button size="sm">Upload Prescription</Button>
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Button variant="ghost" size="icon" className="relative text-muted-foreground" onClick={() => setIsOpen(true)}>
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Button>
          <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-card lg:hidden">
          <nav className="container flex flex-col gap-1 py-4">
            {publicNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">Login</Button>
              </Link>
              <Link to="/upload-prescription" onClick={() => setMobileOpen(false)}>
                <Button className="w-full">Upload Prescription</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
