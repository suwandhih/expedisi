'use strict';
(() => {
  const data = window.RajaKirimData;
  const modes = ['Udara', 'LCL', 'FCL'];
  const directions = ['ekspor', 'impor'];
  const storageKey = 'raja-kirim-kalkulator-v1';
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const defaults = () => ({ version: 1, asuransi: data.asuransi, kurs: data.kurs, rute: clone(data.rute) });
  const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  const keysMatch = (value, keys) => record(value) && Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
  const numberIn = (value, min, max) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;

  function validateSettings(value) {
    if (!keysMatch(value, ['version', 'asuransi', 'kurs', 'rute']) || value.version !== 1 ||
        !numberIn(value.asuransi, 0, 100) || !numberIn(value.kurs, Number.MIN_VALUE, Number.MAX_VALUE) ||
        !keysMatch(value.rute, directions)) return false;
    for (const direction of directions) {
      if (!keysMatch(value.rute[direction], data.countries)) return false;
      for (const country of data.countries) {
        const row = value.rute[direction][country];
        if (!keysMatch(row, ['tarif', 'lokal', 'bea', 'pajak', 'transit']) ||
            !keysMatch(row.tarif, modes) || !keysMatch(row.transit, modes) ||
            !numberIn(row.lokal, 0, 1000000) || !numberIn(row.bea, 0, 100) || !numberIn(row.pajak, 0, 100) ||
            !modes.every((mode) => numberIn(row.tarif[mode], 0, 1000000) && numberIn(row.transit[mode], 1, 120) && Number.isInteger(row.transit[mode]))) return false;
      }
    }
    return new Set(data.countries.map((country) => value.rute.impor[country].pajak)).size === 1;
  }

  function validateInput(input) {
    if (!record(input)) return { form: 'Data pengiriman tidak valid. Isi kembali formulir.' };
    const errors = {};
    if (!directions.includes(input.direction)) errors.direction = 'Pilih ekspor atau impor.';
    if (!Array.isArray(input.countries) || !input.countries.length || input.countries.length > data.countries.length ||
        !input.countries.every((country) => data.countries.includes(country)) || new Set(input.countries).size !== input.countries.length) errors.countries = 'Pilih sedikitnya satu negara dari daftar.';
    if (!modes.includes(input.mode)) errors.mode = 'Pilih moda yang tersedia.';
    if (!numberIn(input.goods, Number.MIN_VALUE, Number.MAX_VALUE)) errors.goods = 'Nilai barang harus berupa angka lebih dari 0 USD.';
    if (input.mode === 'FCL') {
      if (!numberIn(input.containers, 1, 50) || !Number.isInteger(input.containers)) errors.containers = 'Jumlah kontainer harus bilangan bulat 1–50.';
    } else {
      if (!numberIn(input.weight, Number.MIN_VALUE, Number.MAX_VALUE)) errors.weight = 'Berat harus berupa angka lebih dari 0 kg.';
      if (!numberIn(input.volume, Number.MIN_VALUE, Number.MAX_VALUE)) errors.volume = 'Volume harus berupa angka lebih dari 0 m³.';
    }
    if (typeof input.description !== 'string' || input.description.length > 120) errors.description = 'Deskripsi barang maksimal 120 karakter.';
    return errors;
  }

  // Fungsi murni: tidak membaca DOM atau penyimpanan. Nilai tidak dibulatkan di sini.
  function calculate(input, country, settings) {
    const errors = validateInput(input);
    if (Object.keys(errors).length || !data.countries.includes(country) || !input.countries.includes(country)) return { ok: false, error: 'Data pengiriman belum valid.', errors };
    if (!validateSettings(settings)) return { ok: false, error: 'Angka contoh belum valid. Perbaiki pengaturan atau kembalikan angka contoh.' };
    const row = settings.rute[input.direction][country];
    const quantity = input.mode === 'FCL' ? input.containers : input.mode === 'Udara' ? Math.max(input.weight, input.volume * 167) : Math.max(input.volume, input.weight / 1000, 1);
    const kirim = quantity * row.tarif[input.mode];
    const asuransi = (input.goods + kirim) * settings.asuransi / 100;
    const cif = input.goods + kirim + asuransi;
    const bea = cif * row.bea / 100;
    const pajak = (cif + bea) * row.pajak / 100;
    const components = { barang: input.goods, kirim, lokal: row.lokal, asuransi, bea, pajak };
    const total = Object.values(components).reduce((sum, value) => sum + value, 0);
    const totalIdr = total * settings.kurs;
    if (![quantity, cif, total, totalIdr, ...Object.values(components)].every(Number.isFinite)) return { ok: false, error: 'Angka terlalu besar untuk dihitung. Kurangi nilai barang, ukuran kiriman, atau kurs.' };
    return { ok: true, value: {
      country, direction: input.direction, route: input.direction === 'ekspor' ? `Indonesia → ${country}` : `${country} → Indonesia`,
      mode: input.mode, description: input.description.trim(), weight: input.mode === 'FCL' ? null : input.weight,
      volume: input.mode === 'FCL' ? null : input.volume, containers: input.mode === 'FCL' ? input.containers : null,
      quantity, rate: row.tarif[input.mode], transit: row.transit[input.mode], components, cif, total, totalIdr,
      kurs: settings.kurs, asuransi: settings.asuransi, bea: row.bea, pajak: row.pajak
    } };
  }

  function compare(input, settings) {
    const errors = validateInput(input);
    if (Object.keys(errors).length) return { ok: false, error: 'Perbaiki data pengiriman yang ditandai.', errors };
    const calculated = input.countries.map((country) => calculate(input, country, settings));
    const failed = calculated.find((result) => !result.ok);
    if (failed) return failed;
    const results = calculated.map((result) => result.value).sort((a, b) => a.total - b.total || data.countries.indexOf(a.country) - data.countries.indexOf(b.country));
    return { ok: true, results: results.map((result) => ({ ...result, difference: result.total - results[0].total })) };
  }

  function loadSettings(getStorage = () => window.localStorage) {
    try {
      const saved = getStorage().getItem(storageKey);
      if (saved === null) return { settings: defaults(), state: 'default', message: 'Memakai angka contoh. Perubahan valid akan disimpan di browser ini.' };
      const parsed = JSON.parse(saved);
      if (!validateSettings(parsed)) throw new Error('Bentuk atau rentang tidak valid');
      return { settings: parsed, state: 'saved', message: 'Pengaturan angka contoh tersimpan telah dimuat dari browser ini.' };
    } catch (error) {
      return { settings: defaults(), state: 'error', message: 'Pengaturan tersimpan rusak atau penyimpanan browser tidak tersedia. Memakai angka contoh; perubahan mungkin tidak tersimpan.' };
    }
  }

  function saveSettings(settings, getStorage = () => window.localStorage) {
    if (!validateSettings(settings)) return { saved: false, message: 'Angka belum valid; tidak disimpan. Perbaiki kolom yang ditandai.' };
    try {
      getStorage().setItem(storageKey, JSON.stringify(settings));
      return { saved: true, message: 'Angka contoh tersimpan di browser ini. Tidak ada riwayat perhitungan yang disimpan.' };
    } catch (error) {
      return { saved: false, message: 'Penyimpanan browser tidak tersedia atau penuh. Angka hanya berlaku selama halaman ini terbuka; belum tersimpan.' };
    }
  }

  window.RajaKirimKalkulator = Object.freeze({ storageKey, defaults, validateSettings, validateInput, calculate, compare, loadSettings, saveSettings });
  if (typeof document === 'undefined') return;

  const $ = (selector) => document.querySelector(selector);
  const loaded = loadSettings();
  let settings = loaded.settings;
  let active = { direction: 'ekspor', mode: 'LCL' };
  const { money, rupiah, number } = window.RajaKirimPenawaran.format;
  const readNumber = (input) => input.value.trim() === '' ? NaN : Number(input.value);
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const settingInputs = new Map();

  function setStatus(message, failed = false) {
    $('#settings-status').textContent = message;
    $('#settings-status').dataset.state = failed ? 'error' : 'saved';
  }

  function markError(input, message) {
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    document.getElementById(input.getAttribute('aria-describedby')).textContent = message;
  }

  function settingsInput(id, value, label, min, max, integer = false) {
    const input = element('input');
    input.type = 'number';
    input.id = id;
    input.value = value;
    input.min = min;
    input.max = max;
    input.step = integer ? '1' : 'any';
    input.required = true;
    input.setAttribute('aria-label', label);
    input.setAttribute('aria-describedby', `${id}-error`);
    const error = element('p', 'field-error');
    error.id = `${id}-error`;
    return { input, error };
  }

  function renderSettings() {
    const importing = active.direction === 'impor';
    $('#exchange-rate').value = settings.kurs;
    $('#insurance').value = settings.asuransi;
    $('#import-tax').value = settings.rute.impor[data.countries[0]].pajak;
    $('#import-tax-field').hidden = !importing;
    $('#import-tax').disabled = !importing;
    const unit = active.mode === 'Udara' ? 'USD/kg' : active.mode === 'LCL' ? 'USD/W-M' : 'USD/kontainer';
    $('#rate-heading').textContent = `Tarif kirim (${unit})`;
    $('#settings-caption').textContent = `${importing ? 'Impor ke Indonesia' : 'Ekspor dari Indonesia'} · ${active.mode} · Angka simulasi`;
    $('#settings-context').textContent = importing ? 'Pajak impor Indonesia berlaku sama untuk semua negara asal. Bea contoh dapat berbeda per negara asal.' : 'Bea dan pajak mengikuti negara tujuan. Pilihan arah dan moda mengikuti formulir pengiriman di atas.';
    settingInputs.clear();
    const rows = data.countries.map((country, index) => {
      const row = element('tr');
      const heading = element('th', '', country);
      heading.scope = 'row';
      row.append(heading);
      const values = settings.rute[active.direction][country];
      for (const field of ['tarif', 'lokal', 'bea', 'pajak', 'transit']) {
        const cell = element('td');
        if (field === 'pajak' && importing) {
          cell.append(element('span', 'hint', 'Mengikuti pajak Indonesia'));
        } else {
          const value = ['tarif', 'transit'].includes(field) ? values[field][active.mode] : values[field];
          const { input, error } = settingsInput(`setting-${index}-${field}`, value, `${country}: ${field}${field === 'tarif' ? ` ${unit}` : ''}`, field === 'transit' ? 1 : 0, ['bea', 'pajak'].includes(field) ? 100 : field === 'transit' ? 120 : 1000000, field === 'transit');
          settingInputs.set(`${country}:${field}`, { country, field, input });
          cell.append(input, error);
        }
        row.append(cell);
      }
      return row;
    });
    $('#rate-rows').replaceChildren(...rows);
    for (const id of ['exchange-rate', 'insurance', 'import-tax']) markError($(`#${id}`), '');
  }

  function readSettings() {
    const draft = clone(settings);
    let valid = true;
    function read(input, min, max, integer, message) {
      const value = readNumber(input);
      const error = !numberIn(value, min, max) || (integer && !Number.isInteger(value)) ? message : '';
      markError(input, error);
      if (error) valid = false;
      return value;
    }
    draft.kurs = read($('#exchange-rate'), Number.MIN_VALUE, Number.MAX_VALUE, false, 'Kurs harus berupa angka lebih dari 0.');
    draft.asuransi = read($('#insurance'), 0, 100, false, 'Asuransi harus 0–100%.');
    if (active.direction === 'impor') {
      const tax = read($('#import-tax'), 0, 100, false, 'Pajak Indonesia harus 0–100%.');
      data.countries.forEach((country) => { draft.rute.impor[country].pajak = tax; });
    }
    for (const { country, field, input } of settingInputs.values()) {
      const percent = ['bea', 'pajak'].includes(field);
      const transit = field === 'transit';
      const value = read(input, transit ? 1 : 0, percent ? 100 : transit ? 120 : 1000000, transit, transit ? 'Transit harus bilangan bulat 1–120 hari.' : percent ? 'Persentase harus 0–100%.' : 'Biaya harus 0–1.000.000 USD.');
      if (['tarif', 'transit'].includes(field)) draft.rute[active.direction][country][field][active.mode] = value;
      else draft.rute[active.direction][country][field] = value;
    }
    return { valid: valid && validateSettings(draft), draft };
  }

  function readInput() {
    return {
      direction: active.direction, mode: active.mode,
      countries: [...document.querySelectorAll('input[name="country"]:checked')].map((input) => input.value),
      goods: readNumber($('#goods')), weight: readNumber($('#weight')), volume: readNumber($('#volume')),
      containers: readNumber($('#containers')), description: $('#description').value
    };
  }

  function clearResults(message) {
    $('#offers').replaceChildren();
    $('#count').textContent = '0 negara';
    $('#summary').textContent = '';
    $('#results-status').textContent = message;
  }

  function renderOffer(result) {
    const card = element('article', 'offer');
    const heading = element('div', 'offer-heading');
    const name = element('div');
    name.append(element('h3', '', result.country), element('p', '', result.route));
    heading.append(name);
    if (result.difference === 0) heading.append(element('span', 'offer-tag best', 'Termurah'));
    card.append(heading);
    const price = element('div', 'offer-data');
    price.append(element('span', '', 'TOTAL BIAYA SIMULASI'), element('strong', 'price', money(result.total)), element('p', 'idr-estimate', `≈ ${rupiah(result.totalIdr)}`), element('p', '', `${result.mode} · Transit contoh ${result.transit} hari`));
    card.append(price, element('p', 'cost-difference', result.difference === 0 ? `Selisih ${money(0)} · acuan termurah` : `+ ${money(result.difference)} dari yang termurah`));
    const details = element('details');
    details.append(element('summary', '', 'Rincian 6 komponen biaya +'));
    const breakdown = element('dl', 'cost-breakdown');
    const labels = { barang: 'Nilai barang', kirim: 'Ongkos kirim', lokal: 'Biaya lokal', asuransi: `Asuransi (${number(result.asuransi)}%)`, bea: `Bea masuk (${number(result.bea)}%)`, pajak: `Pajak impor (${number(result.pajak)}%)` };
    Object.entries(labels).forEach(([key, label]) => {
      const row = element('div');
      row.append(element('dt', '', label), element('dd', '', money(result.components[key])));
      breakdown.append(row);
    });
    const unit = result.mode === 'Udara' ? 'kg tertagih' : result.mode === 'LCL' ? 'W/M' : 'kontainer';
    details.append(breakdown, element('p', 'calculation-note', `${number(result.quantity)} ${unit} × ${money(result.rate)}. CIF ${money(result.cif)}. Pajak atas CIF + bea. Kurs USD 1 = ${rupiah(result.kurs)}. Perhitungan memakai presisi penuh; tampilan dibulatkan.`));
    const actions = element('div', 'offer-actions');
    const button = element('button', 'button primary', 'Buat surat penawaran');
    button.type = 'button';
    button.setAttribute('aria-label', `Buat surat penawaran untuk ${result.route}`);
    const status = element('p', 'field-error');
    status.setAttribute('role', 'status');
    button.addEventListener('click', () => {
      const saved = window.RajaKirimPenawaran.handoff(result);
      status.textContent = saved.message;
    });
    actions.append(button);
    card.append(details, actions, status);
    return card;
  }

  function renderComparison(focusError = false) {
    const input = readInput();
    const errors = validateInput(input);
    for (const id of ['goods', 'weight', 'volume', 'containers', 'description', 'mode']) markError($(`#${id}`), errors[id] || '');
    $('#countries-error').textContent = errors.countries || '';
    $('.country-field').setAttribute('aria-invalid', errors.countries ? 'true' : 'false');
    $('#form-status').textContent = Object.keys(errors).length ? 'Perbaiki data pengiriman yang ditandai.' : '';
    if (!readSettings().valid) {
      clearResults('Angka contoh belum valid. Perbaiki kolom di Pengaturan angka contoh; hasil sementara disembunyikan.');
      return;
    }
    const result = compare(input, settings);
    if (!result.ok) {
      clearResults(result.error);
      if (focusError) $('#calculator-form [aria-invalid="true"] input, #calculator-form input[aria-invalid="true"], #calculator-form select[aria-invalid="true"]')?.focus();
      return;
    }
    $('#count').textContent = `${result.results.length} negara`;
    $('#summary').textContent = `${input.direction === 'ekspor' ? 'Ekspor dari Indonesia' : 'Impor ke Indonesia'} · ${input.mode} · Nilai barang ${money(input.goods)} · Diurutkan dari total termurah`;
    $('#results-status').textContent = `${result.results.length} negara dibandingkan. ${result.results[0].country} memiliki total simulasi termurah ${money(result.results[0].total)}.`;
    $('#offers').replaceChildren(...result.results.map(renderOffer));
  }

  function applySettings() {
    const result = readSettings();
    if (!result.valid) {
      setStatus('Angka belum valid; tidak disimpan. Perbaiki kolom yang ditandai sebelum mengganti arah atau moda.', true);
      clearResults('Perbaiki angka contoh yang ditandai untuk melihat perbandingan.');
      return false;
    }
    settings = result.draft;
    const saved = saveSettings(settings);
    setStatus(saved.message, !saved.saved);
    renderComparison();
    return true;
  }

  function renderMode() {
    const fcl = active.mode === 'FCL';
    for (const id of ['weight', 'volume']) {
      $(`#${id}-field`).hidden = fcl;
      $(`#${id}`).disabled = fcl;
    }
    $('#containers-field').hidden = !fcl;
    $('#containers').disabled = !fcl;
    $('#countries-label').textContent = active.direction === 'ekspor' ? 'NEGARA TUJUAN' : 'NEGARA ASAL';
    $('#mode-hint').textContent = active.mode === 'Udara' ? 'Udara: berat tertagih = nilai terbesar antara kg dan m³ × 167.' : active.mode === 'LCL' ? 'LCL: W/M = nilai terbesar antara m³, kg ÷ 1.000, dan minimum 1.' : 'FCL: ongkos kirim = jumlah kontainer × tarif per kontainer. Berat dan volume tidak digunakan.';
  }

  data.countries.forEach((country, index) => {
    const label = element('label');
    const input = element('input');
    input.type = 'checkbox';
    input.name = 'country';
    input.value = country;
    input.id = `country-${index}`;
    input.checked = true;
    label.append(input, element('span', '', country));
    $('#countries').append(label);
  });
  $('#calculator-form').addEventListener('submit', (event) => { event.preventDefault(); renderComparison(true); });
  $('#calculator-form').addEventListener('input', (event) => {
    if (event.target.name !== 'direction' && event.target.id !== 'mode') renderComparison();
  });
  $('#calculator-form').addEventListener('change', (event) => {
    if (event.target.name !== 'direction' && event.target.id !== 'mode') return;
    if (!readSettings().valid) {
      document.querySelectorAll('input[name="direction"]').forEach((input) => { input.checked = input.value === active.direction; });
      $('#mode').value = active.mode;
      $('#settings-panel').open = true;
      setStatus('Perbaiki angka yang ditandai atau kembalikan angka contoh sebelum mengganti arah atau moda.', true);
      $('#settings-form [aria-invalid="true"]')?.focus();
      return;
    }
    active = { direction: $('input[name="direction"]:checked').value, mode: $('#mode').value };
    renderMode();
    renderSettings();
    renderComparison();
  });
  $('#settings-form').addEventListener('input', applySettings);
  $('#settings-form').addEventListener('submit', (event) => { event.preventDefault(); if (!applySettings()) $('#settings-form [aria-invalid="true"]')?.focus(); });
  $('#reset-settings').addEventListener('click', () => {
    if (!window.confirm('Kembalikan semua angka kalkulator ke angka contoh? Pengaturan untuk kedua arah dan semua moda di browser ini akan diganti.')) return;
    settings = defaults();
    const saved = saveSettings(settings);
    renderSettings();
    renderComparison();
    setStatus(saved.saved ? 'Semua angka kalkulator telah dikembalikan ke angka contoh dan disimpan di browser ini.' : `Angka contoh dipakai kembali. ${saved.message}`, !saved.saved);
  });
  renderMode();
  renderSettings();
  renderComparison();
  setStatus(loaded.message, loaded.state === 'error');
})();
