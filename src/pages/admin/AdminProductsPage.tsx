import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

const AdminProducts = () => {
  const [search, setSearch] = useState("");
  const [editProduct, setEditProduct] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: products, refetch } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const filtered = products?.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const payload = {
      name,
      slug,
      brand: formData.get("brand") as string,
      description: formData.get("description") as string,
      usage_guidance: formData.get("usage_guidance") as string,
      warnings: formData.get("warnings") as string,
      price: parseFloat(formData.get("price") as string) || 0,
      category_id: formData.get("category_id") as string || null,
      requires_prescription: formData.get("requires_prescription") === "on",
      in_stock: formData.get("in_stock") === "on",
      stock_quantity: parseInt(formData.get("stock_quantity") as string) || 0,
    };

    try {
      if (editProduct) {
        const { error } = await supabase.from("products").update(payload).eq("id", editProduct.id);
        if (error) throw error;
        toast.success("Product updated successfully");
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
        toast.success("Product added successfully");
      }
      setIsDialogOpen(false);
      setEditProduct(null);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete product");
    } else {
      toast.success("Product removed");
      refetch();
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground">{products?.length || 0} products in catalogue</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) setEditProduct(null); }}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => setEditProduct(null)}>
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Product name</label>
                  <Input name="name" defaultValue={editProduct?.name} required />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Brand</label>
                  <Input name="brand" defaultValue={editProduct?.brand} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Price (GH₵)</label>
                  <Input name="price" type="number" step="0.01" defaultValue={editProduct?.price} required />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Category</label>
                  <select name="category_id" defaultValue={editProduct?.category_id || ""} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">No category</option>
                    {categories?.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Description</label>
                <Textarea name="description" defaultValue={editProduct?.description} rows={3} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Usage guidance</label>
                <Textarea name="usage_guidance" defaultValue={editProduct?.usage_guidance} rows={2} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Warnings</label>
                <Textarea name="warnings" defaultValue={editProduct?.warnings} rows={2} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Stock quantity</label>
                  <Input name="stock_quantity" type="number" defaultValue={editProduct?.stock_quantity || 0} />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" name="in_stock" id="in_stock" defaultChecked={editProduct?.in_stock ?? true} className="h-4 w-4 rounded border-border" />
                  <label htmlFor="in_stock" className="text-sm font-medium">In stock</label>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" name="requires_prescription" id="rx" defaultChecked={editProduct?.requires_prescription} className="h-4 w-4 rounded border-border" />
                  <label htmlFor="rx" className="text-sm font-medium">Requires prescription</label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{editProduct ? "Update Product" : "Add Product"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Stock</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered?.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.brand}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{(p.categories as any)?.name || "—"}</td>
                  <td className="px-4 py-3 font-medium text-foreground">GH₵ {Number(p.price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.stock_quantity}</td>
                  <td className="px-4 py-3">
                    {p.in_stock ? (
                      <Badge className="bg-success/10 text-success hover:bg-success/20">In Stock</Badge>
                    ) : (
                      <Badge variant="destructive">Out of Stock</Badge>
                    )}
                    {p.requires_prescription && <Badge variant="secondary" className="ml-1">Rx</Badge>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditProduct(p); setIsDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!filtered || filtered.length === 0) && (
          <div className="p-10 text-center text-muted-foreground">No products found.</div>
        )}
      </div>
    </div>
  );
};

export { AdminProducts };
