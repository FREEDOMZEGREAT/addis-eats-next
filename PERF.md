# Performance Budget and Results

## Budgets

| Metric                        |               Target |
| ----------------------------- | -------------------: |
| Lighthouse Performance        |                >= 90 |
| Largest Contentful Paint      |              < 2.5 s |
| Cumulative Layout Shift       |                < 0.1 |
| `/menu` first-load JavaScript | < 120 kB transferred |
| Largest delivered image       |             < 150 kB |

## Before and after

Measured with Lighthouse 13.5.0 against a production `next start` build on `/menu`, mobile emulation, 2026-10-10. JavaScript is the sum of script `transferSize` from Lighthouse's network requests; page transfer is Lighthouse `total-byte-weight`. Three final runs are reported as a range because the local machine produced substantial score/LCP variance.

| Metric                      |   Before |                After | Target status         |
| --------------------------- | -------: | -------------------: | --------------------- |
| Lighthouse Performance      |       69 |       64-85 (3 runs) | Not met consistently  |
| LCP                         |   7.77 s | 3.77-4.28 s (3 runs) | Not met               |
| CLS                         |  0.00005 |                    0 | Met                   |
| `/menu` JavaScript transfer | 181.0 kB |             165.5 kB | Not met               |
| Total page transfer         |  1.62 MB |               700 kB | Improved by about 57% |
| Largest delivered image     | 192.9 kB |             110.2 kB | Met                   |

## Optimizations in the measured build

- Only the first menu image is preloaded and given high fetch priority; the remaining card images are lazy-loaded.
- Menu card image quality is 35, allowed by `images.qualities` in `next.config.mjs`.
- Unused global query-library providers were removed. Search stays debounced and order status continues polling from server-provided initial data.
- App fonts use `next/font` with the Latin subset and `display: swap`.

## Reproduce

From the project directory:

```bash
npm ci
npm run build
PORT=3001 npm run start
npx --yes lighthouse@13.5.0 http://127.0.0.1:3001/menu --only-categories=performance --output=json --output-path=./lighthouse-menu.json --chrome-flags="--headless=new --no-sandbox"
```

Use the same machine, Lighthouse version, route, and production build for comparisons. Treat individual local scores as noisy until confirmed on a calibrated or deployed environment.

## Remaining gaps

LCP and the JavaScript budget remain above target, and the performance score has not reached 90 in the captured runs. Further work should begin with route-level bundle analysis and repeatable LCP measurement. The configured public deployment returned HTTP 404 during the 2026-10-10 review, so these local production results are not a deployed-site verification.
