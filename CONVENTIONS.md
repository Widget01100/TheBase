# The Base - Coding Conventions

These rules are non-negotiable. They encode the invariants that past bugs taught us.

## 1. Currency - raw vs. display

- Storage: All monetary amounts are stored in KES (the base currency).
- Conversion: Convert at render time using useCurrency().convert(amountInKES).
- Formatting: Format with useFormatCurrency() or the format() function from context.
- NEVER put a raw number next to currency.symbol in JSX. Always go through convert() or format().
- Charts: Convert the data series at the source (inside the useMemo), not inside tickFormat.

## 2. Theme (dark mode)

- Single source of truth: AppContext (useApp()).
- NEVER use local useState for darkMode in a page.
- NEVER manually toggle document.documentElement.classList. The context does it.
- Toggle via toggleDarkMode() from context.

## 3. Charts (Victory)

- NEVER use VictoryVoronoiContainer - it forces all labels to render always.
- Use labelComponent with VictoryTooltip directly on VictoryBar / VictoryLine.
- X-axis tickFormat: pass the array of labels.
- Y-axis tickFormat: values must already be converted at the data source.

## 4. Type imports

- ALWAYS use import type for types, interfaces, type-only imports.
- Previously bitten by: DailyActivity, ExportableTransaction, ReactNode, LucideIcon.

## 5. Build gate

- npm run build must pass before any commit.
- npx tsc --noEmit must return 0 errors.
- No ts-ignore without an explanatory comment.

## 6. Test coverage for known bug classes

- src/utils/__tests__/currency-conversion.test.ts guards the currency bug on Dashboard. Do not delete.
- Every new user-visible bug gets a regression test in the same PR.

## 7. When in doubt

- Ask: Does this hold when currency != KES and darkMode == true?
- Ask: What happens when the data is empty, null, NaN, or negative?
- Ask: Will this still be correct 6 months from now?
