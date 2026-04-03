import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";
import type { Prescription } from "@/lib/types";
import { PRESCRIPTION_STATUSES, formatDate } from "@/lib/format";
import { toast } from "sonner";

export function PharmacistQueue() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["pharmacist-dashboard"],
    queryFn: () => apiRequest<{ summary: { pendingQueue: number; needsClarification: number; reviewedToday: number }; queue: Prescription[] }>("/dashboard/pharmacist"),
  });
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => apiRequest(`/pharmacist/prescriptions/${id}`, { method: "PUT", body: { status } }),
    onSuccess: () => {
      toast.success("Prescription updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["pharmacist-dashboard"] });
    },
  });

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-6"><p className="text-sm text-muted-foreground">Pending queue</p><p className="mt-2 text-3xl font-bold">{data?.summary.pendingQueue ?? 0}</p></div>
        <div className="rounded-3xl border border-border bg-card p-6"><p className="text-sm text-muted-foreground">Needs clarification</p><p className="mt-2 text-3xl font-bold">{data?.summary.needsClarification ?? 0}</p></div>
        <div className="rounded-3xl border border-border bg-card p-6"><p className="text-sm text-muted-foreground">Recently reviewed</p><p className="mt-2 text-3xl font-bold">{data?.summary.reviewedToday ?? 0}</p></div>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Prescription queue</h1>
        <p className="mt-2 text-muted-foreground">Review the next prescription, record status changes, and keep patient updates moving.</p>
        <div className="mt-6 space-y-4">
          {(data?.queue || []).length ? data?.queue.map((prescription) => (
            <div key={prescription.id} className="rounded-3xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{prescription.reference}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{prescription.customerName} • {formatDate(prescription.createdAt)}</p>
                  {prescription.notes ? <p className="mt-3 text-sm text-muted-foreground">{prescription.notes}</p> : null}
                </div>
                <div className="flex gap-3">
                  <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={prescription.status} onChange={(event) => mutation.mutate({ id: prescription.id, status: event.target.value })}>
                    {PRESCRIPTION_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )) : (
            <div className="rounded-3xl border border-border bg-card p-10 text-center">
              <p className="text-lg font-medium">There are no prescriptions waiting for review right now.</p>
              <p className="mt-2 text-muted-foreground">New submissions will appear here automatically.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PharmacistReviewed() {
  const { data } = useQuery({
    queryKey: ["pharmacist-reviewed"],
    queryFn: () => apiRequest<{ prescriptions: Prescription[] }>("/pharmacist/reviewed"),
  });
  return (
    <div>
      <h1 className="text-3xl font-bold">Reviewed prescriptions</h1>
      <p className="mt-2 text-muted-foreground">A record of recently approved, rejected, and completed reviews.</p>
      <div className="mt-6 space-y-4">
        {(data?.prescriptions || []).map((prescription) => (
          <div key={prescription.id} className="rounded-3xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">{prescription.reference}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{prescription.customerName} • {prescription.status}</p>
            {prescription.pharmacistNotes ? <p className="mt-3 text-sm text-muted-foreground">{prescription.pharmacistNotes}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PharmacistNotes() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["pharmacist-notes"],
    queryFn: () => apiRequest<{ notes: Array<{ id: number; title: string; note: string; reference?: string }> }>("/pharmacist/notes"),
  });
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  const mutation = useMutation({
    mutationFn: () => apiRequest("/pharmacist/notes", { method: "POST", body: { title, note } }),
    onSuccess: () => {
      toast.success("Note saved successfully.");
      queryClient.invalidateQueries({ queryKey: ["pharmacist-notes"] });
      setTitle("");
      setNote("");
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-6">
        <h1 className="text-3xl font-bold">Pharmacist notes</h1>
        <p className="mt-2 text-muted-foreground">Record follow-up items, clarification requests, and review observations.</p>
        <div className="mt-4 space-y-4">
          <Input placeholder="Note title" value={title} onChange={(event) => setTitle(event.target.value)} />
          <Textarea placeholder="Write a clear note for the pharmacy team." value={note} onChange={(event) => setNote(event.target.value)} rows={6} />
          <Button className="w-full">{mutation.isPending ? "Saving note..." : "Save note"}</Button>
        </div>
      </form>

      <div className="rounded-3xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold">Recent notes</h2>
        <div className="mt-4 space-y-4">
          {(data?.notes || []).map((entry) => (
            <div key={entry.id} className="rounded-2xl bg-secondary p-4">
              <p className="font-medium">{entry.title}</p>
              {entry.reference ? <p className="mt-1 text-sm text-muted-foreground">{entry.reference}</p> : null}
              <p className="mt-2 text-sm text-muted-foreground">{entry.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PharmacistProfile() {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      <p className="mt-2 text-muted-foreground">Signed in as part of the pharmacist review team.</p>
      <div className="mt-6 rounded-2xl bg-secondary p-4 text-sm text-muted-foreground">
        This console is connected to the live prescription queue and pharmacist notes workspace.
      </div>
    </div>
  );
}
