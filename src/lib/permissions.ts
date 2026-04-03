import type { UserRole } from "@/lib/types";

export const rolePermissions: Record<UserRole, string[]> = {
  super_admin: ["*"],
  admin: [
    "dashboard.view",
    "products.view", "products.create", "products.update", "products.delete",
    "categories.view", "categories.create", "categories.update", "categories.delete",
    "orders.view", "orders.update",
    "prescriptions.view", "prescriptions.update",
    "customers.view",
    "inventory.view",
    "content.view", "content.update",
    "reports.view",
    "users.view",
  ],
  manager: [
    "dashboard.view",
    "products.view", "products.create", "products.update",
    "categories.view", "categories.create", "categories.update",
    "orders.view", "orders.update",
    "prescriptions.view",
    "customers.view",
    "inventory.view",
    "reports.view",
  ],
  editor: ["content.view", "content.update", "products.view", "categories.view"],
  support_staff: ["dashboard.view", "orders.view", "customers.view", "prescriptions.view"],
  finance_manager: ["dashboard.view", "orders.view", "orders.update", "reports.view"],
  content_manager: ["content.view", "content.update", "products.view", "categories.view"],
  pharmacist: ["dashboard.view", "prescriptions.view", "prescriptions.update", "notes.view", "notes.create"],
  customer: ["account.view", "orders.create", "orders.view_own", "prescriptions.create", "prescriptions.view_own", "addresses.manage", "profile.manage"],
};

export function hasPermission(role: UserRole | undefined, permission: string) {
  if (!role) return false;
  const permissions = rolePermissions[role] || [];
  return permissions.includes("*") || permissions.includes(permission);
}
