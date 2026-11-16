'use strict';
(() => {
  const storageKey = 'raja-kirim-penawaran-v1';
  const fields = ['arah', 'negara', 'rute', 'layanan', 'berat', 'total', 'rincian', 'dibuat'];
  const costLabels = { barang: 'Barang', kirim: 'Kirim', lokal: 'Lokal', asuransi: 'Asuransi', bea: 'Bea', pajak: 'Pajak' };
  const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  const route = (direction, country) => direction === 'ekspor' ? `Indonesia → ${country}` : `${country} → Indonesia`;
  const money = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  const rupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  const number = (value) => new Intl.NumberFormat('id-ID', { maximumFractionDigits: 3 }).format(value);
  const format = Object.freeze({ money, rupiah, number });

  function validatePayload(value) {
    if (!record(value) || value.versi !== 1 || Object.keys(value).length !== fields.length + 1 ||
        !fields.every((field) => Object.hasOwn(value, field) && typeof value[field] === 'string' && value[field].trim().length > 0 && value[field].length <= 300) ||
        !['ekspor', 'impor'].includes(value.arah) || !window.RajaKirimData.countries.includes(value.negara) ||
        value.rute !== route(value.arah, value.negara)) return false;
    const timestamp = Date.parse(value.dibuat);
    return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value.dibuat;
  }

  // Memakai hasil presisi penuh yang sudah dihitung, bukan menghitung ulang biaya.
  function createPayload(result, made = new Date().toISOString()) {
    if (!record(result) || !['ekspor', 'impor'].includes(result.direction) || !window.RajaKirimData.countries.includes(result.country) ||
        !['Udara', 'LCL', 'FCL'].includes(result.mode) || typeof result.description !== 'string' || result.description.length > 120 ||
        !record(result.components) || !Object.keys(costLabels).every((key) => Number.isFinite(result.components[key]) && result.components[key] >= 0) ||
        !Number.isFinite(result.total) || result.total <= 0 || !Number.isFinite(result.totalIdr) || result.totalIdr < 0) return null;
    const fcl = result.mode === 'FCL';
    if (fcl ? !Number.isInteger(result.containers) || result.containers < 1 || result.containers > 50
      : !Number.isFinite(result.weight) || result.weight <= 0 || !Number.isFinite(result.volume) || result.volume <= 0) return null;
    const direction = result.direction === 'ekspor' ? 'Ekspor' : 'Impor';
    const mode = result.mode === 'Udara' ? 'Udara' : `Laut · ${result.mode}`;
    const description = result.description.trim();
    const payload = {
      versi: 1, arah: result.direction, negara: result.country, rute: route(result.direction, result.country),
      layanan: `${direction} · ${mode}${description ? ` · ${description}` : ''}`,
      berat: fcl ? `${number(result.containers)} kontainer` : `${number(result.weight)} kg · ${number(result.volume)} m³`,
      total: `${money(result.total)} (≈ ${rupiah(result.totalIdr)})`,
      rincian: Object.entries(costLabels).map(([key, label]) => `${label} ${money(result.components[key])}`).join(' · '),
      dibuat: made
    };
    return validatePayload(payload) ? Object.freeze(payload) : null;
  }

  function savePayload(payload, getStorage = () => window.localStorage) {
    if (!validatePayload(payload)) return { saved: false, message: 'Hasil penawaran tidak valid atau terlalu panjang. Kurangi angka atau deskripsi barang, lalu coba lagi.' };
    try {
      getStorage().setItem(storageKey, JSON.stringify(payload));
      return { saved: true, message: '' };
    } catch (error) {
      return { saved: false, message: 'Penawaran belum dapat disimpan karena penyimpanan browser tidak tersedia atau penuh. Izinkan penyimpanan atau kosongkan ruang, lalu coba lagi; halaman tidak dipindahkan.' };
    }
  }

  function clearPayload(getStorage = () => window.localStorage) {
    try {
      getStorage().removeItem(storageKey);
      return { cleared: true, message: 'Data contoh pelanggan digunakan kembali. Data pelanggan tersimpan tidak diubah.' };
    } catch (error) {
      return { cleared: false, message: 'Data penawaran belum dapat dihapus. Izinkan penyimpanan browser, lalu coba lagi.' };
    }
  }

  function loadPayload(getStorage = () => window.localStorage) {
    let storage;
    let saved;
    try {
      storage = getStorage();
      saved = storage.getItem(storageKey);
    } catch (error) {
      return { payload: null, state: 'error', message: 'Data penawaran tidak dapat dibaca karena penyimpanan browser tidak tersedia. Memakai data contoh pelanggan.' };
    }
    if (saved === null) return { payload: null, state: 'empty', message: '' };
    try {
      const payload = JSON.parse(saved);
      if (validatePayload(payload)) return { payload: Object.freeze(payload), state: 'saved', message: '' };
    } catch (error) {
      // JSON rusak diperlakukan sama seperti payload dengan bentuk yang salah.
    }
    const removed = clearPayload(() => storage);
    return { payload: null, state: 'error', message: removed.cleared
      ? 'Data penawaran dari Kalkulator negara rusak atau tidak valid dan telah dihapus. Memakai data contoh pelanggan.'
      : 'Data penawaran dari Kalkulator negara rusak atau tidak valid dan diabaikan, tetapi belum dapat dihapus. Memakai data contoh pelanggan.' };
  }

  function replacements(customer, payload, type) {
    const values = { ...customer, rincian: '—' };
    if (type === 'quotation' && validatePayload(payload)) {
      for (const field of ['rute', 'layanan', 'berat', 'total', 'rincian']) values[field] = payload[field];
    }
    return values;
  }

  function handoff(result, getStorage = () => window.localStorage, navigate = (url) => window.location.assign(url)) {
    const saved = savePayload(createPayload(result), getStorage);
    if (saved.saved) navigate('surat.html#dokumen');
    return saved;
  }

  window.RajaKirimPenawaran = Object.freeze({ storageKey, format, validatePayload, createPayload, savePayload, loadPayload, clearPayload, replacements, handoff });
})();
