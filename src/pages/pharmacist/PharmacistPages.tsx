import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const queue = [
  { id: "RX-001", patient: "Ama Owusu", date: "2 Apr 2026", status: "Pending" },
  { id: "RX-002", patient: "Kwame Asante", date: "2 Apr 2026", status: "Pending" },
  { id: "RX-003", patient: "Abena Mensah", date: "1 Apr 2026", status: "In Review" },
];

export const PharmacistQueue = () => (
  <div>
    <h1 className="mb-2 text-2xl font-bold text-foreground">Prescription Queue</h1>
    <p className="mb-6 text-muted-foreground">Review and process incoming prescription requests.</p>
    <div className="space-y-3">
      {queue.map((rx) => (
        <div key={rx.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
          <div>
            <div className="font-medium text-foreground">{rx.patient}</div>
            <div className="text-xs text-muted-foreground">{rx.id} · Submitted {rx.date}</div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={rx.status === "Pending" ? "secondary" : "default"}>{rx.status}</Badge>
            <Button size="sm">Review</Button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const PharmacistReviewed = () => (
  <div>
    <h1 className="mb-2 text-2xl font-bold text-foreground">Reviewed Prescriptions</h1>
    <p className="mb-6 text-muted-foreground">Prescriptions you have already reviewed and processed.</p>
    <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
      No reviewed prescriptions to display yet.
    </div>
  </div>
);

export const PharmacistProfile = () => (
  <div>
    <h1 className="mb-2 text-2xl font-bold text-foreground">Your Profile</h1>
    <p className="mb-6 text-muted-foreground">View and update your pharmacist profile details.</p>
    <div className="max-w-md rounded-xl border border-border bg-card p-6">
      <p className="text-sm text-muted-foreground">Profile management will be available once backend is connected.</p>
    </div>
  </div>
);
