import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

type Address = {
  id: number;
  label: string;
  recipient_name: string;
  phone: string;
  line1: string;
  line2?: string;
  area: string;
  city: string;
  landmark?: string;
  is_default: number;
};

export default function AccountAddresses() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["account-addresses"],
    queryFn: () => apiRequest<{ addresses: Address[] }>("/account/addresses"),
  });
  const [form, setForm] = useState({
    label: "Home",
    recipientName: "",
    phone: "",
    line1: "",
    line2: "",
    area: "",
    city: "Accra",
    landmark: "",
  });

  const saveMutation = useMutation({
    mutationFn: () => apiRequest("/account/addresses", { method: "POST", body: form }),
    onSuccess: () => {
      toast.success("Address saved successfully.");
      queryClient.invalidateQueries({ queryKey: ["account-addresses"] });
      setForm({ label: "Home", recipientName: "", phone: "", line1: "", line2: "", area: "", city: "Accra", landmark: "" });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to save that address right now."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/account/addresses/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Address deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["account-addresses"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to delete that address right now."),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Addresses</h1>
        <p className="mt-2 text-muted-foreground">Save delivery details for faster checkout.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="space-y-4">
          {(data?.addresses || []).length ? data?.addresses.map((address) => (
            <div key={address.id} className="rounded-3xl border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{address.label}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{address.recipient_name}</p>
                  <p className="text-sm text-muted-foreground">{address.line1}</p>
                  <p className="text-sm text-muted-foreground">{address.area}, {address.city}</p>
                </div>
                <Button variant="outline" onClick={() => deleteMutation.mutate(address.id)}>Delete</Button>
              </div>
            </div>
          )) : (
            <div className="rounded-3xl border border-border bg-card p-10 text-center">
              <p className="text-lg font-medium">You have not saved any addresses yet.</p>
              <p className="mt-2 text-muted-foreground">Add a delivery address to make checkout faster next time.</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Add a new address</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Label</label>
              <Input value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Recipient name</label>
              <Input value={form.recipientName} onChange={(event) => setForm({ ...form, recipientName: event.target.value })} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Phone number</label>
              <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Address line</label>
              <Input value={form.line1} onChange={(event) => setForm({ ...form, line1: event.target.value })} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Area</label>
              <Input value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })} required />
            </div>
            <Button className="w-full" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving address..." : "Save address"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
