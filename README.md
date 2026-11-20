# Metro / Bakı

Azərbaycan dilində, rəsmi açıq məlumatlarla işləyən React + Vite dashboard-u.

## İşə salmaq

`npm install` və `npm run dev -- --port 5173`. İstehsal versiyası: `npm run build`.

## Mənbə

DSK: https://www.stat.gov.az/source/transport/az/018_1.xls

19 noyabr 2026-da yüklənib. Orijinal public/metro-source.xls, təmizlənmiş 36 illik məlumat src/data.json. Excel-in birinci vərəqində illər 4-cü sətirdə, stansiyalar 7-ci, uzunluq 8-ci, vaqonlar 9-cu, milyon sərnişin 10-cu sətirdədir. 1990–2025. Avtomatik yenilənmə yoxdur.

Faiz dəyişməsi: (son − ilk) / ilk × 100. Sərnişin sayı gedişlərin sayıdır. Stansiya başına göstərici sadə şəbəkə ortalamasıdır, real doluluq deyil. Səbəb izahları fərziyyə kimi göstərilir.

## Information and forecasts
The “Platforma və təhlil” page explains usage, 2019–2025 structural comparisons, recovery and demand intensity. Rebuild the statistical artifact with `python scripts/analyze.py` after changing `src/data.json`.
Four baseline models are compared by rolling one-step MAE for target years 2010–2025, without future observations in training. The selected last-value model projects 226.8 million trips for 2026–2028, as of 2025. The approximate nominal 80% interval uses `1.2815515655 * backtest_RMSE * sqrt(h)` under a random-walk/normal-error assumption; it is not independently calibrated. Pandemic shocks remain in evaluation. No infrastructure forecasts are inferred from construction-dependent annual counts. UI includes source/method links, all assumptions, model errors, and multi-horizon backtest errors.
