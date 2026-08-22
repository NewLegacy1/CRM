'use client'

import { Label } from '@/components/ui/label'
import {
  DEFAULT_TAX_REGION,
  TAX_REGIONS,
  getTaxRegion,
  invoiceTaxTotals,
} from '@/lib/invoices/tax-regions'

type InvoiceTaxFieldsProps = {
  taxEnabled: boolean
  regionCode: string
  currency: string
  lineItems: Array<{ quantity: number; unit_amount: number }>
  onTaxEnabledChange: (enabled: boolean) => void
  onRegionChange: (code: string) => void
}

export function InvoiceTaxFields({
  taxEnabled,
  regionCode,
  currency,
  lineItems,
  onTaxEnabledChange,
  onRegionChange,
}: InvoiceTaxFieldsProps) {
  const region = getTaxRegion(regionCode) ?? getTaxRegion(DEFAULT_TAX_REGION)
  const { subtotal, taxAmount, total } = invoiceTaxTotals(
    lineItems,
    region,
    taxEnabled
  )
  const currencyCode = currency.toUpperCase()

  return (
    <div className="space-y-3 rounded-lg border border-zinc-700 p-3">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-200">
        <input
          type="checkbox"
          checked={taxEnabled}
          onChange={(e) => onTaxEnabledChange(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-600 bg-zinc-800"
        />
        Add tax on top of the unit price
      </label>

      {taxEnabled ? (
        <div>
          <Label htmlFor="taxRegion">Tax region</Label>
          <select
            id="taxRegion"
            value={region?.code ?? DEFAULT_TAX_REGION}
            onChange={(e) => onRegionChange(e.target.value)}
            className="mt-1 flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
          >
            {TAX_REGIONS.map((option) => (
              <option key={option.code} value={option.code}>
                {option.name} — {option.label} {option.percent}%
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-zinc-500">
            Stripe will charge this exclusive tax on the invoice. Ontario is the
            default; change it if the work is billed in another province.
          </p>
        </div>
      ) : null}

      <div className="space-y-1 text-sm">
        <div className="flex justify-between text-zinc-400">
          <span>Subtotal</span>
          <span>
            {currencyCode} {subtotal.toFixed(2)}
          </span>
        </div>
        {taxEnabled && region ? (
          <div className="flex justify-between text-zinc-400">
            <span>
              {region.label} {region.percent}% ({region.name})
            </span>
            <span>
              {currencyCode} {taxAmount.toFixed(2)}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between font-medium text-zinc-200">
          <span>Total</span>
          <span>
            {currencyCode} {total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}
