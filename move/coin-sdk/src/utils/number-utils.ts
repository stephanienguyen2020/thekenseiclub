import BigNumber from 'bignumber.js';

// Constants for price calculations
export const DECIMALS = 9;
export const DECIMAL_MULTIPLIER = new BigNumber(10).pow(DECIMALS);

// Configure BigNumber
BigNumber.config({
  DECIMAL_PLACES: DECIMALS,
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
  EXPONENTIAL_AT: [-DECIMALS, DECIMALS]
});

// Convert from human-readable number to blockchain format (with decimals)
export function toBlockchainAmount(amount: number | string): bigint {
  const bnAmount = new BigNumber(amount);
  const scaledAmount = bnAmount.times(DECIMAL_MULTIPLIER);
  return BigInt(scaledAmount.integerValue().toString());
}

// Convert from blockchain format to human-readable number
export function fromBlockchainAmount(amount: bigint | string): number {
  const bnAmount = new BigNumber(amount.toString());
  return bnAmount.dividedBy(DECIMAL_MULTIPLIER).toNumber();
}

// Safe arithmetic operations
export function safeMultiply(a: number | string, b: number | string): number {
  const bnA = new BigNumber(a);
  const bnB = new BigNumber(b);
  return bnA.times(bnB).toNumber();
}

export function safeDivide(a: number | string, b: number | string): number {
  const bnA = new BigNumber(a);
  const bnB = new BigNumber(b);
  if (bnB.isZero()) {
    throw new Error('Division by zero');
  }
  return bnA.dividedBy(bnB).toNumber();
}

export function safeAdd(a: number | string, b: number | string): number {
  const bnA = new BigNumber(a);
  const bnB = new BigNumber(b);
  return bnA.plus(bnB).toNumber();
}

export function safeSubtract(a: number | string, b: number | string): number {
  const bnA = new BigNumber(a);
  const bnB = new BigNumber(b);
  return bnA.minus(bnB).toNumber();
}

// Format price for display
export function formatPrice(price: number | string, decimals: number = 2): string {
  return new BigNumber(price).toFixed(decimals);
} 