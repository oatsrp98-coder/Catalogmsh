# Catalogmsh

เว็บแอปสร้างแคตตาล็อกเครื่องมือแพทย์ โทนเขียว พร้อมเพิ่มรูปสินค้า แก้ไขข้อความ เลือกแม่แบบ และพิมพ์ PDF ขนาด A4

## Catalog design

- Looped Thai Sarabun Regular / SemiBold fonts, bundled for offline use.
- Six paired palettes: green with gold, coral, navy, plum, terracotta, or sky blue. Main and accent colors can also be adjusted independently.
- Six layouts: editorial rows, two-column cards, compact rows, large-image showcase, alternating image sides, and a featured first product.
- Left/right image placement for row layouts and the featured product; up/down controls change product order and which item is featured.
- Layout, colors, order, product data, and images persist in the existing browser catalog.

## Development

Requires Node.js 22.12+ (validated with Node.js 24).

```sh
npm ci
npm run dev
```

## Production build

```sh
npm run build
npm run preview
```

## Vercel

Import this GitHub repository into Vercel. The included `vercel.json` configures Vite, `npm ci`, `npm run build`, and the `dist` output directory. No environment variables are required.

Alternatively, from this directory:

```sh
npx vercel login
npx vercel --prod
```

## Gemini design collaboration (development only)

The optional `scripts/gemini-review.py` tool asks the Gemini API to review current source files and screenshots using `docs/gemini-ux-brief.md`. This is a development tool; the deployed catalog never receives an API key or calls Gemini.

Configure `GEMINI_API_KEY` securely through environment settings, with HTTPS access to `generativelanguage.googleapis.com`. Never put the credential in browser code, Git, or command arguments. Use an API key from Google AI Studio. The tool uses the account's highest-version stable general-purpose Gemini Pro model returned by the model list; choose another available model with `--model` if desired. Requests may incur Google API charges.

Prepare the request without calling Google:

```sh
python3 scripts/gemini-review.py --prepare-only
```

List available models and request a review:

```sh
python3 scripts/gemini-review.py --list-models
python3 scripts/gemini-review.py --screenshot /path/to/desktop.png --screenshot /path/to/mobile.png
```

Outputs go to `/workspace/catalog-gemini-review` by default. `review.md` indicates a complete response; `review-partial.md` is an incomplete response and returns a nonzero exit status. The tool does not edit or deploy the app. Review the design recommendations, implement selected changes, then validate the browser workflow and A4 output before publishing.

## Standalone download

Open `download/medical-catalog.html` in a browser. Regenerate the standalone HTML and ZIP after changes with:

```sh
python3 scripts/package-download.py
```

## Catalog storage and PDF export

Catalogs and images are saved in browser localStorage on the current device and origin. Opening the app on a new domain or device does not transfer existing catalogs. There is no shared database or user account system.

Use the PDF A4 button, select Save as PDF, choose A4 paper at 100% scale, and disable browser headers and footers.

Sarabun Regular (400) and SemiBold (600), a looped Thai typeface, are bundled locally; their license is in `public/fonts/OFL.txt`.
