"use client";

import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminStatCard from "@/components/admin/admin-stat-card";
import AdminSectionCard from "@/components/admin/admin-section-card";
import AdminAreaChart from "@/components/admin/admin-area-chart";
import { formatPrice } from "@/app/format";

const revenue = [
  { label: "Mon", value: 4200000 },
  { label: "Tue", value: 5100000 },
  { label: "Wed", value: 4800000 },
  { label: "Thu", value: 6300000 },
  { label: "Fri", value: 7900000 },
  { label: "Sat", value: 9200000 },
  { label: "Sun", value: 8100000 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Dashboard" description="Store performance at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title="Revenue (7d)"
          value={formatPrice(45600000)}
          icon={DollarSign}
          tone="success"
          trend={{ value: 12, direction: "up" }}
        />
        <AdminStatCard
          title="Orders"
          value={318}
          icon={ShoppingCart}
          tone="accent"
          trend={{ value: 4, direction: "up" }}
        />
        <AdminStatCard
          title="New customers"
          value={54}
          icon={Users}
          tone="info"
          trend={{ value: 3, direction: "down" }}
        />
        <AdminStatCard title="Low-stock SKUs" value={6} icon={Package} tone="warning" />
      </div>

      <AdminSectionCard title="Revenue" description="Daily gross revenue, last 7 days.">
        <AdminAreaChart data={revenue} formatValue={(v) => formatPrice(v)} />
      </AdminSectionCard>
    </div>
  );
}
