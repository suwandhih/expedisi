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
- Satu situs dengan pilihan halaman di `/`, Lintas Samudra di `/lintas-samudra/`, dan Raja Kirim di `/raja-kirim/`; jangan pisahkan menjadi layanan atau ubah framework. HTML, CSS, skrip, dan data khusus Lintas Samudra berada dalam `lintas-samudra/`.
- Profil Foundry `node-24` hanya untuk tooling. Manifest npm menambahkan `serve@14.2.8` sebagai devDependency server statis; tidak menambahkan backend. Pertahankan `package-lock.json` hasil instalasi dan gunakan `npm ci` setelah lock tersedia.

## Conventions
- Konfigurasi runtime ada di `.cdf/runtime.json`; lifecycle standar npm (`dev`, `check`, `build`) ada di `package.json`. `PORT` disediakan platform; jangan tentukan port tetap.
- Pemeriksaan: `node scripts/static-site.cjs check`. Build statis: `node scripts/static-site.cjs build`. Pemeriksaan menjalankan `scripts/kalkulator-tests.cjs` dan `scripts/penawaran-tests.cjs` (unit Node/VM tanpa browser) untuk rumus, validasi, penyimpanan, payload quotation, penggantian pelanggan/sanitizer/hash tab, dan regresi 36 kombinasi Perbandingan harga.
- `/raja-kirim/kalkulator.html` memakai modul data beku `tarif-contoh.js`; muat sebelum `harga.js`/`kalkulator.js`. Pengaturan kalkulator disimpan di localStorage `raja-kirim-kalkulator-v1`, terpisah dari harga vendor. Semua angka adalah simulasi. API murni `window.RajaKirimKalkulator` menyediakan `defaults`, `validateInput`, `validateSettings`, `calculate`, `compare`, `loadSettings`, dan `saveSettings`; `compare` mengembalikan `{ok, results}` yang berisi rute, moda, ukuran, total/rincian USD, kurs, transit, dan selisih tanpa pembulatan. Jangan menghitung ulang melalui render untuk integrasi surat.
- Modul bersama `raja-kirim/penawaran.js` (`window.RajaKirimPenawaran`) membuat/memvalidasi payload versi 1 dan menangani simpan/muat/hapus di `raja-kirim-penawaran-v1`. Muat `tarif-contoh.js`, lalu `penawaran.js`, sebelum `kalkulator.js` atau `surat.js`. Tombol hasil menuju `surat.html#dokumen`; hanya quotation mengganti rute/layanan/berat/total/rincian lewat sanitizer, bukan pelanggan tersimpan atau tanda terima. Jangan duplikasi validasi payload pada kedua halaman. Setiap string payload maksimal 300 karakter. Tanpa payload, rincian bernilai `—`.
- Pemeriksaan HTTP (tanpa browser): `node scripts/static-site.cjs http <alamat-preview>` setelah build dan Preview aktif.
- Build menyalin hanya 16 berkas publik ke `dist/` (11 berkas lama + 4 berkas kalkulator + modul payload penawaran bersama). Sajikan `dist/`, jangan seluruh repository; `serve.json` menonaktifkan directory listing. `serve.json` membatasi `cleanUrls` ke tiga direktori situs dan memakai `trailingSlash: true` agar URL direktori selalu berakhiran `/`, sementara halaman `.html` tidak dialihkan ke subdirektori yang merusak aset relatif. Tambahkan berkas publik baru ke allowlist `scripts/static-site.cjs`.
- Tidak perlu akun atau API key. Peta dan font memerlukan internet (unpkg, OpenFreeMap, Google Fonts). Seluruh alur bisnis tetap simulasi; data pelanggan tetap di localStorage browser.
- Perubahan sumber statis perlu build ulang dan restart Preview karena tidak ada HMR. Jangan jalankan server melalui shell; gunakan kontrol Preview Foundry.

## Maintenance checklist for the agent
- The runtime auto-injects a fresh `<workspace_map>` every turn — do NOT hand-maintain a file tree here.
- When adding a new framework or runtime dependency, append it to **Stack**.
- Keep instructions concise — link to deeper docs rather than duplicating them.
