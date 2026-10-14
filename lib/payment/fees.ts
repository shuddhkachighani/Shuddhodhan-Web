import { siteSettings } from "@/lib/data/settings";

// Configurable payment-processing charge (spec section 28). All zero/disabled
// until real gateway fee terms are supplied — never invented.
export function computePaymentFee(subtotalPlusShipping: number): number {
  const { fee } = siteSettings.payment;
  if (!fee.enabled) return 0;

  const percentageFee = (subtotalPlusShipping * fee.percentage) / 100;
  const fixedFee = fee.fixedFeePaise / 100;
  const baseFee = percentageFee + fixedFee;
  const tax = (baseFee * fee.taxOnFeePercentage) / 100;

  return Math.round((baseFee + tax) * 100) / 100;
}
