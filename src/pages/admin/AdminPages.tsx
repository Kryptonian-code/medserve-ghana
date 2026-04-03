const AdminPlaceholder = ({ title }: { title: string }) => (
  <div>
    <h1 className="mb-2 text-2xl font-bold text-foreground">{title}</h1>
    <p className="mb-6 text-muted-foreground">Manage {title.toLowerCase()} from this section.</p>
    <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
      This section is ready for backend integration.
    </div>
  </div>
);

// AdminProducts moved to AdminProductsPage.tsx
export const AdminCategories = () => <AdminPlaceholder title="Categories" />;
export const AdminOrders = () => <AdminPlaceholder title="Orders" />;
export const AdminPrescriptions = () => <AdminPlaceholder title="Prescriptions" />;
export const AdminCustomers = () => <AdminPlaceholder title="Customers" />;
export const AdminInventory = () => <AdminPlaceholder title="Inventory" />;
export const AdminContent = () => <AdminPlaceholder title="Content" />;
export const AdminFAQ = () => <AdminPlaceholder title="FAQ" />;
export const AdminHomepage = () => <AdminPlaceholder title="Homepage" />;
export const AdminSettings = () => <AdminPlaceholder title="Settings" />;
export const AdminUsers = () => <AdminPlaceholder title="Users and Roles" />;
export const AdminReports = () => <AdminPlaceholder title="Reports" />;
