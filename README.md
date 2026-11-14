# Lintas Samudra — demo ekspedisi

Frontend statis berbahasa Indonesia untuk demonstrasi. Identitas, tarif, vendor, booking, status, posisi, dokumen, POD, klaim, dan tagihan adalah **simulasi**, bukan layanan atau tracking real-time. Tidak ada backend, transaksi, pembayaran, upload, atau pengiriman klaim. Pilihan tema dapat disimpan di browser; data klaim hanya tampil sementara dan tidak disimpan.

## Menjalankan

Sajikan direktori ini dengan server HTTP statis dan buka alamat server tersebut. Misalnya `npx serve .` jika tersedia. Jangan membuka `index.html` langsung melalui `file://`, karena pemuatan `data.json` memerlukan HTTP. Semua path aplikasi bersifat relatif sehingga dapat dilayani dari subpath GitHub Pages tanpa konfigurasi build. Tidak perlu akun atau API key.

Data contoh pengiriman dan checkpoint tersedia di `data.json`; tarif contoh dihitung di `app.js`. Jangan masukkan data sensitif: GitHub Pages bersifat publik. Integrasi nyata, akses dokumen, retensi, kepatuhan, dan tanda tangan membutuhkan desain terpisah.

## Peta dan jaringan

Mengikuti pendekatan contoh Peta Dunia, peta memakai [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/) (lisensi BSD-3-Clause) dan gaya [OpenFreeMap](https://openfreemap.org/) dengan data [OpenStreetMap](https://www.openstreetmap.org/copyright) (ODbL); atribusi tersedia pada peta. Library dimuat dari unpkg, dan gaya, font peta, serta tile dimuat dari layanan penyedia. Ketersediaan dan ketentuan penyedia perlu ditinjau sebelum produksi. Font antarmuka dari Google Fonts; font sistem digunakan sebagai fallback. Peta memerlukan internet dan tidak tersedia bila sumber eksternal diblokir atau gagal; rincian dan riwayat tetap dapat digunakan. Garis menghubungkan checkpoint contoh, bukan rute aktual.
