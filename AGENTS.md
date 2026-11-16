# AGENTS.md — Expedisi

This file is the primary instruction document the AI agent reads on every turn. Keep it up to date as the project evolves: when files move, dependencies change, or new conventions are introduced, update the relevant section below.

## Reuse and modularity rules
- Before adding UI or feature code, search for existing pages, components, layouts, modules, hooks, services, utilities, and types.
- Pages should compose layouts, modules, and shared components; they should not own major reusable functionality.
- When a feature is used twice, extract it to a shared component, layout, hook, service, or module before adding the second usage.
- Treat requests to copy, mirror, or replicate as refactor requests: extract the source implementation, update the original call site, then add the new call site.
- Put customer-deployable product capabilities in `src/modules/<feature>/` with a public `index.ts`; add `manifest.ts` when routes, permissions, navigation, dependencies, or feature flags matter.
- For intranet/digital-workplace apps, headers/navigation belong in layouts or shared components; people search, information concierge, global search, document libraries, policies, news, events, approvals, and dashboard widgets belong in modules.

## Stack
- Situs statis HTML, CSS, dan JavaScript browser; tidak ada backend, bundler, package.json, atau lock dependensi aplikasi pada impor asli.
- Satu situs dengan demo Lintas Samudra di `/` dan Raja Kirim di `/raja-kirim/`; jangan pisahkan menjadi layanan atau ubah framework.
- Profil Foundry `node-24` hanya untuk tooling. Manifest npm menambahkan `serve@14.2.8` sebagai devDependency server statis; tidak menambahkan backend. Pertahankan `package-lock.json` hasil instalasi dan gunakan `npm ci` setelah lock tersedia.

## Conventions
- Konfigurasi runtime ada di `.cdf/runtime.json`; lifecycle standar npm (`dev`, `check`, `build`) ada di `package.json`. `PORT` disediakan platform; jangan tentukan port tetap.
- Pemeriksaan: `node scripts/static-site.cjs check`. Build statis: `node scripts/static-site.cjs build`.
- Pemeriksaan HTTP (tanpa browser): `node scripts/static-site.cjs http <alamat-preview>` setelah build dan Preview aktif.
- Build menyalin hanya 10 berkas publik ke `dist/`. Sajikan `dist/`, jangan seluruh repository; `serve.json` menonaktifkan directory listing. Gunakan resolusi indeks bawaan server agar `/` dan `/raja-kirim/` berfungsi; tautan `.html` tetap didukung melalui pengalihan URL bawaan.
- Tidak perlu akun atau API key. Peta dan font memerlukan internet (unpkg, OpenFreeMap, Google Fonts). Seluruh alur bisnis tetap simulasi; data pelanggan tetap di localStorage browser.
- Perubahan sumber statis perlu build ulang dan restart Preview karena tidak ada HMR. Jangan jalankan server melalui shell; gunakan kontrol Preview Foundry.

## Maintenance checklist for the agent
- The runtime auto-injects a fresh `<workspace_map>` every turn — do NOT hand-maintain a file tree here.
- When adding a new framework or runtime dependency, append it to **Stack**.
- Keep instructions concise — link to deeper docs rather than duplicating them.
