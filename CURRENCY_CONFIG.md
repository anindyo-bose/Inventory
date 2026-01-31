# Currency Configuration Guide

The currency used throughout the application is configurable via a JSON configuration file.

## Configuration File

Location: `frontend/src/config/currency.json`

## Current Configuration

```json
{
  "symbol": "$",
  "code": "USD",
  "name": "US Dollar",
  "position": "before",
  "decimalPlaces": 2
}
```

## Configuration Options

- **symbol**: The currency symbol to display (e.g., "$", "€", "£", "₹", "¥")
- **code**: ISO currency code (e.g., "USD", "EUR", "GBP", "INR", "JPY")
- **name**: Full name of the currency
- **position**: Where to place the symbol relative to the amount
  - `"before"`: Symbol before amount (e.g., "$100.00")
  - `"after"`: Symbol after amount (e.g., "100.00 $")
- **decimalPlaces**: Number of decimal places to display (typically 2)

## Changing the Currency

To change the currency, simply edit `frontend/src/config/currency.json`:

### Example: Change to Euro (€)

```json
{
  "symbol": "€",
  "code": "EUR",
  "name": "Euro",
  "position": "before",
  "decimalPlaces": 2
}
```

### Example: Change to Indian Rupee (₹)

```json
{
  "symbol": "₹",
  "code": "INR",
  "name": "Indian Rupee",
  "position": "before",
  "decimalPlaces": 2
}
```

### Example: Change to British Pound (£) with symbol after

```json
{
  "symbol": "£",
  "code": "GBP",
  "name": "British Pound",
  "position": "before",
  "decimalPlaces": 2
}
```

## Usage in Code

The currency formatting is handled automatically through utility functions:

- `formatCurrency(amount)`: Formats a number with the configured currency
- `getCurrencySymbol()`: Returns just the currency symbol
- `getCurrencyCode()`: Returns the currency code

All components automatically use these utilities, so changing the config file will update the currency throughout the entire application.

## Affected Components

The currency configuration affects:
- Transaction Management (all amounts)
- Repair Management (costs, charges, profit)
- Supplier Management (bills, payments, dues)
- All statistics and totals
- All form labels and placeholders




