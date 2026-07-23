"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  DollarSign,
  ShoppingCart,
  Package,
  Plus,
  Upload,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { MoneyInput } from "@/components/ui/money-input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import AdminStatCard from "@/components/admin/admin-stat-card";
import AdminStatusBadge from "@/components/admin/admin-status-badge";
import AdminSectionCard from "@/components/admin/admin-section-card";
import AdminEmptyState from "@/components/admin/admin-empty-state";
import AdminSearchInput from "@/components/admin/admin-search-input";
import AdminQuickActions from "@/components/admin/admin-quick-actions";
import AdminInlineStatusSelect from "@/components/admin/admin-inline-status-select";
import AdminAreaChart from "@/components/admin/admin-area-chart";
import AdminImageUpload from "@/components/admin/admin-image-upload";
import AdminGalleryUpload from "@/components/admin/admin-gallery-upload";
import AdminStorageUsage from "@/components/admin/admin-storage-usage";
import AdminFilterBar from "@/components/admin/admin-filter-bar";
import AdminBulkBar from "@/components/admin/admin-bulk-bar";
import { TableEmptyRow } from "@/components/admin/admin-table-states";

import { StorageProvider, createInMemoryStorageAdapter } from "@/lib/adapters/storage";
import { useRowSelection } from "@/lib/hooks/use-row-selection";
import { formatPrice } from "@/lib/utils";

const DEMO_ROWS = [
  { id: "r1", name: "Olive Oil 500ml", price: 189000, status: "active" },
  { id: "r2", name: "Wildflower Honey", price: 95000, status: "draft" },
  { id: "r3", name: "Pink Salt Grinder", price: 68000, status: "active" },
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8 space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-wider text-admin-text-disabled">{title}</h2>
      <div className="rounded-xl border border-admin-border bg-admin-surface p-6 shadow-admin">{children}</div>
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}

export default function GalleryPage() {
  const storage = React.useMemo(() => createInMemoryStorageAdapter({ quotaBytes: 5 * 1024 ** 3 }), []);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [checked, setChecked] = React.useState(true);
  const [on, setOn] = React.useState(true);
  const [status, setStatus] = React.useState("active");
  const [money, setMoney] = React.useState<number | null>(189000);
  const [search, setSearch] = React.useState("");
  const [cover, setCover] = React.useState("");
  const [gallery, setGallery] = React.useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const selection = useRowSelection(DEMO_ROWS.map((r) => r.id));

  return (
    <StorageProvider adapter={storage}>
      <div className="admin-shell min-h-screen bg-admin-surface-subdued text-admin-text">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-admin-text-subdued transition-colors hover:text-admin-text"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">Component gallery</h1>
          <p className="mt-1 text-sm text-admin-text-subdued">
            Every primitive and building block, in its common states.
          </p>

          <div className="mt-10 space-y-12">
            <Section id="buttons" title="Buttons">
              <div className="space-y-4">
                <Row>
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                </Row>
                <Row>
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button disabled>Disabled</Button>
                  <Button variant="primary" className="gap-1.5">
                    <Plus className="h-4 w-4" />
                    With icon
                  </Button>
                </Row>
              </div>
            </Section>

            <Section id="badges" title="Badges & status">
              <div className="space-y-4">
                <Row>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="danger">Danger</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge variant="neutral">Neutral</Badge>
                </Row>
                <Row>
                  <AdminStatusBadge status="paid" />
                  <AdminStatusBadge status="pending" />
                  <AdminStatusBadge status="shipped" />
                  <AdminStatusBadge status="cancelled" />
                  <AdminStatusBadge status="draft" />
                </Row>
                <Row>
                  <span className="text-xs text-admin-text-subdued">Editable inline:</span>
                  <AdminInlineStatusSelect
                    value={status}
                    options={[
                      { value: "active", label: "Active" },
                      { value: "draft", label: "Draft" },
                      { value: "inactive", label: "Inactive" },
                    ]}
                    onChange={async (s) => {
                      await new Promise((r) => setTimeout(r, 400));
                      setStatus(s);
                    }}
                  />
                </Row>
              </div>
            </Section>

            <Section id="inputs" title="Form controls">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="g-text">Text input</Label>
                  <Input id="g-text" placeholder="Type here…" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="g-money">Money input</Label>
                  <MoneyInput id="g-money" value={money} onValueChange={setMoney} allowEmpty />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="g-select">Select</Label>
                  <Select id="g-select" defaultValue="pantry">
                    <option value="pantry">Pantry</option>
                    <option value="spices">Spices</option>
                    <option value="beverages">Beverages</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="g-area">Textarea</Label>
                  <Textarea id="g-area" placeholder="A longer description…" rows={3} />
                </div>
                <div className="flex items-center gap-6">
                  <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} label="Checkbox" />
                  <div className="flex items-center gap-2">
                    <Switch checked={on} onCheckedChange={setOn} />
                    <span className="text-sm">Switch</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Search input</Label>
                  <AdminSearchInput value={search} onChange={setSearch} placeholder="Search…" />
                </div>
              </div>
            </Section>

            <Section id="stats" title="Stat cards">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <AdminStatCard title="Revenue" value={formatPrice(45600000)} icon={DollarSign} tone="success" trend={{ value: 12, direction: "up" }} />
                <AdminStatCard title="Orders" value={318} icon={ShoppingCart} tone="accent" trend={{ value: 4, direction: "down" }} />
                <AdminStatCard title="Low stock" value={6} icon={Package} tone="warning" />
              </div>
            </Section>

            <Section id="chart" title="Area chart">
              <AdminAreaChart
                data={[
                  { label: "Mon", value: 4200000 },
                  { label: "Tue", value: 5100000 },
                  { label: "Wed", value: 4800000 },
                  { label: "Thu", value: 6300000 },
                  { label: "Fri", value: 7900000 },
                  { label: "Sat", value: 9200000 },
                  { label: "Sun", value: 8100000 },
                ]}
                formatValue={(v) => formatPrice(v)}
              />
            </Section>

            <Section id="table" title="Table — bulk select, filter bar, states">
              <div className="space-y-4">
                <AdminFilterBar
                  search={<AdminSearchInput value={search} onChange={setSearch} placeholder="Search…" />}
                >
                  <Select className="h-9 w-40 text-xs" defaultValue="">
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                  </Select>
                </AdminFilterBar>

                <div className="rounded-xl border border-admin-border bg-admin-surface shadow-admin overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox
                            checked={selection.allSelected}
                            indeterminate={selection.someSelected}
                            onCheckedChange={selection.toggleAll}
                            aria-label="Select all"
                          />
                        </TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {DEMO_ROWS.length === 0 ? (
                        <TableEmptyRow colSpan={4} message="No products found." />
                      ) : (
                        DEMO_ROWS.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="w-10">
                              <Checkbox
                                checked={selection.isSelected(r.id)}
                                onCheckedChange={() => selection.toggle(r.id)}
                                aria-label={`Select ${r.name}`}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{r.name}</TableCell>
                            <TableCell className="text-right tabular-nums">{formatPrice(r.price)}</TableCell>
                            <TableCell>
                              <AdminStatusBadge status={r.status} />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <AdminBulkBar count={selection.count} onClear={selection.clear}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-1.5 text-admin-critical-text"
                    onClick={() => setConfirmOpen(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </AdminBulkBar>
              </div>
            </Section>

            <Section id="cards" title="Section card">
              <AdminSectionCard
                title="Shipping"
                description="Where orders ship from."
                action={<Badge variant="info">1 warehouse</Badge>}
              >
                <p className="text-sm text-admin-text-subdued">
                  Section cards group related form fields or read-only detail under a titled header.
                </p>
              </AdminSectionCard>
            </Section>

            <Section id="empty" title="Empty state">
              <AdminEmptyState
                title="No products yet"
                description="Add your first product to see it here."
                actionLabel="Add product"
                actionHref="/demo/products/new"
              />
            </Section>

            <Section id="uploads" title="Media & storage">
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <Label>Cover image (in-memory adapter)</Label>
                  <AdminImageUpload value={cover} onChange={setCover} folder="demo" />
                </div>
                <div className="space-y-1.5">
                  <Label>Gallery</Label>
                  <AdminGalleryUpload value={gallery} onChange={setGallery} folder="demo" maxImages={6} />
                </div>
                <div className="max-w-xs">
                  <AdminStorageUsage />
                </div>
              </div>
            </Section>

            <Section id="overlays" title="Overlays & menus">
              <Row>
                <Button onClick={() => setModalOpen(true)}>Open modal</Button>
                <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                  Confirm dialog
                </Button>
                <AdminQuickActions
                  actions={[
                    { label: "Add product", href: "/demo/products/new", icon: Plus },
                    { label: "Import CSV", href: "/gallery", icon: Upload },
                  ]}
                />
              </Row>
              <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Delete product?">
                <p className="text-sm text-admin-text-subdued">
                  This action can’t be undone. The product will be removed from your catalog.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="danger" className="gap-1.5" onClick={() => setModalOpen(false)}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </Modal>
              <ConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={async () => {
                  await new Promise((r) => setTimeout(r, 600));
                  selection.clear();
                }}
                title="Delete selected?"
                description="This can’t be undone. Async confirm — the button spins until it resolves."
                confirmLabel="Delete"
              />
            </Section>
          </div>
        </div>
      </div>
    </StorageProvider>
  );
}
