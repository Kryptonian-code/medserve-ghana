import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useBootstrap } from "@/hooks/use-bootstrap";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setIsOpen, itemCount } = useCart();
  const { user, logout } = useAuth();
  const { data } = useBootstrap();
  const site = data?.site;
  const navigation = data?.navigation;
  const publicNav = navigation?.primaryLinks?.length
    ? navigation.primaryLinks
    : [
        { label: "Home", to: "/" },
        { label: "Shop", to: "/shop" },
        { label: "Categories", to: "/shop" },
        { label: "Upload Prescription", to: "/upload-prescription" },
        { label: "How It Works", to: "/how-it-works" },
        { label: "FAQ", to: "/faq" },
        { label: "Contact", to: "/contact" },
      ];

  const isAdminRole = user ? ["super_admin", "admin", "manager", "editor", "support_staff", "finance_manager", "content_manager"].includes(user.role) : false;
  const accountLink = isAdminRole ? "/admin" : user?.role === "pharmacist" ? "/pharmacist" : "/account";
  const accountLabel = isAdminRole ? "Admin" : user?.role === "pharmacist" ? "Pharmacist" : "Account";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">{site?.logoLetter || "M"}</span>
          </div>
          <span className="font-heading text-xl font-bold text-foreground">
            {site?.brandName || "MedServe Ghana"}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {publicNav.map((item, index) => (
            <Link
              key={`${item.label}-${item.to}-${index}`}
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
          {user ? (
            <>
              <Link to={accountLink}>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  {accountLabel}
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => void logout()}>
                Logout
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                {navigation?.loginLabel || "Login"}
              </Button>
            </Link>
          )}
          <Link to="/upload-prescription">
            <Button size="sm">{navigation?.prescriptionCtaLabel || "Upload Prescription"}</Button>
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
            {publicNav.map((item, index) => (
              <Link
                key={`${item.label}-${item.to}-${index}`}
                to={item.to}
                className="rounded-md px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              {user ? (
                <>
                  <Link to={accountLink} onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">{accountLabel}</Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                      await logout();
                      setMobileOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">{navigation?.loginLabel || "Login"}</Button>
                </Link>
              )}
              <Link to="/upload-prescription" onClick={() => setMobileOpen(false)}>
                <Button className="w-full">{navigation?.prescriptionCtaLabel || "Upload Prescription"}</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
