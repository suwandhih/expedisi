# Expedisi — Raja Kirim & Lintas Samudra

Frontend statis berbahasa Indonesia untuk demonstrasi. Identitas, tarif, vendor, booking, status, posisi, dokumen, POD, klaim, dan tagihan adalah **simulasi**, bukan layanan atau tracking real-time. Tidak ada backend, transaksi, pembayaran, upload, atau pengiriman klaim. Pilihan tema dapat disimpan di browser; data klaim hanya tampil sementara dan tidak disimpan.

## Demo Raja Kirim

Halaman utama (`/`) menyediakan dua pilihan: [Raja Kirim](raja-kirim/index.html) di `/raja-kirim/` dan [Lintas Samudra](lintas-samudra/index.html) di `/lintas-samudra/`. Keduanya memiliki halaman tersendiri, dengan navigasi untuk berpindah atau kembali ke pilihan halaman. Fitur asli dipertahankan tanpa menduplikasi implementasi. Raja Kirim memfokuskan perbandingan alternatif harga ekspor/impor serta simulasi surat dan dokumen pelanggan. Pengelolaan pelanggan menyimpan kontak dan riwayat korespondensi simulasi di penyimpanan browser lokal, yang dapat dihapus melalui pengaturan browser. Template dapat diedit dan dipratinjau per pelanggan; perubahan template hanya berlaku selama halaman terbuka. Email dan WhatsApp hanya berupa contoh tampilan: tidak ada koneksi atau pesan yang dikirim. Seluruh data dan tarif adalah fiktif, bukan penawaran aktual. Jangan masukkan data sensitif.

### Kalkulator negara

[Kalkulator negara](raja-kirim/kalkulator.html) di `/raja-kirim/kalkulator.html` membandingkan **total biaya sampai tujuan** untuk ekspor dari atau impor ke Indonesia: barang, ongkos kirim, biaya lokal, asuransi, bea masuk, dan pajak impor. Pilih satu atau lebih dari enam negara (Singapura, Malaysia, Tiongkok, Vietnam, Australia, Amerika Serikat) serta moda Udara/LCL/FCL. Hasil diurutkan dari total termurah, dengan transit, selisih, rincian USD, dan perkiraan Rupiah.

- Semua angka berlabel **DATA SIMULASI**, bukan tarif resmi, ketentuan pabean aktual, atau penawaran. Tidak ada kategori barang; sesuaikan bea contoh sendiri. Perbandingan harga vendor lama tetap tersedia dan tidak dipengaruhi pengaturan kalkulator.
- Ongkos kirim Udara = `max(kg, m³ × 167) × tarif`; LCL = `max(m³, kg/1000, 1) × tarif`; FCL = `kontainer × tarif` (bilangan bulat 1–50). Berat dan volume harus positif untuk Udara/LCL; keduanya tidak digunakan pada FCL.
- Asuransi = `(barang + kirim) × asuransi%`; CIF = barang + kirim + asuransi; bea = CIF × bea%; pajak = (CIF + bea) × pajak%; total = CIF + lokal + bea + pajak. Perhitungan berpresisi penuh; tampilan dibulatkan. Ekspor memakai bea/pajak negara tujuan. Pajak impor Indonesia sama untuk semua asal, tetapi bea contoh boleh berbeda.
- Buka **Pengaturan angka contoh** untuk mengubah tarif dan transit moda aktif, biaya lokal, bea/pajak, kurs USD→IDR, serta asuransi. Perubahan valid disimpan otomatis ke localStorage `raja-kirim-kalkulator-v1`; tidak ada riwayat perhitungan atau data formulir yang disimpan. Pengaturan hanya berlaku pada browser/origin yang sama dan dapat hilang jika penyimpanan browser dihapus.
- Bentuk dan rentang data diperiksa saat dimuat. Data rusak atau penyimpanan yang tidak tersedia memakai angka contoh disertai pesan. Jika penyimpanan penuh/diblokir, perubahan valid tetap bisa dipakai sementara tetapi tidak dianggap tersimpan. **Kembalikan angka contoh** meminta konfirmasi sebelum mengganti seluruh pengaturan kedua arah dan semua moda.
- Modul `raja-kirim/tarif-contoh.js` menyediakan `window.RajaKirimData` yang dibekukan hingga nested. Fungsi murni pada `window.RajaKirimKalkulator` memisahkan validasi/perhitungan dari render. Pengujian non-browser (`scripts/kalkulator-tests.cjs`) dijalankan oleh `check` dan `build`, termasuk rumus, urutan, penyimpanan, dan regresi 36 kombinasi harga vendor lama.

## Menjalankan

Sajikan direktori ini dengan server HTTP statis dan buka alamat server tersebut. Misalnya `npx serve .` jika tersedia. Jangan membuka `index.html` langsung melalui `file://`, karena pemuatan `data.json` memerlukan HTTP. Semua path aplikasi bersifat relatif sehingga dapat dilayani dari subpath GitHub Pages tanpa konfigurasi build. Tidak perlu akun atau API key.

### Preview di Software Foundry

Profil `node-24` digunakan hanya untuk alat pemeriksaan dan server HTTP statis `serve@14.2.8`; aplikasi tetap HTML/CSS/JavaScript asli, tanpa backend atau proses kompilasi frontend. Manifest npm hanya menambahkan alat server statis. Instalasi pertama menghasilkan `package-lock.json`; instalasi selanjutnya memakai `npm ci` agar versi dependensi tetap sama.

- Periksa sintaks JavaScript, tautan/aset lokal, dan konsistensi data contoh: `node scripts/static-site.cjs check`.
- Siapkan berkas publik: `node scripts/static-site.cjs build`.
- Skrip `dev` di `package.json` menjalankan server pada folder `dist/` menggunakan `PORT` yang diberikan platform; `.cdf/runtime.json` memilih profil tooling. Hanya berkas situs yang disajikan; dokumen internal dan konfigurasi proyek tidak ikut disalin.
- Buka Preview (`/`) lalu pilih Raja Kirim atau Lintas Samudra. Alamat langsung: `/raja-kirim/` dan `/lintas-samudra/`. Surat dan pelanggan tetap tersedia di `/raja-kirim/surat.html`.
- Setelah mengubah sumber statis, build ulang lalu restart Preview. Situs ini tidak menggunakan HMR.
- URL direktori memakai garis miring penutup (`/raja-kirim/`, `/lintas-samudra/`); URL halaman `.html` dipertahankan agar aset relatif tetap benar. Konfigurasi `serve.json` hanya mengaktifkan resolusi indeks bersih untuk direktori situs, bukan semua halaman.
- Untuk memeriksa respons halaman/aset relatif, URL direktori, dan penolakan akses berkas internal tanpa browser: `node scripts/static-site.cjs http <alamat-preview>`.

Data contoh pengiriman dan checkpoint tersedia di `lintas-samudra/data.json`; tarif contoh dihitung di `lintas-samudra/app.js`. Jangan masukkan data sensitif: GitHub Pages bersifat publik. Integrasi nyata, akses dokumen, retensi, kepatuhan, dan tanda tangan membutuhkan desain terpisah.

## Peta dan jaringan

Mengikuti pendekatan contoh Peta Dunia, peta memakai [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/) (lisensi BSD-3-Clause) dan gaya [OpenFreeMap](https://openfreemap.org/) dengan data [OpenStreetMap](https://www.openstreetmap.org/copyright) (ODbL); atribusi tersedia pada peta. Library dimuat dari unpkg, dan gaya, font peta, serta tile dimuat dari layanan penyedia. Ketersediaan dan ketentuan penyedia perlu ditinjau sebelum produksi. Font antarmuka dari Google Fonts; font sistem digunakan sebagai fallback. Peta memerlukan internet dan tidak tersedia bila sumber eksternal diblokir atau gagal; rincian dan riwayat tetap dapat digunakan. Garis menghubungkan checkpoint contoh, bukan rute aktual.
