# Lintas Samudra — demo ekspedisi

Frontend statis berbahasa Indonesia untuk demonstrasi. Identitas, tarif, vendor, booking, status, posisi, dokumen, POD, klaim, dan tagihan adalah **simulasi**, bukan layanan atau tracking real-time. Tidak ada backend, transaksi, pembayaran, upload, atau pengiriman klaim. Pilihan tema dapat disimpan di browser; data klaim hanya tampil sementara dan tidak disimpan.

## Demo Raja Kirim

Demo baru tersedia di [`raja-kirim/index.html`](raja-kirim/index.html); demo Lintas Samudra yang lama tetap tersedia di `index.html`. Raja Kirim memfokuskan perbandingan alternatif harga ekspor/impor serta simulasi surat dan dokumen pelanggan. Pengelolaan pelanggan menyimpan kontak dan riwayat korespondensi simulasi di penyimpanan browser lokal, yang dapat dihapus melalui pengaturan browser. Template dapat diedit dan dipratinjau per pelanggan; perubahan template hanya berlaku selama halaman terbuka. Email dan WhatsApp hanya berupa contoh tampilan: tidak ada koneksi atau pesan yang dikirim. Seluruh data dan tarif adalah fiktif, bukan penawaran aktual. Jangan masukkan data sensitif.

## Menjalankan

Sajikan direktori ini dengan server HTTP statis dan buka alamat server tersebut. Misalnya `npx serve .` jika tersedia. Jangan membuka `index.html` langsung melalui `file://`, karena pemuatan `data.json` memerlukan HTTP. Semua path aplikasi bersifat relatif sehingga dapat dilayani dari subpath GitHub Pages tanpa konfigurasi build. Tidak perlu akun atau API key.

### Preview di Software Foundry

Profil `node-24` digunakan hanya untuk alat pemeriksaan dan server HTTP statis `serve@14.2.8`; aplikasi tetap HTML/CSS/JavaScript asli, tanpa backend atau proses kompilasi frontend. Manifest npm hanya menambahkan alat server statis. Instalasi pertama menghasilkan `package-lock.json`; instalasi selanjutnya memakai `npm ci` agar versi dependensi tetap sama.

- Periksa sintaks JavaScript, tautan/aset lokal, dan konsistensi data contoh: `node scripts/static-site.cjs check`.
- Siapkan berkas publik: `node scripts/static-site.cjs build`.
- Skrip `dev` di `package.json` menjalankan server pada folder `dist/` menggunakan `PORT` yang diberikan platform; `.cdf/runtime.json` memilih profil tooling. Hanya berkas situs yang disajikan; dokumen internal dan konfigurasi proyek tidak ikut disalin.
- Buka Preview untuk Lintas Samudra (`/`), atau tambahkan `/raja-kirim/` untuk demo Raja Kirim dan `/raja-kirim/surat.html` untuk surat dan pelanggan.
- Setelah mengubah sumber statis, build ulang lalu restart Preview. Situs ini tidak menggunakan HMR.
- Untuk memeriksa respons halaman/aset dan penolakan akses berkas internal tanpa browser: `node scripts/static-site.cjs http <alamat-preview>`.

Data contoh pengiriman dan checkpoint tersedia di `data.json`; tarif contoh dihitung di `app.js`. Jangan masukkan data sensitif: GitHub Pages bersifat publik. Integrasi nyata, akses dokumen, retensi, kepatuhan, dan tanda tangan membutuhkan desain terpisah.

## Peta dan jaringan

Mengikuti pendekatan contoh Peta Dunia, peta memakai [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/) (lisensi BSD-3-Clause) dan gaya [OpenFreeMap](https://openfreemap.org/) dengan data [OpenStreetMap](https://www.openstreetmap.org/copyright) (ODbL); atribusi tersedia pada peta. Library dimuat dari unpkg, dan gaya, font peta, serta tile dimuat dari layanan penyedia. Ketersediaan dan ketentuan penyedia perlu ditinjau sebelum produksi. Font antarmuka dari Google Fonts; font sistem digunakan sebagai fallback. Peta memerlukan internet dan tidak tersedia bila sumber eksternal diblokir atau gagal; rincian dan riwayat tetap dapat digunakan. Garis menghubungkan checkpoint contoh, bukan rute aktual.
