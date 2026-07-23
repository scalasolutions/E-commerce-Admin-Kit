"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import AdminFormSection from "@/components/admin/admin-form-section";
import AdminActionBar from "@/components/admin/admin-action-bar";
import AdminImageUpload from "@/components/admin/admin-image-upload";
import AdminGalleryUpload from "@/components/admin/admin-gallery-upload";
import AdminRichText from "@/components/admin/admin-rich-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MoneyInput } from "@/components/ui/money-input";
import { fireConfetti } from "@/components/ui/confetti";
import { findProduct, CATEGORY_OPTIONS } from "../../demo-data";

export default function ProductFormPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const isNew = params.id === "new";
  const existing = isNew ? undefined : findProduct(params.id);

  const [name, setName] = React.useState(existing?.name ?? "");
  const [sku, setSku] = React.useState(existing?.sku ?? "");
  const [category, setCategory] = React.useState(existing?.category ?? CATEGORY_OPTIONS[0]);
  const [price, setPrice] = React.useState<number | null>(existing?.price ?? null);
  const [active, setActive] = React.useState((existing?.status ?? "active") === "active");
  const [image, setImage] = React.useState(existing?.image ?? "");
  const [gallery, setGallery] = React.useState<string[]>([]);
  const [description, setDescription] = React.useState(
    "<p>Cold-pressed and unrefined, bottled at source.</p>"
  );
  const [saving, setSaving] = React.useState(false);

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    fireConfetti();
  }

  return (
    <div className="space-y-6 pb-24">
      <button
        onClick={() => router.push("/demo/products")}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-admin-text-subdued transition-colors hover:text-admin-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-admin-text">
          {isNew ? "New product" : existing?.name ?? "Product"}
        </h1>
        <p className="mt-1 text-sm text-admin-text-subdued">
          {isNew ? "Add a product to your catalog." : "Edit product details."}
        </p>
      </div>

      <AdminFormSection title="Basics" description="Name, SKU, and where it sits in the catalog.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Product name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Olive Oil 500ml" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="OO-500" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Select id="category" value={category} onValueChange={setCategory}>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price">Price</Label>
            <MoneyInput id="price" value={price} onValueChange={setPrice} allowEmpty placeholder="0" />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-admin-border-subtle bg-admin-surface-subdued/50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-admin-text">Active</p>
            <p className="text-xs text-admin-text-subdued">Visible in the storefront when on.</p>
          </div>
          <Switch checked={active} onCheckedChange={setActive} />
        </div>
      </AdminFormSection>

      <AdminFormSection title="Media" description="A cover image and an optional gallery.">
        <div className="space-y-1.5">
          <Label>Cover image</Label>
          <AdminImageUpload value={image} onChange={setImage} folder="products" />
        </div>
        <div className="space-y-1.5">
          <Label>Gallery</Label>
          <AdminGalleryUpload value={gallery} onChange={setGallery} folder="products/gallery" />
        </div>
      </AdminFormSection>

      <AdminFormSection title="Description" description="Rich text shown on the product page.">
        <AdminRichText value={description} onChange={setDescription} folder="products/content" />
      </AdminFormSection>

      <AdminActionBar>
        <Button variant="outline" onClick={() => router.push("/demo/products")}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving} className="gap-1.5">
          {saving ? "Saving…" : (
            <>
              <Check className="h-4 w-4" />
              {isNew ? "Create product" : "Save changes"}
            </>
          )}
        </Button>
      </AdminActionBar>
    </div>
  );
}
