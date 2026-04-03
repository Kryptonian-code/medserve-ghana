import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import { useBootstrap } from "@/hooks/use-bootstrap";
import type { Prescription } from "@/lib/types";
import { formatDate } from "@/lib/format";

export default function AccountPrescriptions() {
  const { data: bootstrap } = useBootstrap();
  const { data } = useQuery({
    queryKey: ["account-prescriptions"],
    queryFn: () => apiRequest<{ prescriptions: Prescription[] }>("/account/prescriptions"),
  });
  const emptyState = bootstrap?.systemText?.emptyStates?.accountPrescriptions;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Prescriptions</h1>
          <p className="mt-2 text-muted-foreground">Follow pharmacist review progress and check if clarification is needed.</p>
        </div>
        <Button asChild><Link to="/upload-prescription">Upload a prescription</Link></Button>
      </div>

      <div className="mt-6 space-y-4">
        {(data?.prescriptions || []).length ? data?.prescriptions.map((prescription) => (
          <div key={prescription.id} className="rounded-3xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{prescription.reference}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{formatDate(prescription.createdAt)}</p>
              </div>
              <div className="rounded-full bg-secondary px-4 py-2 text-sm">{prescription.status}</div>
            </div>
            {prescription.clarificationMessage ? (
              <div className="mt-4 rounded-2xl bg-warning/10 p-4 text-sm">{prescription.clarificationMessage}</div>
            ) : null}
            {prescription.pharmacistNotes ? (
              <div className="mt-4 rounded-2xl bg-secondary p-4 text-sm">
                <div className="font-medium">Pharmacist notes</div>
                <div className="mt-1 text-muted-foreground">{prescription.pharmacistNotes}</div>
              </div>
            ) : null}
          </div>
        )) : (
          <div className="rounded-3xl border border-border bg-card p-10 text-center">
            <p className="text-lg font-medium">{emptyState?.title || "You have not uploaded any prescriptions yet."}</p>
            <p className="mt-2 text-muted-foreground">{emptyState?.description || "Upload a prescription when you need pharmacist review."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
