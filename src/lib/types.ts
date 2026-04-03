export type UserRole =
  | "customer"
  | "pharmacist"
  | "admin"
  | "super_admin"
  | "manager"
  | "editor"
  | "support_staff"
  | "finance_manager"
  | "content_manager";

export interface AppUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  created_at: string;
  permissions?: string[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  heroText?: string;
  productCount: number;
  sortOrder: number;
  isActive: boolean;
}

export interface Product {
  id: number;
  categoryId: number | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  description: string;
  usageGuidance: string;
  warnings: string;
  dosageForm?: string | null;
  packSize?: string | null;
  tags: string[];
  price: number;
  comparePrice?: number | null;
  imageUrl?: string | null;
  prescriptionRequired: boolean;
  stockQuantity: number;
  stockStatus: "In Stock" | "Low Stock" | "Out of Stock";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  productId: number | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: string;
  fulfilmentType: "delivery" | "pickup";
  subtotal: number;
  deliveryFee: number;
  total: number;
  phone?: string;
  notes?: string;
  deliveryAddress?: Record<string, string> | null;
  customerName?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface Prescription {
  id: number;
  reference: string;
  userId: number;
  patientName: string;
  phone: string;
  fileUrl?: string | null;
  notes?: string | null;
  fulfilmentType: "delivery" | "pickup";
  status: string;
  pharmacistNotes?: string | null;
  clarificationMessage?: string | null;
  reviewedByName?: string | null;
  reviewedAt?: string | null;
  customerName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BootstrapData {
  user: AppUser | null;
  csrfToken?: string;
  site: {
    brandName: string;
    brandShortName: string;
    logoLetter: string;
    tagline: string;
    supportEmail: string;
    supportPhone: string[];
    whatsappNumber?: string;
    address: string;
    businessHours: string[];
    deliveryNotice: string;
    announcementBar?: string;
  };
  navigation: {
    primaryLinks: Array<{ label: string; to: string }>;
    footerLinks: Array<{ label: string; to: string }>;
    policyLinks: Array<{ label: string; to: string }>;
    primaryCtaLabel?: string;
    prescriptionCtaLabel?: string;
    loginLabel?: string;
  };
  seo: {
    siteTitle: string;
    siteDescription: string;
    ogTitle?: string;
    ogDescription?: string;
  };
  systemText: {
    emptyStates?: Record<string, { title: string; description: string }>;
  };
  homepage: {
    banner: string;
    hero: {
      eyebrow: string;
      title: string;
      subtitle: string;
      primaryCtaLabel: string;
      secondaryCtaLabel: string;
      statLabel: string;
      statValue: string;
    };
    benefits: Array<{ title: string; description: string }>;
    trustIndicators: string[];
    announcements: string[];
    howItWorks: Array<{ title: string; description: string }>;
  };
  faq: Array<{ question: string; answer: string }>;
  contact: {
    supportEmail: string;
    supportPhone: string[];
    address: string;
    businessHours: string[];
    deliveryNotice: string;
  };
  footer: {
    policies: string[];
    tagline: string;
  };
  categories: Category[];
  featuredProducts: Product[];
}
