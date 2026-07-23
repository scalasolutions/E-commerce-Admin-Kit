"use client";

import * as React from "react";
import Link from "next/link";
import { Pencil, Megaphone, QrCode, TrendingUp, Users } from "lucide-react";
import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminTableShell from "@/components/admin/admin-table-shell";
import AdminSearchInput from "@/components/admin/admin-search-input";
import AdminFilterBar from "@/components/admin/admin-filter-bar";
import AdminStatusBadge from "@/components/admin/admin-status-badge";
import AdminStatCard from "@/components/admin/admin-stat-card";
import { TableEmptyRow } from "@/components/admin/admin-table-states";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { usePagination } from "@/lib/hooks/use-pagination";
import { demoCampaigns, conversionPct, utmSubtitle } from "./campaigns-data";

export default function CampaignsPage() {
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return demoCampaigns.filter((c) => {
      const haystack = `${c.name} ${c.utmSource} ${c.utmMedium} ${c.utmCampaign}`.toLowerCase();
      const matchesQ = !q || haystack.includes(q);
      const matchesS = !statusFilter || c.status === statusFilter;
      return matchesQ && matchesS;
    });
  }, [query, statusFilter]);

  const pagination = usePagination(filtered, { initialPageSize: 10 });

  const totals = React.useMemo(() => {
    const scans = demoCampaigns.reduce((s, c) => s + c.scans, 0);
    const redeemed = demoCampaigns.reduce((s, c) => s + c.redeemed, 0);
    const conv = scans ? Math.round((redeemed / scans) * 100) : 0;
    return { scans, redeemed, conv };
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Campaigns"
        description="Tracked marketing links with UTM analytics and an optional attached voucher."
        actionLabel="Create campaign"
        actionHref="/demo/campaigns/new"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStatCard
          title="Total scans"
          value={totals.scans.toLocaleString("en-US")}
          description="Across all campaigns"
          icon={QrCode}
          tone="info"
        />
        <AdminStatCard
          title="Total redeemed"
          value={totals.redeemed.toLocaleString("en-US")}
          description="Orders attributed to a campaign"
          icon={Users}
          tone="success"
        />
        <AdminStatCard
          title="Avg conversion"
          value={`${totals.conv}%`}
          description="Redeemed ÷ scans"
          icon={TrendingUp}
          tone="accent"
        />
      </div>

      <AdminFilterBar
        search={<AdminSearchInput value={query} onChange={setQuery} placeholder="Search name or UTM…" />}
      >
        <Select className="h-9 w-40 text-xs" value={statusFilter} onValueChange={setStatusFilter}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </Select>
      </AdminFilterBar>

      <AdminTableShell pagination={filtered.length > 0 ? pagination : null}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Voucher</TableHead>
              <TableHead className="text-right">Scans</TableHead>
              <TableHead>Redeemed</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableEmptyRow colSpan={6} message={`No campaigns match “${query}”.`} />
            ) : (
              pagination.pageItems.map((c) => {
                const pct = conversionPct(c);
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-admin-accent-subdued text-admin-accent">
                          <Megaphone className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold text-admin-text">{c.name}</div>
                          <div className="truncate font-mono text-xs text-admin-text-subdued">
                            {utmSubtitle(c)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {c.voucherCode ? (
                        <Badge variant="outline" className="font-mono">
                          {c.voucherCode}
                        </Badge>
                      ) : (
                        <span className="text-admin-text-disabled">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium text-admin-text">
                      {c.scans.toLocaleString("en-US")}
                    </TableCell>
                    <TableCell>
                      <span className="text-admin-text">{c.redeemed.toLocaleString("en-US")}</span>
                      <span className="text-admin-text-subdued"> · {pct}%</span>
                    </TableCell>
                    <TableCell>
                      <AdminStatusBadge status={c.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/demo/campaigns/${c.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-admin-text-subdued transition-colors hover:bg-admin-surface-subdued hover:text-admin-text"
                        aria-label={`Edit ${c.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </AdminTableShell>
    </div>
  );
}
