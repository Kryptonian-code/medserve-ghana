const AccountPrescriptions = () => (
  <div>
    <h1 className="mb-2 text-2xl font-bold text-foreground">Your prescriptions</h1>
    <p className="mb-6 text-muted-foreground">Track the status of prescriptions you have submitted.</p>
    <div className="rounded-xl border border-border bg-card p-10 text-center">
      <p className="text-muted-foreground">You have not submitted any prescriptions yet. Upload one to get started.</p>
    </div>
  </div>
);
export default AccountPrescriptions;
