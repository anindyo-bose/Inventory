import currencyConfig from '../config/currency.json';

export interface CurrencyConfig {
  symbol: string;
  code: string;
  name: string;
  position: 'before' | 'after';
  decimalPlaces: number;
}

export const formatCurrency = (amount: number): string => {
  const config = currencyConfig as CurrencyConfig;
  const formattedAmount = amount.toFixed(config.decimalPlaces);
  
  if (config.position === 'before') {
    return `${config.symbol}${formattedAmount}`;
  } else {
    return `${formattedAmount} ${config.symbol}`;
  }
};

export const getCurrencySymbol = (): string => {
  const config = currencyConfig as CurrencyConfig;
  return config.symbol;
};

export const getCurrencyCode = (): string => {
  const config = currencyConfig as CurrencyConfig;
  return config.code;
};




