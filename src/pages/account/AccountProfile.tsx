import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AccountProfile = () => (
  <div>
    <h1 className="mb-2 text-2xl font-bold text-foreground">Profile settings</h1>
    <p className="mb-6 text-muted-foreground">Update your personal details and preferences.</p>
    <div className="max-w-lg space-y-4 rounded-xl border border-border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">First name</label>
          <Input defaultValue="Kofi" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Last name</label>
          <Input defaultValue="Mensah" />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
        <Input type="email" defaultValue="kofi@example.com" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Phone</label>
        <Input defaultValue="024 123 4567" />
      </div>
      <Button>Save Changes</Button>
    </div>
  </div>
);
export default AccountProfile;
