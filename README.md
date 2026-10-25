# Catalogmsh

เว็บแอปสร้างแคตตาล็อกเครื่องมือแพทย์ โทนเขียว พร้อมเพิ่มรูปสินค้า แก้ไขข้อความ เลือกแม่แบบ และพิมพ์ PDF ขนาด A4

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

## Standalone download

Open `download/medical-catalog.html` in a browser. Regenerate the standalone HTML and ZIP after changes with:

```sh
python3 scripts/package-download.py
```

## Catalog storage and PDF export

Catalogs and images are saved in browser localStorage on the current device and origin. Opening the app on a new domain or device does not transfer existing catalogs. There is no shared database or user account system.

Use the PDF A4 button, select Save as PDF, choose A4 paper at 100% scale, and disable browser headers and footers.

Noto Sans Thai is bundled locally; its license is in `public/fonts/OFL.txt`.
