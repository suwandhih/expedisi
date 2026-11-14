# Rencana Kerja Aplikasi Demo Ekspedisi Internasional

## 1. Tujuan

Membuat aplikasi demo yang membantu calon klien memahami layanan ekspedisi internasional, mulai dari perbandingan harga hingga barang diterima dan proses pasca-pengiriman. Aplikasi harus nyaman digunakan di PC dan HP.

Kantor resmi perusahaan berada di **Jakarta, Indonesia**. Nama, logo, dan alamat lengkap dapat menggunakan identitas sementara sampai materi resmi tersedia.

Sumber kebutuhan awal: [expedisi.txt](./expedisi.txt).

## 2. Batasan demo

- Tarif, vendor, pemesanan, posisi, riwayat tracking, ETA, dokumen, POD, dan klaim menggunakan **data simulasi**.
- Beri label yang jelas seperti **“Data Demo”** dan **“Tracking Simulasi”**. Posisi dan rute pada peta bukan posisi aktual atau real-time.
- Tombol dan alur demo memperlihatkan pengalaman penggunaan; tidak membuat pemesanan, pembayaran, pengiriman dokumen, atau klaim sungguhan.
- Belum memerlukan API berbayar atau akun vendor. Integrasi sistem nyata menjadi tahap lanjutan setelah demo dan akses tersedia.
- Demo ditujukan untuk ditunjukkan kepada klien melalui tautan GitHub Pages, bukan dengan mengirim file HTML. Repository publik: [suwandhih/expedisi](https://github.com/suwandhih/expedisi). Repository telah dibuat; demo dan GitHub Pages belum diterbitkan.
- Pendekatan demo: aplikasi frontend statis dengan data contoh, tanpa backend atau Cloudflare. Data dalam browser tidak otomatis tersinkron antarperangkat atau pengguna.
- Status: implementasi demo sedang dikerjakan. Repository masih kosong dan GitHub Pages belum aktif; publikasi dilakukan setelah pengujian.
- GitHub Pages adalah hosting statis, bukan database atau sistem autentikasi; halaman yang diterbitkan harus dianggap publik. Jangan gunakan data sensitif atau kredensial.
- Repository dibuat publik atas persetujuan pemilik. Penyimpanan data demo dan detail penerbitan masih perlu ditentukan.

## 3. Ruang lingkup fitur

### 3.1 Perbandingan tarif dan booking

- Pilihan negara asal, termasuk Malaysia, Singapura, Tiongkok, Vietnam, dan pilihan lain yang relevan; negara tujuan termasuk Amerika Serikat dan Australia.
- Pilihan moda laut FCL/LCL dan udara.
- Daftar vendor dan tarif simulasi, otomatis diurutkan dari harga termurah.
- Rincian **base freight**, **local charges**, total harga, dan estimasi waktu tiba atau transit. Mata uang ditampilkan dengan jelas.
- Tombol **“Pilih & Book”** dan ringkasan pilihan dalam alur pemesanan demo.

### 3.2 Alur operasional pengiriman

Menampilkan tahapan dan data contoh berikut secara berurutan:

1. **Booking dan quotation:** rute, moda, vendor, harga, identitas pengirim/penerima, dan status pemesanan.
2. **Dokumen dan kepabeanan asal:** commercial invoice, packing list, B/L untuk laut atau AWB untuk udara, serta status bea cukai ekspor.
3. **Pickup dan transit:** penjemputan, pemuatan, keberangkatan, checkpoint transit, posisi terakhir, dan ETA.
4. **Kepabeanan tujuan dan last-mile:** kedatangan, status bea cukai impor, informasi bea/pajak jika relevan, dan pengiriman ke penerima.
5. **Selesai:** status diterima, waktu penerimaan, dan bukti serah terima atau POD.

Status dan data tersebut disajikan sebagai simulasi, bukan bukti bahwa proses operasional telah terjadi.

### 3.3 Tracking dan peta

- Menampilkan nomor kontainer atau B/L untuk moda laut dan nomor AWB untuk moda udara, menggunakan contoh data.
- Menampilkan status, carrier, pelabuhan/bandara asal dan tujuan, checkpoint terakhir, waktu pembaruan, koordinat, ETA, serta riwayat perjalanan.
- Menampilkan peta interaktif dengan titik dan jalur simulasi yang dapat dilihat pada PC maupun HP. Garis antar-checkpoint tidak diklaim sebagai rute aktual.
- Contoh peta untuk dipelajari: `C:\data\Peta dunia` atau [Peta Dunia](https://suwandhih.github.io/petadunia/app/index.html). Kelayakan penggunaan dan dependensinya diperiksa saat implementasi.
- Menyediakan struktur data JSON contoh agar nantinya dapat dihubungkan ke sumber data yang sesungguhnya.

### 3.4 Pasca-pengiriman

- Tampilan POD digital simulasi, termasuk informasi penerima, waktu, serta contoh tanda tangan atau bukti penerimaan bila tersedia.
- Tampilan arsip digital untuk dokumen pengiriman dan kepabeanan sebagai gambaran kebutuhan audit.
- Alur demo klaim atau komplain, termasuk jenis masalah seperti kerusakan atau keterlambatan, keterangan, bukti pendukung, dan status penanganan.
- Ringkasan tagihan dan pembayaran simulasi.
- Durasi retensi, persyaratan legal, perlindungan dokumen, dan mekanisme tanda tangan untuk sistem produksi harus dikonfirmasi sesuai yurisdiksi dan kebutuhan bisnis; demo tidak menggantikan arsip audit resmi.

## 4. Desain dan pengalaman pengguna

- Tampilan **clean, modern, tidak terlalu banyak warna**, dan mudah dipahami.
- Navigasi sederhana yang menggambarkan tahapan pengiriman.
- Responsif untuk layar PC dan HP serta mendukung **dark mode**.
- Cari inspirasi visual di [Awwwards](https://www.awwwards.com/) dan sesuaikan dengan kebutuhan aplikasi logistik tanpa menyalin desain secara langsung.
- Bedakan secara visual data simulasi, status pengiriman, dan tindakan pengguna; perhatikan keterbacaan dan aksesibilitas.

## 5. Tahapan kerja dan estimasi awal

Estimasi berikut adalah **perkiraan awal untuk pengembangan aplikasi yang lebih lengkap oleh satu pengembang penuh waktu**, bukan janji durasi pembuatan demo. Durasi demo dapat lebih singkat setelah ruang lingkup dan teknologi disepakati.

| Tahap | Hasil utama | Estimasi kerja |
|---|---|---:|
| 1. Analisis | Konfirmasi kebutuhan, alur, prioritas, dan batasan demo | 1–2 hari |
| 2. Desain | Referensi visual, navigasi, dan desain responsif | 2–4 hari |
| 3. Fondasi aplikasi | Struktur sistem dan fondasi data; akun serta hak akses jika diperlukan | 3–5 hari |
| 4. Tarif dan booking | Perbandingan harga, rincian biaya, dan alur pemesanan | 4–7 hari |
| 5. Operasional dan tracking | Status kiriman, dokumen, riwayat, dan peta | 4–7 hari |
| 6. Pasca-pengiriman | POD, arsip, klaim, dan rekap tagihan | 3–5 hari |
| 7. Pengujian dan persiapan peluncuran | Uji PC/HP, perbaikan, dokumentasi, dan persiapan deployment | 3–5 hari |
| **Total perkiraan** | **Aplikasi lebih lengkap** | **20–35 hari kerja** |

Estimasi akan diperbarui setelah analisis. Jadwal tidak mencakup waktu tunggu persetujuan, penyedia API, akses layanan, atau keputusan bisnis. Pekerjaan fisik seperti penjemputan, bea cukai, dan pengiriman tetap dilakukan oleh tim operasional atau mitra logistik.

## 6. Kebutuhan API dan layanan

| Kebutuhan | Pendekatan demo | Kebutuhan untuk aplikasi nyata |
|---|---|---|
| Tarif dan booking | Harga dan vendor simulasi | API penyedia tarif/carrier, izin akses, dan aturan pemesanan |
| Tracking laut | Contoh kontainer/B/L, posisi, dan checkpoint | API carrier atau penyedia tracking kontainer/B/L; sumber posisi kapal bila diperlukan |
| Tracking udara | Contoh AWB dan checkpoint | API carrier atau penyedia tracking AWB |
| Peta | Peta interaktif dengan titik dan jalur simulasi | Penyedia peta yang sesuai; mungkin memerlukan API key dan biaya |
| Dokumen, POD, dan klaim | Contoh data dan tampilan | Penyimpanan aman, hak akses, kebijakan retensi, dan proses audit |
| Notifikasi | Contoh tampilan dalam aplikasi | Layanan email, SMS, atau WhatsApp sesuai kebutuhan |

Pemakaian peta atau library pihak ketiga pada demo tetap perlu memeriksa ketersediaan jaringan, lisensi, syarat penggunaan, dan kemungkinan API key. Tidak ada vendor atau biaya tertentu yang sudah diputuskan.

## 7. Keterlibatan pemilik dan akses

Untuk demo, pemilik dapat membantu dengan:

- Nama perusahaan, logo, alamat lengkap kantor Jakarta, dan kontak resmi jika ingin ditampilkan. Jika belum tersedia, gunakan identitas sementara.
- Contoh rute, tarif, status, dan dokumen yang aman untuk didemonstrasikan, bila tersedia.
- Masukan tentang alur dan tampilan, serta persetujuan pada tahap tinjauan.
- Keputusan tentang fitur demo yang perlu diprioritaskan dan cara demo akan dibuka atau dipublikasikan.

Untuk integrasi nyata di kemudian hari, pemilik atau klien mungkin perlu menyiapkan akun, persetujuan, kontrak, dan akses API vendor. Kredensial tidak dibagikan melalui chat atau disimpan dalam kode; gunakan mekanisme penyimpanan rahasia yang aman.

## 8. Kriteria penerimaan demo

- Halaman dapat digunakan pada layar PC dan HP, serta memiliki dark mode.
- Pengguna dapat memilih rute dan moda serta melihat opsi tarif contoh dari yang termurah, beserta rincian biaya dan ETA.
- Pengguna dapat memilih opsi dan melihat ringkasan booking demo tanpa membuat transaksi nyata.
- Pengguna dapat melihat tahapan operasional dan contoh tracking laut maupun udara, termasuk checkpoint, ETA, dan peta simulasi.
- Pengguna dapat melihat contoh POD, arsip dokumen, klaim, dan rekap tagihan.
- Data dan tracking simulasi diberi label jelas; tidak ada klaim bahwa posisi, tarif, transaksi, atau dokumen adalah data aktual.
- Pengujian alur utama dan tampilan responsif dilakukan sebelum demo diserahkan.

## 9. Keputusan yang masih perlu dikonfirmasi

- Nama dan identitas perusahaan yang akan ditampilkan.
- Prioritas fitur dan kedalaman interaksi yang diinginkan untuk demo.
- Teknologi frontend dan apakah data demo perlu disimpan setelah aplikasi ditutup. Repository bersifat publik dan publikasi ditargetkan melalui GitHub Pages.
- Rute, vendor, serta contoh dokumen yang akan digunakan dalam demo.
- Untuk pengembangan produksi: penyedia API, keamanan, aturan operasional, retensi dokumen, dan kebutuhan kepatuhan.
