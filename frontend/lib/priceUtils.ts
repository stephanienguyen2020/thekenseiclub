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

// Format price for display with appropriate decimal places
export function formatPrice(price: number | string, options: {
  compact?: boolean;
  prefix?: string;
  suffix?: string;
  minDecimals?: number;
  maxDecimals?: number;
} = {}): string {
  const {
    compact = false,
    prefix = '$',
    suffix = '',
    minDecimals = 0,
    maxDecimals = 8
  } = options;

  const bnPrice = new BigNumber(price);
  
  if (bnPrice.isZero()) {
    return `${prefix}0${suffix}`;
  }

  // Handle compact notation for large numbers
  if (compact && bnPrice.gte(1000)) {
    const compacted = bnPrice.toFormat(2, {
      prefix,
      suffix,
      decimalSeparator: '.',
      groupSeparator: ',',
      groupSize: 3
    });
    return compacted;
  }

  // Determine appropriate decimal places based on price magnitude
  let decimals = minDecimals;
  if (bnPrice.gte(1)) {
    decimals = Math.max(minDecimals, Math.min(maxDecimals, 2));
  } else if (bnPrice.gte(0.1)) {
    decimals = Math.max(minDecimals, Math.min(maxDecimals, 4));
  } else if (bnPrice.gte(0.01)) {
    decimals = Math.max(minDecimals, Math.min(maxDecimals, 6));
  } else {
    decimals = Math.max(minDecimals, Math.min(maxDecimals, 8));
  }

  // Format with determined decimal places
  return `${prefix}${bnPrice.toFormat(decimals, {
    decimalSeparator: '.',
    groupSeparator: ',',
    groupSize: 3
  })}${suffix}`;
}

// Format percentage with appropriate decimal places
export function formatPercentage(value: number | string, options: {
  minDecimals?: number;
  maxDecimals?: number;
  showSign?: boolean;
} = {}): string {
  const {
    minDecimals = 0,
    maxDecimals = 2,
    showSign = true
  } = options;

  const bnValue = new BigNumber(value);
  const sign = showSign && bnValue.gt(0) ? '+' : '';
  
  return `${sign}${bnValue.toFormat(Math.min(maxDecimals, Math.max(minDecimals, 2)))}%`;
}

// Format large numbers (e.g., market cap, volume)
export function formatLargeNumber(value: number | string, options: {
  compact?: boolean;
  prefix?: string;
  suffix?: string;
  decimals?: number;
} = {}): string {
  const {
    compact = true,
    prefix = '$',
    suffix = '',
    decimals = 2
  } = options;

  const bnValue = new BigNumber(value);
  
  if (bnValue.isZero()) {
    return `${prefix}0${suffix}`;
  }

  if (compact) {
    if (bnValue.gte(1e9)) {
      return `${prefix}${bnValue.dividedBy(1e9).toFormat(decimals)}B${suffix}`;
    } else if (bnValue.gte(1e6)) {
      return `${prefix}${bnValue.dividedBy(1e6).toFormat(decimals)}M${suffix}`;
    } else if (bnValue.gte(1e3)) {
      return `${prefix}${bnValue.dividedBy(1e3).toFormat(decimals)}K${suffix}`;
    }
  }

  return `${prefix}${bnValue.toFormat(decimals, {
    decimalSeparator: '.',
    groupSeparator: ',',
    groupSize: 3
  })}${suffix}`;
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

// Format long addresses with ellipsis
export function formatAddress(address: string, startLength: number = 6, endLength: number = 4): string {
  if (!address || address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
} 