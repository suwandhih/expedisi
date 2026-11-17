# Panduan fitur Raja Kirim

> **Peringatan: hanya simulasi.** Semua tarif, angka, vendor, dan pesan di Raja Kirim adalah contoh fiktif, bukan penawaran aktual. Tidak ada booking atau pembayaran. Tidak ada email, WhatsApp, maupun fax yang benar-benar dikirim. Demo ini dipakai tanpa akun. Data yang berhasil disimpan hanya ada di browser dan perangkat yang sama, bukan tempat menyimpan arsip resmi. Jangan masukkan data sensitif.

## Daftar isi

1. [Judul dan pengantar](#1-judul-dan-pengantar)
2. [Cara membuka](#2-cara-membuka)
3. [Alur kerja sehari-hari](#3-alur-kerja-sehari-hari)
4. [Perbandingan harga](#4-perbandingan-harga)
5. [Kalkulator negara](#5-kalkulator-negara)
6. [Membawa hasil ke surat penawaran](#6-membawa-hasil-ke-surat-penawaran)
7. Daftar pelanggan
8. Korespondensi
9. Dokumen
10. Di mana data disimpan dan batasannya
11. Glosarium istilah
12. Tanya jawab / masalah umum

Bagian 1–6 sudah tersedia di dokumen ini. Bagian 7–12 tercantum sebagai rencana lanjutan, belum sebagai petunjuk lengkap.

## 1. Judul dan pengantar

Raja Kirim adalah demo untuk membantu staf sales, CS, dan operasional memahami pilihan pengiriman ekspor atau impor. Anda bisa membandingkan tarif vendor contoh, menghitung total biaya sampai tujuan, lalu menyiapkan quotation untuk pelanggan.

Ada dua cara membandingkan biaya. Keduanya **berbeda**, bukan dua tampilan dari hitungan yang sama.

| Kebutuhan Anda | Menu yang digunakan | Yang dibandingkan |
| --- | --- | --- |
| Membandingkan tiga vendor contoh pada satu rute | **Perbandingan harga** | Ongkos kirim + biaya lokal, sebagai tarif contoh per pengiriman. Tidak memakai berat, volume, jumlah kontainer, atau nilai barang. |
| Membandingkan total biaya barang ke beberapa negara | **Kalkulator negara** | Nilai barang + ongkos kirim + biaya lokal + asuransi + bea + pajak. Ongkos kirim memakai berat/volume atau jumlah kontainer. |

Raja Kirim juga menyediakan data pelanggan, pencatatan korespondensi simulasi, quotation PDF, dan tanda terima PNG. Semua itu tetap alat demonstrasi. Tarif dan waktu transit harus diperiksa melalui penyedia layanan nyata sebelum dipakai untuk pekerjaan sesungguhnya.

## 2. Cara membuka

1. Buka halaman awal `/` pada alamat situs yang diberikan kepada Anda.
2. Pilih **Buka Raja Kirim →**. Anda juga bisa membuka alamat `/raja-kirim/` langsung pada situs yang sama.
3. Gunakan empat menu di bagian atas:

   | Menu | Kegunaan |
   | --- | --- |
   | **Perbandingan harga** | Membandingkan tiga vendor simulasi untuk satu rute dari atau ke Jakarta. |
   | **Kalkulator negara** | Menghitung dan membandingkan total biaya sampai tujuan untuk satu atau beberapa negara. |
   | **Daftar pelanggan** | Mengelola data kontak pelanggan dan melihat riwayat korespondensi simulasinya. |
   | **Surat & dokumen** | Membuka tab **Korespondensi** dan **Dokumen** untuk menyiapkan pesan simulasi, quotation, atau tanda terima. |

Lintas Samudra adalah situs demo terpisah yang juga dapat dibuka dari halaman awal `/`. Panduan ini hanya membahas Raja Kirim.

## 3. Alur kerja sehari-hari

Contoh berikut menggambarkan latihan kerja, bukan proses pemesanan nyata.

1. Terima pertanyaan pelanggan. Catat arah pengiriman, negara, moda, dan kebutuhan barangnya.
2. Buka **Perbandingan harga** bila ingin membandingkan vendor contoh. Gunakan **Kalkulator negara** bila ingin memperkirakan total termasuk nilai barang, asuransi, bea, dan pajak.
3. Pilih hasil yang ingin ditawarkan. Pertimbangkan total biaya dan transit, bukan hanya harga paling rendah.
4. Dari **Perbandingan harga**, pilih **Buat surat penawaran →**. Dari kartu hasil **Kalkulator negara**, pilih **Buat surat penawaran**.
5. Di tab **Dokumen**, pilih pelanggan yang akan menerima quotation. Identitas pelanggan tetap memakai data pelanggan tersebut.
6. Periksa pratinjau, lalu gunakan **Cetak / simpan PDF** untuk menyiapkan quotation. Ini tidak berarti pelanggan sudah menyetujui harga atau membuat booking.
7. Gunakan tab **Korespondensi** untuk latihan mencatat komunikasi. **Catat simulasi** hanya mencatat contoh, bukan mengirim pesan.
8. Bila perlu, siapkan tanda terima melalui tab **Dokumen** dan gunakan **Unduh PNG**. Tanda terima contoh bukan bukti barang sungguhan sudah sampai.

Dalam alur ekspedisi, langkah membandingkan harga dan menyiapkan quotation termasuk tahap pra-pengiriman, yaitu quoting & booking. Raja Kirim hanya membantu simulasi bagian penawarannya; **booking tidak tersedia**. Tracking, pengurusan bea cukai asal/tujuan, pengantaran akhir, dan bukti serah terima resmi atau POD tidak ada di Raja Kirim. Angka bea dan pajak di kalkulator hanyalah simulasi biaya, bukan pengurusan kepabeanan.

## 4. Perbandingan harga

### 4.1 Menampilkan alternatif pengiriman

1. Buka **Perbandingan harga** di `/raja-kirim/`.
2. Pada **JENIS PENGIRIMAN**, pilih **↗ Ekspor** atau **↙ Impor**.
   - Ekspor: **Kota asal** terkunci pada **Jakarta, Indonesia**. Pilih **Negara tujuan**.
   - Impor: pilih **Negara asal**. **Kota tujuan** terkunci pada **Jakarta, Indonesia**.
3. Pilih satu negara: **Singapura**, **Malaysia**, **Tiongkok**, **Vietnam**, **Australia**, atau **Amerika Serikat**.
4. Pada **MODA PENGIRIMAN**, pilih **Laut · LCL**, **Laut · FCL**, atau **Udara**.
5. Pilih **Bandingkan harga →**. Tiga kartu akan tampil di **Alternatif pengiriman**. Saat halaman pertama dibuka, hasil awal juga sudah tersedia.

Satu sisi rute selalu Jakarta. Halaman ini tidak membandingkan rute bebas antara dua negara asing.

### 4.2 Membaca kartu hasil

1. Baca **TOTAL ESTIMASI** dan **ESTIMASI TRANSIT** pada tiap kartu. Kartu diurutkan dari total termurah. Penanda **Harga terendah** menunjukkan pembanding utama.
2. Perhatikan selisih harga dalam USD serta selisih hari terhadap opsi termurah. Lebih murah belum tentu lebih cepat.
3. Baca **Keunggulan contoh (simulasi)**. Poin seperti prioritas muat atau penjemputan hanyalah contoh layanan, bukan janji layanan aktif.
4. Buka **Rincian biaya** untuk melihat **Biaya pengiriman**, **Biaya lokal**, dan **Total estimasi**.

Untuk moda laut, tiga vendor contohnya adalah Nusantara Ocean, Pacific Bridge, dan Atlas Freight. Untuk **Udara**, nama yang tampil adalah Meridian Air Cargo, Pacific Air Connect, dan Atlas Air Freight.

**Total USD = ongkos kirim + biaya lokal.** Perkiraan rupiah = total USD × kurs contoh Rp16.000 per USD.

Tarif di sini adalah **tarif contoh per pengiriman**. Halaman ini tidak meminta berat, volume, jumlah kontainer, atau nilai barang. Totalnya juga tidak menambahkan nilai barang, asuransi, bea, dan pajak seperti **Kalkulator negara**. Karena dasar hitungnya berbeda, angka dan transit kedua menu tidak harus sama.

### 4.3 Memilih kartu dan membuat penawaran

1. Klik atau ketuk kartu yang diinginkan, atau gunakan pilihan **Pilih Nusantara Ocean**, **Pilih Pacific Bridge**, atau **Pilih Atlas Freight** sesuai kartu. Nama pilihan mengikuti nama vendor yang sedang tampil.
2. Jika memakai keyboard, tekan Tab sampai pilihan vendor mendapat fokus. Gunakan tombol panah kanan/bawah untuk maju atau kiri/atas untuk mundur.
3. Periksa ringkasan **Pilihan Anda:** di bawah hasil. Vendor, rute, moda, harga, transit, dan selisihnya mengikuti kartu terpilih. Kartu tersebut ditandai **Terpilih**.
4. Pilih **Buat surat penawaran →** untuk membawa pilihan terakhir ke quotation.

Setiap kali **Bandingkan harga →** ditekan, pilihan kartu kembali ke yang termurah. Pilihan kartu juga tidak diingat setelah halaman dimuat ulang.

Mengubah arah, negara, atau moda saja **belum memperbarui hasil**. Tekan **Bandingkan harga →** terlebih dahulu. Jika langsung membuat surat, yang dibawa tetap pilihan dari hasil perbandingan terakhir, bukan perubahan isian yang belum dibandingkan.

### 4.4 Contoh: ekspor Jakarta → Singapura, LCL

1. Pilih **↗ Ekspor**.
2. Pilih **Singapura** pada **Negara tujuan**.
3. Pilih **Laut · LCL**, lalu **Bandingkan harga →**.
4. Cocokkan hasil dengan tabel berikut. Semua angka adalah simulasi.

| Vendor contoh | Ongkos kirim (USD) | Biaya lokal (USD) | Total (USD) | Perkiraan rupiah | Transit | Selisih dari termurah |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| Nusantara Ocean | 820 | 180 | 1.000 | Rp16.000.000 | 28 hari | Pembanding |
| Pacific Bridge | 1.005 | 155 | 1.160 | Rp18.560.000 | 26 hari | +160 USD; 2 hari lebih cepat |
| Atlas Freight | 1.115 | 210 | 1.325 | Rp21.200.000 | 30 hari | +325 USD; 2 hari lebih lama |

Contoh penjumlahan: Nusantara Ocean = 820 + 180 = **1.000 USD**. Perkiraan rupiah = 1.000 × 16.000 = **Rp16.000.000**. Nusantara Ocean menjadi pilihan awal karena totalnya paling murah, meskipun Pacific Bridge lebih cepat pada contoh ini.

## 5. Kalkulator negara

### 5.1 Mengisi rencana pengiriman

Buka **Kalkulator negara** atau alamat `/raja-kirim/kalkulator.html`. Menu ini membandingkan **total biaya sampai tujuan**, bukan vendor.

1. Pada **JENIS PENGIRIMAN**, pilih **Ekspor** untuk pengiriman dari Indonesia atau **Impor** untuk pengiriman ke Indonesia.
2. Centang satu atau beberapa negara pada **NEGARA TUJUAN** untuk ekspor, atau **NEGARA ASAL** untuk impor. Enam negara yang tersedia sama dengan di **Perbandingan harga**. Saat awal dibuka, semuanya terpilih. Harus ada sedikitnya satu negara.
3. Pada **MODA PENGIRIMAN**, pilih **Udara**, **Laut · LCL**, atau **Laut · FCL**.
4. Isi **NILAI BARANG (USD)** dengan angka lebih dari 0.
5. Untuk **Udara** atau **Laut · LCL**, isi **BERAT (KG)** dan **VOLUME (M³)**. Keduanya wajib berupa angka lebih dari 0.
6. Untuk **Laut · FCL**, isi **JUMLAH KONTAINER** dengan bilangan bulat 1–50. Berat dan volume tidak dipakai pada moda ini.
7. Jika diperlukan, isi **DESKRIPSI BARANG (OPSIONAL)**, maksimal 120 karakter.
8. Pilih **Bandingkan total biaya →**. Hasil juga menyesuaikan ketika isian yang valid diubah.

Jika isian belum benar, perbaiki kolom yang ditandai. Misalnya, tanpa pilihan negara muncul pesan “Pilih sedikitnya satu negara dari daftar.” Untuk jumlah kontainer yang salah, pesannya “Jumlah kontainer harus bilangan bulat 1–50.”

### 5.2 Cara membaca hasil

1. Lihat kartu di **Perbandingan negara**. Urutannya dari total termurah, dengan penanda **Termurah**.
2. Bandingkan **TOTAL BIAYA SIMULASI**, perkiraan rupiah, transit contoh, dan selisih USD dari negara termurah.
3. Buka **Rincian 6 komponen biaya +** untuk melihat nilai barang, ongkos kirim, biaya lokal, asuransi, bea masuk, serta pajak impor. Catatan di bawahnya menunjukkan ukuran yang ditagih, tarif, CIF, dan kurs.
4. Pada negara yang dipilih, gunakan **Buat surat penawaran** bila ingin melanjutkan ke quotation.

Ekspor memakai bea dan pajak contoh negara tujuan. Impor memakai bea dan pajak contoh Indonesia. Pajak impor Indonesia berlaku sama untuk semua negara asal, sedangkan bea contoh dapat berbeda menurut negara asal.

### 5.3 Rumus dengan bahasa sederhana

Hitung ongkos kirim dahulu sesuai moda, kemudian tambahkan komponen lainnya.

1. **Udara:** hitung berat volume = volume m³ × 167. Bandingkan dengan berat sebenarnya. Angka yang lebih besar menjadi kg tertagih. Ongkos kirim = kg tertagih × tarif USD per kg.
2. **LCL:** bandingkan tiga angka: volume m³, berat kg ÷ 1.000, dan minimum 1. Angka terbesar menjadi W/M yang ditagih. Ongkos kirim = W/M × tarif USD per W/M.
3. **FCL:** ongkos kirim = jumlah kontainer × tarif USD per kontainer. Berat dan volume tidak ikut dihitung.
4. **Asuransi:** (nilai barang + ongkos kirim) × persentase asuransi. Persentase bawaan adalah 0,5%.
5. **CIF:** nilai barang + ongkos kirim + asuransi. Ini dasar penghitungan bea pada simulasi ini.
6. **Bea:** CIF × persentase bea.
7. **Pajak:** (CIF + bea) × persentase pajak.
8. **Total biaya sampai tujuan:** CIF + biaya lokal + bea + pajak.
9. **Perkiraan rupiah:** total USD × kurs contoh yang sedang dipakai.

Total tersebut **sudah termasuk nilai barang**. Jangan menambahkannya lagi. Aplikasi menghitung dengan angka lengkap, lalu membulatkan tampilan. Menjumlahkan angka yang sudah dibulatkan dapat menghasilkan selisih kecil.

Rumus ini disederhanakan. Tidak ada pemilihan kategori barang atau penghitungan seluruh pungutan pabean yang sebenarnya. Bea dan pajak contoh bukan ketentuan resmi.

### 5.4 Contoh langkah demi langkah: ekspor ke Singapura lewat udara

Contoh ini memakai angka bawaan. Jika pengaturan pernah diubah, gunakan **Kembalikan angka contoh** dan setujui konfirmasinya bila memang ingin mengganti seluruh pengaturan kalkulator. Atau, periksa angka di **Pengaturan angka contoh** tanpa menghapus pengaturan Anda.

1. Pilih **Ekspor**, centang **Singapura** saja, lalu pilih **Udara**.
2. Isi **NILAI BARANG (USD)** = 5.000 USD, **BERAT (KG)** = 100 kg, dan **VOLUME (M³)** = 0,5 m³. Deskripsi boleh dikosongkan.
3. Periksa angka contoh Singapura untuk arah ekspor dan moda udara: tarif 4,80 USD/kg; biaya lokal 180 USD; bea 0%; pajak 9%; asuransi 0,5%; kurs Rp16.000 per USD. Transit contoh adalah 2 hari.
4. Berat volume = 0,5 × 167 = **83,5 kg**. Bandingkan dengan berat sebenarnya 100 kg. Kg tertagih = **100 kg**.
5. Ongkos kirim = 100 × 4,80 = **480,00 USD**.
6. Asuransi = (5.000 + 480) × 0,5% = **27,40 USD**.
7. CIF = 5.000 + 480 + 27,40 = **5.507,40 USD**.
8. Bea = 5.507,40 × 0% = **0,00 USD**.
9. Pajak = (5.507,40 + 0) × 9% = 495,666 USD, ditampilkan sekitar **495,67 USD**.
10. Total = 5.507,40 + 180 + 0 + 495,666 = 6.183,066 USD, ditampilkan sekitar **6.183,07 USD**.
11. Perkiraan rupiah memakai total sebelum pembulatan: 6.183,066 × 16.000 = **Rp98.929.056**.
12. Pilih **Bandingkan total biaya →**, lalu buka **Rincian 6 komponen biaya +** untuk mencocokkan hasilnya.

Hasil ini berbeda dari contoh LCL pada bagian 4 karena moda dan dasar hitungnya berbeda. Di sini total memasukkan nilai barang dan komponen tambahan, bukan hanya kirim + lokal.

### 5.5 Mengubah dan mengembalikan angka contoh

1. Pilih arah dan moda pada formulir pengiriman terlebih dahulu.
2. Buka **Pengaturan angka contoh**. Tabel mengikuti arah dan moda yang aktif.
3. Ubah tarif kirim, **Lokal (USD)**, **Bea (%)**, **Pajak (%)**, atau **Transit (hari)** sesuai latihan. Tarif dan transit mengikuti moda aktif. Biaya lokal dan bea berlaku untuk semua moda pada arah dan negara yang sama.
4. Ubah **KURS USD → IDR** atau **ASURANSI (%)** bila diperlukan. Untuk impor, gunakan **PAJAK IMPOR INDONESIA (%)**; nilainya berlaku untuk semua negara asal.
5. Perubahan yang valid otomatis disimpan di browser ini. Tombol **Simpan angka contoh** juga tersedia. Periksa pesan penyimpanan sebelum menutup halaman.
6. Untuk kembali ke seluruh angka bawaan, pilih **Kembalikan angka contoh**. Konfirmasi menyatakan bahwa pengaturan **kedua arah dan semua moda** di browser ini akan diganti. Batalkan jika ingin mempertahankan perubahan Anda.

Batas isian pengaturan:

- Kurs harus lebih dari 0.
- Asuransi, bea, dan pajak berada pada 0–100%.
- Tarif kirim dan biaya lokal berada pada 0–1.000.000 USD sesuai satuannya.
- Transit harus bilangan bulat 1–120 hari.

Jika ada angka tidak valid, hasil sementara disembunyikan. Perbaiki kolom yang ditandai sebelum mengganti arah atau moda. Jika penyimpanan browser penuh atau tidak tersedia, angka mungkin hanya berlaku selama halaman terbuka; jangan menganggapnya sudah tersimpan.

Yang disimpan adalah **pengaturan angka contoh**, bukan riwayat perhitungan atau isian rencana pengiriman. Mengubah atau mengembalikan angka kalkulator **tidak mengubah Perbandingan harga**.

## 6. Membawa hasil ke surat penawaran

### 6.1 Memilih sumber penawaran

1. Dari **Perbandingan harga**, pilih kartu yang diinginkan, periksa **Pilihan Anda:**, lalu tekan **Buat surat penawaran →**. Atau, dari **Kalkulator negara**, tekan **Buat surat penawaran** pada hasil negara yang dipilih.
2. Setelah hasil berhasil disimpan, halaman **Surat & dokumen** terbuka pada tab **Dokumen**, dengan jenis **Quotation / penawaran (PDF)**.
3. Periksa penanda sumber: **Data dari Kalkulator negara** atau **Data dari Perbandingan harga**. Penanda juga menampilkan rute dan total agar Anda bisa mengecek pilihan.
4. Pilih satu atau beberapa pelanggan, lalu periksa pratinjau quotation untuk tiap pelanggan sebelum mencetaknya.

Hanya **satu pilihan terbaru** yang disimpan. Memilih hasil baru dari salah satu menu menggantikan pilihan sebelumnya dari menu mana pun. Hasil yang sudah berhasil dibawa ke penawaran tetap tersedia setelah halaman dimuat ulang pada situs, browser, dan perangkat yang sama, selama data browser tidak dihapus.

Ini berbeda dari pilihan kartu pada **Perbandingan harga**, yang kembali ke termurah saat halaman perbandingan dimuat ulang. Membuka ulang perbandingan saja tidak mengganti hasil yang sudah disimpan untuk quotation. Untuk menggantinya, pilih hasil dan tekan tombol penawaran lagi.

### 6.2 Data apa yang ikut dibawa?

Data yang dibawa adalah **salinan hasil pada saat dipilih**. Perubahan angka kalkulator atau isian perbandingan sesudahnya tidak otomatis mengubah quotation. Pilih hasil baru dan tekan tombol penawaran lagi untuk memperbaruinya.

| Asal hasil | Data yang mengisi quotation |
| --- | --- |
| **Kalkulator negara** | Rute dari/ke Indonesia, arah dan moda, deskripsi barang bila diisi, berat dan volume atau jumlah kontainer, total USD dan perkiraan rupiah, serta enam komponen biaya. |
| **Perbandingan harga** | Rute dari/ke Jakarta, arah dan moda, vendor simulasi, transit, total USD dan perkiraan rupiah, serta rincian kirim dan lokal. Berat tertulis **Belum ditentukan (estimasi per pengiriman)** karena halaman ini tidak meminta ukuran kiriman. |

Nama, perusahaan, alamat, kontak, nomor dokumen, dan tanggal tetap memakai data masing-masing pelanggan. Memilih penawaran **tidak mengubah data pelanggan yang tersimpan**. Salinan hasil hanya digunakan untuk quotation; tanda terima tetap memakai data contoh pelanggan.

### 6.3 Kembali memakai data contoh pelanggan

1. Di tab **Dokumen**, pilih **Pakai data contoh pelanggan**.
2. Hasil terpilih untuk quotation dihapus. Rute, layanan, ukuran, dan total kembali memakai nilai contoh milik pelanggan.
3. Data pelanggan yang tersimpan tidak dihapus atau diubah. Tanpa hasil penawaran terpilih, rincian biaya bernilai **—**.

Jika muncul pesan bahwa hasil tidak dapat disimpan atau dihapus karena penyimpanan browser tidak tersedia, ikuti pesan tersebut. Saat penyimpanan penawaran gagal, halaman tidak dipindahkan; perbaiki izin atau ruang penyimpanan browser, lalu coba lagi. Jangan menghapus data browser sembarangan karena data latihan lain di browser ini juga dapat hilang.
