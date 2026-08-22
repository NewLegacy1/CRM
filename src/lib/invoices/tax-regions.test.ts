import { describe, expect, it } from 'vitest'
import {
  DEFAULT_TAX_REGION,
  exclusiveTaxFromLineItems,
  getTaxRegion,
  invoiceTaxTotals,
} from './tax-regions'

describe('tax regions', () => {
  it('defaults to Ontario HST at 13%', () => {
    const ontario = getTaxRegion(DEFAULT_TAX_REGION)
    expect(ontario?.name).toBe('Ontario')
    expect(ontario?.percent).toBe(13)
    expect(ontario?.label).toBe('HST')
  })

  it('adds exclusive tax on top of the unit price', () => {
    const tax = exclusiveTaxFromLineItems(
      [{ quantity: 1, unit_amount: 1000 }],
      13
    )
    expect(tax).toBe(130)
  })

  it('returns subtotal only when tax is off', () => {
    const ontario = getTaxRegion('ON')
    const totals = invoiceTaxTotals(
      [{ quantity: 1, unit_amount: 750 }],
      ontario,
      false
    )
    expect(totals.subtotal).toBe(750)
    expect(totals.taxAmount).toBe(0)
    expect(totals.total).toBe(750)
  })

  it('includes Ontario HST in the total when tax is on', () => {
    const ontario = getTaxRegion('ON')
    const totals = invoiceTaxTotals(
      [{ quantity: 1, unit_amount: 750 }],
      ontario,
      true
    )
    expect(totals.taxAmount).toBe(97.5)
    expect(totals.total).toBe(847.5)
  })
})
