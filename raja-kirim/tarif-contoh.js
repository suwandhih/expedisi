'use strict';
(() => {
  // Seluruh nilai adalah angka simulasi, bukan tarif atau ketentuan pabean resmi.
  const data = {
    countries: ['Singapura', 'Malaysia', 'Tiongkok', 'Vietnam', 'Australia', 'Amerika Serikat'],
    adjustments: { Singapura: 0, Malaysia: 35, Tiongkok: 120, Vietnam: 85, Australia: 150, 'Amerika Serikat': 380 },
    vendors: [
      { name: 'Nusantara Ocean', air: 'Meridian Air Cargo', mark: 'NO', adjustment: 0, local: 180, days: 0, label: 'Harga terendah', keunggulan: ['Jadwal keberangkatan reguler', 'Cocok untuk pengiriman rutin hemat biaya'] },
      { name: 'Pacific Bridge', air: 'Pacific Air Connect', mark: 'PB', adjustment: 185, local: 155, days: -2, label: 'Transit lebih cepat', keunggulan: ['Prioritas muat di pelabuhan/bandara', 'Pembaruan status pengiriman harian', 'Bantuan pengurusan dokumen pabean'] },
      { name: 'Atlas Freight', air: 'Atlas Air Freight', mark: 'AF', adjustment: 295, local: 210, days: 2, label: 'Opsi fleksibel', keunggulan: ['Jadwal muat dapat diubah sebelum keberangkatan', 'Penanganan barang khusus atau mudah pecah', 'Penjemputan barang di gudang pelanggan'] }
    ],
    asuransi: 0.5,
    kurs: 16000,
    rute: {
      ekspor: {
        Singapura: { tarif: { Udara: 4.8, LCL: 85, FCL: 1050 }, lokal: 180, bea: 0, pajak: 9, transit: { Udara: 2, LCL: 6, FCL: 5 } },
        Malaysia: { tarif: { Udara: 4.5, LCL: 90, FCL: 1150 }, lokal: 160, bea: 5, pajak: 10, transit: { Udara: 3, LCL: 7, FCL: 6 } },
        Tiongkok: { tarif: { Udara: 5.8, LCL: 115, FCL: 1650 }, lokal: 240, bea: 8, pajak: 13, transit: { Udara: 4, LCL: 14, FCL: 12 } },
        Vietnam: { tarif: { Udara: 5.2, LCL: 105, FCL: 1450 }, lokal: 190, bea: 5, pajak: 10, transit: { Udara: 3, LCL: 10, FCL: 8 } },
        Australia: { tarif: { Udara: 7.2, LCL: 145, FCL: 2300 }, lokal: 320, bea: 5, pajak: 10, transit: { Udara: 5, LCL: 20, FCL: 17 } },
        'Amerika Serikat': { tarif: { Udara: 9.5, LCL: 210, FCL: 3800 }, lokal: 450, bea: 7.5, pajak: 6, transit: { Udara: 7, LCL: 35, FCL: 30 } }
      },
      impor: {
        Singapura: { tarif: { Udara: 4.6, LCL: 80, FCL: 1000 }, lokal: 210, bea: 0, pajak: 11, transit: { Udara: 2, LCL: 6, FCL: 5 } },
        Malaysia: { tarif: { Udara: 4.3, LCL: 85, FCL: 1100 }, lokal: 200, bea: 0, pajak: 11, transit: { Udara: 3, LCL: 7, FCL: 6 } },
        Tiongkok: { tarif: { Udara: 5.4, LCL: 95, FCL: 1500 }, lokal: 250, bea: 5, pajak: 11, transit: { Udara: 4, LCL: 14, FCL: 12 } },
        Vietnam: { tarif: { Udara: 5, LCL: 100, FCL: 1350 }, lokal: 220, bea: 0, pajak: 11, transit: { Udara: 3, LCL: 10, FCL: 8 } },
        Australia: { tarif: { Udara: 6.8, LCL: 135, FCL: 2150 }, lokal: 280, bea: 5, pajak: 11, transit: { Udara: 5, LCL: 20, FCL: 17 } },
        'Amerika Serikat': { tarif: { Udara: 9, LCL: 195, FCL: 3600 }, lokal: 350, bea: 7.5, pajak: 11, transit: { Udara: 7, LCL: 35, FCL: 30 } }
      }
    }
  };
  function freeze(value) {
    if (value && typeof value === 'object') {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
    return value;
  }
  window.RajaKirimData = freeze(data);
})();
