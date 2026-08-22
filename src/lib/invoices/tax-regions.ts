export const DEFAULT_TAX_REGION = 'ON'

export type StripeTaxType = 'gst' | 'hst' | 'pst' | 'qst' | 'rst'

export type TaxRegion = {
  code: string
  name: string
  label: string
  percent: number
  country: 'CA'
  state: string
  taxType: StripeTaxType | null
  jurisdiction: string
}

export const TAX_REGIONS: TaxRegion[] = [
  {
    code: 'ON',
    name: 'Ontario',
    label: 'HST',
    percent: 13,
    country: 'CA',
    state: 'ON',
    taxType: 'hst',
    jurisdiction: 'Ontario, Canada',
  },
  {
    code: 'AB',
    name: 'Alberta',
    label: 'GST',
    percent: 5,
    country: 'CA',
    state: 'AB',
    taxType: 'gst',
    jurisdiction: 'Alberta, Canada',
  },
  {
    code: 'BC',
    name: 'British Columbia',
    label: 'GST + PST',
    percent: 12,
    country: 'CA',
    state: 'BC',
    taxType: null,
    jurisdiction: 'British Columbia, Canada',
  },
  {
    code: 'MB',
    name: 'Manitoba',
    label: 'GST + RST',
    percent: 12,
    country: 'CA',
    state: 'MB',
    taxType: 'rst',
    jurisdiction: 'Manitoba, Canada',
  },
  {
    code: 'NB',
    name: 'New Brunswick',
    label: 'HST',
    percent: 15,
    country: 'CA',
    state: 'NB',
    taxType: 'hst',
    jurisdiction: 'New Brunswick, Canada',
  },
  {
    code: 'NL',
    name: 'Newfoundland and Labrador',
    label: 'HST',
    percent: 15,
    country: 'CA',
    state: 'NL',
    taxType: 'hst',
    jurisdiction: 'Newfoundland and Labrador, Canada',
  },
  {
    code: 'NS',
    name: 'Nova Scotia',
    label: 'HST',
    percent: 14,
    country: 'CA',
    state: 'NS',
    taxType: 'hst',
    jurisdiction: 'Nova Scotia, Canada',
  },
  {
    code: 'NT',
    name: 'Northwest Territories',
    label: 'GST',
    percent: 5,
    country: 'CA',
    state: 'NT',
    taxType: 'gst',
    jurisdiction: 'Northwest Territories, Canada',
  },
  {
    code: 'NU',
    name: 'Nunavut',
    label: 'GST',
    percent: 5,
    country: 'CA',
    state: 'NU',
    taxType: 'gst',
    jurisdiction: 'Nunavut, Canada',
  },
  {
    code: 'PE',
    name: 'Prince Edward Island',
    label: 'HST',
    percent: 15,
    country: 'CA',
    state: 'PE',
    taxType: 'hst',
    jurisdiction: 'Prince Edward Island, Canada',
  },
  {
    code: 'QC',
    name: 'Quebec',
    label: 'GST + QST',
    percent: 14.975,
    country: 'CA',
    state: 'QC',
    taxType: 'qst',
    jurisdiction: 'Quebec, Canada',
  },
  {
    code: 'SK',
    name: 'Saskatchewan',
    label: 'GST + PST',
    percent: 11,
    country: 'CA',
    state: 'SK',
    taxType: null,
    jurisdiction: 'Saskatchewan, Canada',
  },
  {
    code: 'YT',
    name: 'Yukon',
    label: 'GST',
    percent: 5,
    country: 'CA',
    state: 'YT',
    taxType: 'gst',
    jurisdiction: 'Yukon, Canada',
  },
]

export function getTaxRegion(code: string | null | undefined): TaxRegion | null {
  if (!code) return null
  return TAX_REGIONS.find((region) => region.code === code) ?? null
}

export function taxRateKey(region: TaxRegion): string {
  return `CA-${region.state}-${region.percent}-exclusive`
}

export function exclusiveTaxCents(subtotalCents: number, percent: number): number {
  return Math.round((subtotalCents * percent) / 100)
}

export function exclusiveTaxFromLineItems(
  lineItems: Array<{ quantity: number; unit_amount: number }>,
  percent: number
): number {
  const taxCents = lineItems.reduce((sum, row) => {
    const lineCents = Math.round(Number(row.quantity) * Number(row.unit_amount) * 100)
    return sum + exclusiveTaxCents(lineCents, percent)
  }, 0)
  return taxCents / 100
}

export function invoiceTaxTotals(
  lineItems: Array<{ quantity: number; unit_amount: number }>,
  region: TaxRegion | null,
  taxEnabled: boolean
): { subtotal: number; taxAmount: number; total: number } {
  const subtotal = lineItems.reduce(
    (sum, row) => sum + Number(row.quantity) * Number(row.unit_amount),
    0
  )
  const taxAmount =
    taxEnabled && region ? exclusiveTaxFromLineItems(lineItems, region.percent) : 0
  return {
    subtotal,
    taxAmount,
    total: subtotal + taxAmount,
  }
}
