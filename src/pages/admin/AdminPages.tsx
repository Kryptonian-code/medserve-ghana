import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import type { Category, Order, Prescription } from "@/lib/types";
import { ORDER_STATUSES, PRESCRIPTION_STATUSES, formatCurrency, formatDate } from "@/lib/format";
import { toast } from "sonner";

const SectionHeader = ({ title, description }: { title: string; description: string }) => (
  <div className="mb-6">
    <h1 className="text-3xl font-bold">{title}</h1>
    <p className="mt-2 text-muted-foreground">{description}</p>
  </div>
);

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

function ContentEditor({ sectionKey, title, description }: { sectionKey: string; title: string; description: string }) {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-content"],
    queryFn: () => apiRequest<{ sections: Array<{ key: string; value: unknown }> }>("/admin/content"),
  });
  const section = data?.sections.find((item) => item.key === sectionKey);
  const [value, setValue] = useState("{}");

  useEffect(() => {
    if (section) {
      setValue(JSON.stringify(section.value, null, 2));
    }
  }, [section]);

  const mutation = useMutation({
    mutationFn: () => apiRequest(`/admin/content/${sectionKey}`, { method: "PUT", body: { value: JSON.parse(value) } }),
    onSuccess: () => {
      toast.success("Content updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
    },
    onError: () => toast.error("Please keep the content JSON valid before saving."),
  });

  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <SectionHeader title={title} description={description} />
      <Textarea value={value} onChange={(event) => setValue(event.target.value)} rows={18} className="font-mono text-sm" />
      <Button className="mt-4" onClick={() => mutation.mutate()}>Save changes</Button>
    </div>
  );
}

export const AdminContent = () => (
  <ContentEditor
    sectionKey="site"
    title="Brand and contact settings"
    description="Manage the published brand name, support channels, address, business hours, and delivery notice used across the website."
  />
);
export const AdminFAQ = () => <ContentEditor sectionKey="faq" title="FAQ" description="Maintain the live customer FAQ content shown on the public site." />;
export const AdminHomepage = () => <ContentEditor sectionKey="homepage" title="Homepage" description="Edit the homepage hero, benefits, trust indicators, and announcements." />;
export const AdminSettings = () => (
  <div className="grid gap-6">
    <ContentEditor
      sectionKey="navigation"
      title="Navigation"
      description="Control the published menu labels, footer links, policy links, and main call-to-action labels."
    />
    <ContentEditor
      sectionKey="seo"
      title="SEO settings"
      description="Maintain the site title, descriptions, and Open Graph fields used for search and sharing."
    />
    <ContentEditor
      sectionKey="system-text"
      title="System text"
      description="Store reusable empty state copy and customer-facing interface text that should stay consistent across the product."
    />
  </div>
);

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
