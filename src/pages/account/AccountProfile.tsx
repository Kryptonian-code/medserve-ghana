import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import type { AppUser } from "@/lib/types";
import { toast } from "sonner";

export default function AccountProfile() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["account-profile"],
    queryFn: () => apiRequest<{ user: AppUser }>("/account/profile"),
  });
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });

  useEffect(() => {
    if (data?.user) {
      setForm({
        firstName: data.user.first_name,
        lastName: data.user.last_name,
        phone: data.user.phone || "",
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: () => apiRequest("/account/profile", { method: "PUT", body: form }),
    onSuccess: () => {
      toast.success("Changes saved successfully.");
      queryClient.invalidateQueries({ queryKey: ["account-profile"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to save your profile right now."),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    mutation.mutate();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Profile</h1>
      <p className="mt-2 text-muted-foreground">Keep your contact details up to date for order and prescription follow-up.</p>
      <form onSubmit={handleSubmit} className="mt-6 max-w-xl rounded-3xl border border-border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">First name</label>
            <Input value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Last name</label>
            <Input value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} required />
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium">Email address</label>
          <Input value={data?.user.email || ""} disabled />
        </div>
        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium">Phone number</label>
          <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
        </div>
        <Button className="mt-6" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving changes..." : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
