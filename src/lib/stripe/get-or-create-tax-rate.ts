import type Stripe from 'stripe'
import { taxRateKey, type TaxRegion } from '@/lib/invoices/tax-regions'

export async function getOrCreateTaxRate(
  stripe: Stripe,
  region: TaxRegion
): Promise<string> {
  const key = taxRateKey(region)
  const existing = await stripe.taxRates.list({ active: true, limit: 100 })
  const match = existing.data.find((rate) => rate.metadata?.crm_tax_key === key)
  if (match) return match.id

  const created = await stripe.taxRates.create({
    display_name: region.label,
    description: `${region.name} ${region.label}`,
    jurisdiction: region.jurisdiction,
    percentage: region.percent,
    inclusive: false,
    country: region.country,
    state: region.state,
    ...(region.taxType ? { tax_type: region.taxType } : {}),
    metadata: { crm_tax_key: key },
  })

  return created.id
}

export function stripeTaxAmountCents(
  invoice: Pick<Stripe.Invoice, 'total_taxes' | 'total' | 'total_excluding_tax'>
): number {
  const listed = (invoice.total_taxes ?? []).reduce((sum, row) => sum + row.amount, 0)
  if (listed > 0) return listed
  if (
    typeof invoice.total === 'number' &&
    typeof invoice.total_excluding_tax === 'number'
  ) {
    return Math.max(0, invoice.total - invoice.total_excluding_tax)
  }
  return 0
}
