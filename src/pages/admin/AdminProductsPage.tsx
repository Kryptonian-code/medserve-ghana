import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

type ProductFormState = {
  id?: number;
  name: string;
  brand: string;
  sku: string;
  price: string;
  comparePrice: string;
  categoryId: string;
  dosageForm: string;
  packSize: string;
  stockQuantity: string;
  description: string;
  usageGuidance: string;
  warnings: string;
  tags: string;
  prescriptionRequired: boolean;
  isActive: boolean;
  image?: File | null;
};

const emptyForm: ProductFormState = {
  name: "",
  brand: "",
  sku: "",
  price: "",
  comparePrice: "",
  categoryId: "",
  dosageForm: "",
  packSize: "",
  stockQuantity: "0",
  description: "",
  usageGuidance: "",
  warnings: "",
  tags: "",
  prescriptionRequired: false,
  isActive: true,
  image: null,
};

export function AdminProducts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: productsData } = useQuery({
    queryKey: ["admin-products", search],
    queryFn: () => apiRequest<{ products: Product[] }>(`/admin/products${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  });
  const { data: categoriesData } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => apiRequest<{ categories: Category[] }>("/admin/categories"),
  });

  const categories = useMemo(() => categoriesData?.categories ?? [], [categoriesData?.categories]);
  const products = useMemo(() => productsData?.products ?? [], [productsData?.products]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "image") return;
        payload.append(key, String(value ?? ""));
      });
      if (form.image) payload.append("image", form.image);
      return editingId
        ? apiRequest(`/admin/products/${editingId}`, { method: "PUT", body: Object.fromEntries(payload.entries()) })
        : apiRequest("/admin/products", { method: "POST", rawBody: payload });
    },
    onSuccess: () => {
      toast.success(editingId ? "Product updated successfully." : "Product added successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setForm(emptyForm);
      setEditingId(null);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to save that product right now."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/admin/products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Product deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  const editProduct = (product: Product) => {
    setEditingId(product.id);
    setForm({
      id: product.id,
      name: product.name,
      brand: product.brand,
      sku: product.sku,
      price: String(product.price),
      comparePrice: product.comparePrice ? String(product.comparePrice) : "",
      categoryId: product.categoryId ? String(product.categoryId) : "",
      dosageForm: product.dosageForm || "",
      packSize: product.packSize || "",
      stockQuantity: String(product.stockQuantity),
      description: product.description,
      usageGuidance: product.usageGuidance,
      warnings: product.warnings,
      tags: product.tags.join(", "),
      prescriptionRequired: product.prescriptionRequired,
      isActive: product.isActive,
      image: null,
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveMutation.mutate();
  };

  const inventorySummary = useMemo(
    () => ({
      active: products.filter((product) => product.isActive).length,
      lowStock: products.filter((product) => product.stockStatus === "Low Stock").length,
      prescriptionOnly: products.filter((product) => product.prescriptionRequired).length,
    }),
    [products]
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-6"><p className="text-sm text-muted-foreground">Active products</p><p className="mt-2 text-3xl font-bold">{inventorySummary.active}</p></div>
        <div className="rounded-3xl border border-border bg-card p-6"><p className="text-sm text-muted-foreground">Low stock</p><p className="mt-2 text-3xl font-bold">{inventorySummary.lowStock}</p></div>
        <div className="rounded-3xl border border-border bg-card p-6"><p className="text-sm text-muted-foreground">Prescription-only</p><p className="mt-2 text-3xl font-bold">{inventorySummary.prescriptionOnly}</p></div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Medicines</h1>
              <p className="text-sm text-muted-foreground">Search, review stock, and manage medicines in the live catalogue.</p>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search medicines by name, brand, or SKU" />
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3">Medicine</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Stock</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-border last:border-0">
                    <td className="py-4">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.brand} • {product.sku}</div>
                    </td>
                    <td className="py-4 text-muted-foreground">{product.categoryName || "Unassigned"}</td>
                    <td className="py-4">{formatCurrency(product.price)}</td>
                    <td className="py-4">{product.stockQuantity}</td>
                    <td className="py-4">{product.stockStatus}</td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => editProduct(product)}>Edit</Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(product.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!products.length ? (
              <div className="py-10 text-center">
                <p className="text-lg font-medium">No products have been published yet.</p>
                <p className="mt-2 text-muted-foreground">Add your first product to begin building the catalogue.</p>
              </div>
            ) : null}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">{editingId ? "Edit medicine" : "Add medicine"}</h2>
          <div className="mt-4 space-y-4">
            <Input placeholder="Medicine name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Brand" value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} />
              <Input placeholder="SKU" value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Price" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
              <Input placeholder="Compare price" type="number" value={form.comparePrice} onChange={(event) => setForm({ ...form, comparePrice: event.target.value })} />
            </div>
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
              <option value="">Choose a category</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Dosage form" value={form.dosageForm} onChange={(event) => setForm({ ...form, dosageForm: event.target.value })} />
              <Input placeholder="Pack size" value={form.packSize} onChange={(event) => setForm({ ...form, packSize: event.target.value })} />
            </div>
            <Input placeholder="Stock quantity" type="number" value={form.stockQuantity} onChange={(event) => setForm({ ...form, stockQuantity: event.target.value })} />
            <Input placeholder="Tags, separated by commas" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} />
            <Textarea placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} />
            <Textarea placeholder="Usage guidance" value={form.usageGuidance} onChange={(event) => setForm({ ...form, usageGuidance: event.target.value })} rows={3} />
            <Textarea placeholder="Warnings" value={form.warnings} onChange={(event) => setForm({ ...form, warnings: event.target.value })} rows={3} />
            <Input type="file" accept=".jpg,.jpeg,.png" onChange={(event) => setForm({ ...form, image: event.target.files?.[0] || null })} />
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.prescriptionRequired} onChange={(event) => setForm({ ...form, prescriptionRequired: event.target.checked })} /> Prescription required</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /> Active</label>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving..." : editingId ? "Save Changes" : "Add Medicine"}</Button>
              {editingId ? <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</Button> : null}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
