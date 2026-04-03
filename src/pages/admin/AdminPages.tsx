import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import type { BootstrapData, Category, Order, Prescription } from "@/lib/types";
import { ORDER_STATUSES, PRESCRIPTION_STATUSES, formatCurrency, formatDate } from "@/lib/format";
import { toast } from "sonner";

const SectionHeader = ({ title, description }: { title: string; description: string }) => (
  <div className="mb-6">
    <h1 className="text-3xl font-bold">{title}</h1>
    <p className="mt-2 text-muted-foreground">{description}</p>
  </div>
);

const FormPanel = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
  <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
    <div className="mb-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p> : null}
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <label className="block space-y-2">
    <span className="text-sm font-medium text-foreground">{label}</span>
    {children}
    {hint ? <span className="block text-xs leading-5 text-muted-foreground">{hint}</span> : null}
  </label>
);

type AdminSection = { key: string; value: unknown };
type FaqItem = { question: string; answer: string };

function toLines(items?: string[]) {
  return (items || []).join("\n");
}

function fromLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function useAdminContentSections() {
  return useQuery({
    queryKey: ["admin-content"],
    queryFn: () => apiRequest<{ sections: AdminSection[] }>("/admin/content"),
  });
}

function useSaveContentSection(sectionKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (value: unknown) => apiRequest(`/admin/content/${sectionKey}`, { method: "PUT", body: { value } }),
    onSuccess: () => {
      toast.success("Changes saved successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to save those changes right now."),
  });
}

export function AdminCategories() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ id: 0, name: "", slug: "", description: "", heroText: "", sortOrder: "0", isActive: true });
  const { data } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => apiRequest<{ categories: Category[] }>("/admin/categories"),
  });

  const saveMutation = useMutation({
    mutationFn: () => form.id
      ? apiRequest(`/admin/categories/${form.id}`, { method: "PUT", body: form })
      : apiRequest("/admin/categories", { method: "POST", body: form }),
    onSuccess: () => {
      toast.success(form.id ? "Category updated successfully." : "Category published successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setForm({ id: 0, name: "", slug: "", description: "", heroText: "", sortOrder: "0", isActive: true });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/admin/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-categories"] }),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveMutation.mutate();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-border bg-card p-6">
        <SectionHeader title="Categories" description="Create product categories to organise the shop clearly." />
        <div className="space-y-4">
          {(data?.categories || []).length ? data?.categories.map((category) => (
            <div key={category.id} className="rounded-2xl bg-secondary p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold">{category.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{category.productCount} products</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setForm({ id: category.id, name: category.name, slug: category.slug, description: category.description, heroText: category.heroText || "", sortOrder: String(category.sortOrder), isActive: category.isActive })}>Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(category.id)}>Delete</Button>
                </div>
              </div>
            </div>
          )) : (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="font-medium">No categories have been added yet.</p>
              <p className="mt-2 text-sm text-muted-foreground">Create product categories to organise the shop clearly.</p>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold">{form.id ? "Edit category" : "Add category"}</h2>
        <div className="mt-4 space-y-4">
          <Input placeholder="Category name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <Input placeholder="Slug" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} />
          <Textarea placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <Textarea placeholder="Hero text" value={form.heroText} onChange={(event) => setForm({ ...form, heroText: event.target.value })} />
          <Input placeholder="Sort order" type="number" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /> Active</label>
          <Button className="w-full">{form.id ? "Save changes" : "Publish category"}</Button>
        </div>
      </form>
    </div>
  );
}

export function AdminOrders() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const { data } = useQuery({
    queryKey: ["admin-orders", statusFilter],
    queryFn: () => apiRequest<{ orders: Order[] }>(`/admin/orders${statusFilter !== "all" ? `?status=${encodeURIComponent(statusFilter)}` : ""}`),
  });
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => apiRequest(`/admin/orders/${id}`, { method: "PUT", body: { status } }),
    onSuccess: () => {
      toast.success("Order status updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });

  return (
    <div>
      <SectionHeader title="Orders" description="Review order flow and keep fulfilment statuses accurate." />
      <div className="mb-4 max-w-sm">
        <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </div>
      <div className="space-y-4">
        {(data?.orders || []).map((order) => (
          <div key={order.id} className="rounded-3xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{order.orderNumber}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{order.customerName} • {formatDate(order.createdAt)}</p>
              </div>
              <div className="flex gap-3">
                <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={order.status} onChange={(event) => mutation.mutate({ id: order.id, status: event.target.value })}>
                  {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <div className="text-right">
                  <p className="font-semibold text-primary">{formatCurrency(order.total)}</p>
                  <p className="text-sm text-muted-foreground">{order.fulfilmentType}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminPrescriptions() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-prescriptions"],
    queryFn: () => apiRequest<{ prescriptions: Prescription[] }>("/admin/prescriptions"),
  });
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => apiRequest(`/admin/prescriptions/${id}`, { method: "PUT", body: { status } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-prescriptions"] }),
  });

  return (
    <div>
      <SectionHeader title="Prescriptions" description="Review status, pharmacist notes, and prescription history." />
      <div className="space-y-4">
        {(data?.prescriptions || []).map((prescription) => (
          <div key={prescription.id} className="rounded-3xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{prescription.reference}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{prescription.customerName} • {formatDate(prescription.createdAt)}</p>
                {prescription.pharmacistNotes ? <p className="mt-3 text-sm text-muted-foreground">{prescription.pharmacistNotes}</p> : null}
              </div>
              <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={prescription.status} onChange={(event) => mutation.mutate({ id: prescription.id, status: event.target.value })}>
                {PRESCRIPTION_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminCustomers() {
  const { data } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: () => apiRequest<{ customers: Array<{ id: number; first_name: string; last_name: string; email: string; phone: string; created_at: string }> }>("/admin/customers"),
  });
  return (
    <div>
      <SectionHeader title="Customers" description="Search active customer records and recent signups." />
      <div className="space-y-4">
        {(data?.customers || []).map((customer) => (
          <div key={customer.id} className="rounded-3xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">{customer.first_name} {customer.last_name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{customer.email}</p>
            <p className="text-sm text-muted-foreground">{customer.phone}</p>
            <p className="mt-2 text-sm text-muted-foreground">Joined {formatDate(customer.created_at)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminInventory() {
  const { data } = useQuery({
    queryKey: ["admin-inventory"],
    queryFn: () => apiRequest<{ inventory: Array<{ id: number; name: string; categoryName?: string; stockQuantity: number; stockStatus: string }> }>("/admin/inventory"),
  });
  return (
    <div>
      <SectionHeader title="Inventory" description="Monitor stock levels and product availability across the catalogue." />
      <div className="space-y-4">
        {(data?.inventory || []).map((item) => (
          <div key={item.id} className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{item.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{item.categoryName}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{item.stockQuantity} units</p>
                <p className="text-sm text-muted-foreground">{item.stockStatus}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminContent() {
  const { data } = useAdminContentSections();
  const saveMutation = useSaveContentSection("site");
  const section = useMemo(
    () => data?.sections.find((item) => item.key === "site")?.value as Partial<BootstrapData["site"]> | undefined,
    [data?.sections]
  );
  const [form, setForm] = useState({
    brandName: "",
    brandShortName: "",
    logoLetter: "",
    tagline: "",
    supportEmail: "",
    phoneOne: "",
    phoneTwo: "",
    whatsappNumber: "",
    address: "",
    businessHours: "",
    deliveryNotice: "",
    announcementBar: "",
  });

  useEffect(() => {
    setForm({
      brandName: section?.brandName || "",
      brandShortName: section?.brandShortName || "",
      logoLetter: section?.logoLetter || "",
      tagline: section?.tagline || "",
      supportEmail: section?.supportEmail || "",
      phoneOne: section?.supportPhone?.[0] || "",
      phoneTwo: section?.supportPhone?.[1] || "",
      whatsappNumber: section?.whatsappNumber || "",
      address: section?.address || "",
      businessHours: toLines(section?.businessHours),
      deliveryNotice: section?.deliveryNotice || "",
      announcementBar: section?.announcementBar || "",
    });
  }, [section]);

  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        saveMutation.mutate({
          brandName: form.brandName.trim(),
          brandShortName: form.brandShortName.trim(),
          logoLetter: form.logoLetter.trim().slice(0, 1),
          tagline: form.tagline.trim(),
          supportEmail: form.supportEmail.trim(),
          supportPhone: [form.phoneOne.trim(), form.phoneTwo.trim()].filter(Boolean),
          whatsappNumber: form.whatsappNumber.trim(),
          address: form.address.trim(),
          businessHours: fromLines(form.businessHours),
          deliveryNotice: form.deliveryNotice.trim(),
          announcementBar: form.announcementBar.trim(),
        });
      }}
    >
      <SectionHeader title="Website Content" description="Update the business name, customer support details, and public pharmacy information using simple fields." />
      <FormPanel title="Branding" description="These details appear across the website header, footer, and browser title.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Business name"><Input value={form.brandName} onChange={(event) => setForm({ ...form, brandName: event.target.value })} placeholder="MedServe Ghana" /></Field>
          <Field label="Short name" hint="Helpful for mobile spaces and compact labels."><Input value={form.brandShortName} onChange={(event) => setForm({ ...form, brandShortName: event.target.value })} placeholder="MedServe" /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-[180px_1fr]">
          <Field label="Logo letter"><Input value={form.logoLetter} onChange={(event) => setForm({ ...form, logoLetter: event.target.value })} placeholder="M" maxLength={1} /></Field>
          <Field label="Tagline"><Textarea value={form.tagline} onChange={(event) => setForm({ ...form, tagline: event.target.value })} placeholder="Online pharmacy support for everyday health and pharmacist-reviewed prescriptions." rows={3} /></Field>
        </div>
      </FormPanel>
      <FormPanel title="Contact Information" description="Customers will see these details on the website and contact page.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Support email"><Input type="email" value={form.supportEmail} onChange={(event) => setForm({ ...form, supportEmail: event.target.value })} placeholder="support@medserveghana.com" /></Field>
          <Field label="WhatsApp number"><Input value={form.whatsappNumber} onChange={(event) => setForm({ ...form, whatsappNumber: event.target.value })} placeholder="+233 24 000 0000" /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Primary phone number"><Input value={form.phoneOne} onChange={(event) => setForm({ ...form, phoneOne: event.target.value })} placeholder="+233 30 255 4810" /></Field>
          <Field label="Second phone number"><Input value={form.phoneTwo} onChange={(event) => setForm({ ...form, phoneTwo: event.target.value })} placeholder="+233 24 123 4567" /></Field>
        </div>
        <Field label="Business address"><Textarea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Spintex Road, Community 18 Junction, Accra" rows={3} /></Field>
        <Field label="Business hours" hint="Add one line per day or time block."><Textarea value={form.businessHours} onChange={(event) => setForm({ ...form, businessHours: event.target.value })} placeholder={"Monday to Friday: 8:00 AM to 8:00 PM\nSaturday: 9:00 AM to 5:00 PM"} rows={4} /></Field>
      </FormPanel>
      <FormPanel title="Customer Messages" description="These short messages appear in public-facing areas of the website.">
        <Field label="Top website notice"><Input value={form.announcementBar} onChange={(event) => setForm({ ...form, announcementBar: event.target.value })} placeholder="Licensed pharmacy support in Ghana" /></Field>
        <Field label="Delivery notice"><Textarea value={form.deliveryNotice} onChange={(event) => setForm({ ...form, deliveryNotice: event.target.value })} placeholder="Orders received before 4:00 PM are usually prepared the same day." rows={4} /></Field>
      </FormPanel>
      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving changes..." : "Save Changes"}</Button>
      </div>
    </form>
  );
}

export function AdminFAQ() {
  const { data } = useAdminContentSections();
  const saveMutation = useSaveContentSection("faq");
  const section = useMemo(
    () => (data?.sections.find((item) => item.key === "faq")?.value as FaqItem[] | undefined) || [],
    [data?.sections]
  );
  const [items, setItems] = useState<FaqItem[]>([{ question: "", answer: "" }]);

  useEffect(() => {
    setItems(section.length ? section : [{ question: "", answer: "" }]);
  }, [section]);

  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        saveMutation.mutate(items.map((item) => ({ question: item.question.trim(), answer: item.answer.trim() })).filter((item) => item.question && item.answer));
      }}
    >
      <SectionHeader title="FAQs" description="Manage customer questions and answers without touching any technical settings." />
      <FormPanel title="Questions and answers" description="Add simple customer-friendly questions and clear answers.">
        {items.map((item, index) => (
          <div key={`faq-${index}`} className="rounded-2xl border border-border p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-semibold">Question {index + 1}</h3>
              {items.length > 1 ? <Button type="button" variant="outline" size="sm" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</Button> : null}
            </div>
            <div className="space-y-4">
              <Field label="Question"><Input value={item.question} onChange={(event) => setItems((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, question: event.target.value } : entry))} placeholder="How long does prescription review take?" /></Field>
              <Field label="Answer"><Textarea value={item.answer} onChange={(event) => setItems((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, answer: event.target.value } : entry))} placeholder="Most prescriptions are reviewed during business hours on the same day." rows={4} /></Field>
            </div>
          </div>
        ))}
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={() => setItems((current) => [...current, { question: "", answer: "" }])}>Add Another Question</Button>
          <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving changes..." : "Save Changes"}</Button>
        </div>
      </FormPanel>
    </form>
  );
}

export function AdminHomepage() {
  const { data } = useAdminContentSections();
  const saveMutation = useSaveContentSection("homepage");
  const section = useMemo(
    () => data?.sections.find((item) => item.key === "homepage")?.value as Partial<BootstrapData["homepage"]> | undefined,
    [data?.sections]
  );
  const [form, setForm] = useState({
    banner: "",
    eyebrow: "",
    title: "",
    subtitle: "",
    primaryCtaLabel: "",
    secondaryCtaLabel: "",
    statLabel: "",
    statValue: "",
    trustIndicators: "",
    announcements: "",
  });

  useEffect(() => {
    setForm({
      banner: section?.banner || "",
      eyebrow: section?.hero?.eyebrow || "",
      title: section?.hero?.title || "",
      subtitle: section?.hero?.subtitle || "",
      primaryCtaLabel: section?.hero?.primaryCtaLabel || "",
      secondaryCtaLabel: section?.hero?.secondaryCtaLabel || "",
      statLabel: section?.hero?.statLabel || "",
      statValue: section?.hero?.statValue || "",
      trustIndicators: toLines(section?.trustIndicators),
      announcements: toLines(section?.announcements),
    });
  }, [section]);

  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        saveMutation.mutate({
          ...section,
          banner: form.banner.trim(),
          hero: {
            eyebrow: form.eyebrow.trim(),
            title: form.title.trim(),
            subtitle: form.subtitle.trim(),
            primaryCtaLabel: form.primaryCtaLabel.trim(),
            secondaryCtaLabel: form.secondaryCtaLabel.trim(),
            statLabel: form.statLabel.trim(),
            statValue: form.statValue.trim(),
          },
          trustIndicators: fromLines(form.trustIndicators),
          announcements: fromLines(form.announcements),
        });
      }}
    >
      <SectionHeader title="Homepage" description="Update the main homepage message using simple text fields. Website changes appear automatically after saving." />
      <FormPanel title="Hero Section" description="This is the main message visitors see first on the homepage.">
        <Field label="Top banner line"><Input value={form.banner} onChange={(event) => setForm({ ...form, banner: event.target.value })} placeholder="Order medicines, upload prescriptions, and stay updated with every step." /></Field>
        <Field label="Small headline"><Input value={form.eyebrow} onChange={(event) => setForm({ ...form, eyebrow: event.target.value })} placeholder="Licensed pharmacy support in Ghana" /></Field>
        <Field label="Main headline"><Textarea value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Order everyday medicines with support from a pharmacy team you can trust." rows={3} /></Field>
        <Field label="Supporting message"><Textarea value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} placeholder="Shop essentials, upload prescriptions securely, and choose delivery or pickup with clear updates at every step." rows={4} /></Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Main button text"><Input value={form.primaryCtaLabel} onChange={(event) => setForm({ ...form, primaryCtaLabel: event.target.value })} placeholder="Shop the catalogue" /></Field>
          <Field label="Second button text"><Input value={form.secondaryCtaLabel} onChange={(event) => setForm({ ...form, secondaryCtaLabel: event.target.value })} placeholder="Upload a prescription" /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Summary label"><Input value={form.statLabel} onChange={(event) => setForm({ ...form, statLabel: event.target.value })} placeholder="Service updates published live from the admin dashboard" /></Field>
          <Field label="Summary number or word"><Input value={form.statValue} onChange={(event) => setForm({ ...form, statValue: event.target.value })} placeholder="Live" /></Field>
        </div>
      </FormPanel>
      <FormPanel title="Trust Messages" description="Add one message per line for trust points and announcement cards.">
        <Field label="Trust points"><Textarea value={form.trustIndicators} onChange={(event) => setForm({ ...form, trustIndicators: event.target.value })} placeholder={"Genuine medicines sourced from trusted suppliers\nSecure checkout and protected prescription handling"} rows={5} /></Field>
        <Field label="Announcement cards"><Textarea value={form.announcements} onChange={(event) => setForm({ ...form, announcements: event.target.value })} placeholder={"Same-day review for prescriptions received during business hours.\nPrices and stock updates appear on the website automatically."} rows={5} /></Field>
      </FormPanel>
      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving changes..." : "Save Changes"}</Button>
      </div>
    </form>
  );
}

export function AdminSettings() {
  const { data } = useAdminContentSections();
  const saveNavigation = useSaveContentSection("navigation");
  const saveSeo = useSaveContentSection("seo");
  const navigation = useMemo(
    () => data?.sections.find((item) => item.key === "navigation")?.value as Partial<BootstrapData["navigation"]> | undefined,
    [data?.sections]
  );
  const seo = useMemo(
    () => data?.sections.find((item) => item.key === "seo")?.value as Partial<BootstrapData["seo"]> | undefined,
    [data?.sections]
  );
  const [menuLabels, setMenuLabels] = useState({
    home: "Home",
    shop: "Shop",
    categories: "Categories",
    upload: "Upload Prescription",
    howItWorks: "How It Works",
    faq: "FAQ",
    contact: "Contact",
    login: "Login",
    mainButton: "Shop",
    prescriptionButton: "Upload Prescription",
  });
  const [seoForm, setSeoForm] = useState({ siteTitle: "", siteDescription: "", ogTitle: "", ogDescription: "" });

  useEffect(() => {
    setMenuLabels({
      home: navigation?.primaryLinks?.[0]?.label || "Home",
      shop: navigation?.primaryLinks?.[1]?.label || "Shop",
      categories: navigation?.primaryLinks?.[2]?.label || "Categories",
      upload: navigation?.primaryLinks?.[3]?.label || "Upload Prescription",
      howItWorks: navigation?.primaryLinks?.[4]?.label || "How It Works",
      faq: navigation?.primaryLinks?.[5]?.label || "FAQ",
      contact: navigation?.primaryLinks?.[6]?.label || "Contact",
      login: navigation?.loginLabel || "Login",
      mainButton: navigation?.primaryCtaLabel || "Shop",
      prescriptionButton: navigation?.prescriptionCtaLabel || "Upload Prescription",
    });
    setSeoForm({
      siteTitle: seo?.siteTitle || "",
      siteDescription: seo?.siteDescription || "",
      ogTitle: seo?.ogTitle || "",
      ogDescription: seo?.ogDescription || "",
    });
  }, [navigation, seo]);

  return (
    <div className="grid gap-6">
      <SectionHeader title="Settings" description="Change menu labels and search details without dealing with technical settings or code." />
      <form
        className="grid gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          saveNavigation.mutate({
            primaryLinks: [
              { label: menuLabels.home.trim(), to: "/" },
              { label: menuLabels.shop.trim(), to: "/shop" },
              { label: menuLabels.categories.trim(), to: "/shop" },
              { label: menuLabels.upload.trim(), to: "/upload-prescription" },
              { label: menuLabels.howItWorks.trim(), to: "/how-it-works" },
              { label: menuLabels.faq.trim(), to: "/faq" },
              { label: menuLabels.contact.trim(), to: "/contact" },
            ],
            footerLinks: [
              { label: menuLabels.shop.trim(), to: "/shop" },
              { label: menuLabels.categories.trim(), to: "/shop" },
              { label: menuLabels.upload.trim(), to: "/upload-prescription" },
              { label: menuLabels.howItWorks.trim(), to: "/how-it-works" },
              { label: menuLabels.faq.trim(), to: "/faq" },
              { label: menuLabels.contact.trim(), to: "/contact" },
            ],
            policyLinks: navigation?.policyLinks || [],
            primaryCtaLabel: menuLabels.mainButton.trim(),
            prescriptionCtaLabel: menuLabels.prescriptionButton.trim(),
            loginLabel: menuLabels.login.trim(),
          });
        }}
      >
        <FormPanel title="Navigation Labels" description="These are the menu names customers will see on the website.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Home"><Input value={menuLabels.home} onChange={(event) => setMenuLabels({ ...menuLabels, home: event.target.value })} /></Field>
            <Field label="Shop"><Input value={menuLabels.shop} onChange={(event) => setMenuLabels({ ...menuLabels, shop: event.target.value })} /></Field>
            <Field label="Categories"><Input value={menuLabels.categories} onChange={(event) => setMenuLabels({ ...menuLabels, categories: event.target.value })} /></Field>
            <Field label="Upload Prescription"><Input value={menuLabels.upload} onChange={(event) => setMenuLabels({ ...menuLabels, upload: event.target.value })} /></Field>
            <Field label="How It Works"><Input value={menuLabels.howItWorks} onChange={(event) => setMenuLabels({ ...menuLabels, howItWorks: event.target.value })} /></Field>
            <Field label="FAQ"><Input value={menuLabels.faq} onChange={(event) => setMenuLabels({ ...menuLabels, faq: event.target.value })} /></Field>
            <Field label="Contact"><Input value={menuLabels.contact} onChange={(event) => setMenuLabels({ ...menuLabels, contact: event.target.value })} /></Field>
            <Field label="Login button"><Input value={menuLabels.login} onChange={(event) => setMenuLabels({ ...menuLabels, login: event.target.value })} /></Field>
            <Field label="Main website button"><Input value={menuLabels.mainButton} onChange={(event) => setMenuLabels({ ...menuLabels, mainButton: event.target.value })} /></Field>
            <Field label="Prescription button"><Input value={menuLabels.prescriptionButton} onChange={(event) => setMenuLabels({ ...menuLabels, prescriptionButton: event.target.value })} /></Field>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={saveNavigation.isPending}>{saveNavigation.isPending ? "Saving changes..." : "Save Changes"}</Button>
          </div>
        </FormPanel>
      </form>
      <form
        className="grid gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          saveSeo.mutate({
            siteTitle: seoForm.siteTitle.trim(),
            siteDescription: seoForm.siteDescription.trim(),
            ogTitle: seoForm.ogTitle.trim(),
            ogDescription: seoForm.ogDescription.trim(),
          });
        }}
      >
        <FormPanel title="Search and Sharing Details" description="These details help your website look good in search results and shared links.">
          <Field label="Website title"><Input value={seoForm.siteTitle} onChange={(event) => setSeoForm({ ...seoForm, siteTitle: event.target.value })} placeholder="MedServe Ghana | Online Pharmacy and Prescription Support" /></Field>
          <Field label="Website description"><Textarea value={seoForm.siteDescription} onChange={(event) => setSeoForm({ ...seoForm, siteDescription: event.target.value })} placeholder="Shop medicines, upload prescriptions, and manage pharmacy orders with MedServe Ghana." rows={4} /></Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Shared link title"><Input value={seoForm.ogTitle} onChange={(event) => setSeoForm({ ...seoForm, ogTitle: event.target.value })} placeholder="MedServe Ghana" /></Field>
            <Field label="Shared link description"><Textarea value={seoForm.ogDescription} onChange={(event) => setSeoForm({ ...seoForm, ogDescription: event.target.value })} placeholder="Online pharmacy ordering with pharmacist-reviewed prescription support in Ghana." rows={4} /></Field>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={saveSeo.isPending}>{saveSeo.isPending ? "Saving changes..." : "Save Changes"}</Button>
          </div>
        </FormPanel>
      </form>
    </div>
  );
}

export function AdminUsers() {
  const { data } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => apiRequest<{ users: Array<{ id: number; first_name: string; last_name: string; email: string; role: string }> }>("/admin/users"),
  });
  return (
    <div>
      <SectionHeader title="Users and roles" description="Review system access across customer, pharmacist, and admin accounts." />
      <div className="space-y-4">
        {(data?.users || []).map((user) => (
          <div key={user.id} className="rounded-3xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">{user.first_name} {user.last_name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
            <p className="mt-2 text-sm text-muted-foreground">{user.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminReports() {
  const { data } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => apiRequest<{ orderStatuses: Array<{ status: string; total: number }>; prescriptionStatuses: Array<{ status: string; total: number }> }>("/admin/reports"),
  });
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-3xl border border-border bg-card p-6">
        <SectionHeader title="Reports" description="Status snapshots across live orders and prescriptions." />
        <div className="space-y-3">
          {(data?.orderStatuses || []).map((item) => (
            <div key={item.status} className="flex items-center justify-between rounded-2xl bg-secondary p-4">
              <span>{item.status}</span>
              <span>{item.total}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-3xl border border-border bg-card p-6">
        <SectionHeader title="Prescription statuses" description="Track how the review queue is moving over time." />
        <div className="space-y-3">
          {(data?.prescriptionStatuses || []).map((item) => (
            <div key={item.status} className="flex items-center justify-between rounded-2xl bg-secondary p-4">
              <span>{item.status}</span>
              <span>{item.total}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
