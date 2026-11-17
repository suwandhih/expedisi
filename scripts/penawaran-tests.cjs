'use strict';

// Unit Node/VM dengan test double terbatas; tidak menjalankan browser.
const assert = require('node:assert/strict');
const { Script } = require('node:vm');
const copy = (value) => JSON.parse(JSON.stringify(value));

module.exports = function checkQuotation(sources, sandbox) {
  new Script(sources.get('raja-kirim/penawaran.js'), { filename: 'penawaran.js' }).runInNewContext(sandbox, { timeout: 1000 });
  const quotation = sandbox.window.RajaKirimPenawaran;
  const calculator = sandbox.window.RajaKirimKalkulator;
  assert(Object.isFrozen(quotation));
  const input = { direction: 'ekspor', countries: [...sandbox.window.RajaKirimData.countries], mode: 'LCL', goods: 1000, weight: 120, volume: 1.5, containers: 2, description: 'Kopi kemasan' };
  const settings = calculator.defaults();
  const made = '2026-11-16T12:00:00.000Z';
  let cases = 0;
  for (const direction of ['ekspor', 'impor']) {
    for (const mode of ['Udara', 'LCL', 'FCL']) {
      for (const country of input.countries) {
        const result = calculator.calculate({ ...input, direction, mode }, country, settings).value;
        const before = JSON.stringify(result);
        const payload = quotation.createPayload(result, made);
        assert(quotation.validatePayload(payload));
        assert(Object.isFrozen(payload));
        assert.equal(payload.arah, direction);
        assert.equal(payload.negara, country);
        assert.equal(payload.rute, result.route);
        assert.equal(payload.dibuat, made);
        assert.equal(payload.layanan, `${direction === 'ekspor' ? 'Ekspor' : 'Impor'} · ${mode === 'Udara' ? 'Udara' : `Laut · ${mode}`} · Kopi kemasan`);
        assert.equal(payload.berat, mode === 'FCL' ? '2 kontainer' : '120 kg · 1,5 m³');
        assert.equal(payload.total, `${quotation.format.money(result.total)} (≈ ${quotation.format.rupiah(result.totalIdr)})`);
        const costs = Object.values(result.components).map((value) => quotation.format.money(value));
        payload.rincian.split(' · ').forEach((part, index) => assert(part.endsWith(costs[index])));
        assert.deepEqual(payload.rincian.split(' · ').map((part) => part.split(' ')[0]), ['Barang', 'Kirim', 'Lokal', 'Asuransi', 'Bea', 'Pajak']);
        assert(Object.values(payload).filter((value) => typeof value === 'string').every((value) => value.length <= 300));
        assert.equal(JSON.stringify(result), before, 'Membuat payload tidak boleh mengubah hasil kalkulator');
        cases += 1;
      }
    }
  }
  const comparisonOffers = [];
  const data = sandbox.window.RajaKirimData;
  for (const direction of ['ekspor', 'impor']) {
    for (const country of data.countries) {
      for (const mode of ['Udara', 'LCL', 'FCL']) {
        for (const vendor of data.vendors) {
          // Nilai terhitung sengaja terpisah dari rumus tarif untuk mendeteksi hitung ulang.
          const offer = { direction, country, mode, name: mode === 'Udara' ? vendor.air : vendor.name,
            freight: 815.25 + vendor.adjustment, local: vendor.local,
            total: 815.25 + vendor.adjustment + vendor.local, transit: 9 + vendor.days };
          comparisonOffers.push(offer);
          const before = JSON.stringify(offer);
          const comparison = quotation.createComparisonPayload(offer, made);
          assert(quotation.validatePayload(comparison));
          assert(Object.isFrozen(comparison));
          assert.deepEqual(Object.keys(comparison).sort(), ['versi', 'sumber', 'arah', 'negara', 'rute', 'layanan', 'berat', 'total', 'rincian', 'dibuat'].sort());
          assert.equal(comparison.versi, 2);
          assert.equal(comparison.sumber, 'perbandingan');
          assert.equal(comparison.arah, direction);
          assert.equal(comparison.negara, country);
          assert.equal(comparison.rute, direction === 'ekspor' ? `Jakarta → ${country}` : `${country} → Jakarta`);
          assert.equal(comparison.layanan, `${direction === 'ekspor' ? 'Ekspor' : 'Impor'} · ${mode === 'Udara' ? 'Udara' : `Laut · ${mode}`} · ${offer.name} (simulasi) · transit ${offer.transit} hari`);
          assert.equal(comparison.berat, 'Belum ditentukan (estimasi per pengiriman)');
          assert.equal(comparison.total, `${quotation.format.money(offer.total)} (≈ ${quotation.format.rupiah(offer.total * data.kurs)})`);
          assert.equal(comparison.rincian, `Kirim ${quotation.format.money(offer.freight)} · Lokal ${quotation.format.money(offer.local)}`);
          assert.equal(comparison.dibuat, made);
          assert.equal(quotation.sourceLabel(comparison), 'Perbandingan harga');
          assert(Object.values(comparison).filter((value) => typeof value === 'string').every((value) => value.length <= 300));
          assert.equal(JSON.stringify(offer), before, 'Payload tidak boleh mengubah offer terpilih');
        }
      }
    }
  }
  assert.equal(comparisonOffers.length, 108, 'Semua arah × negara × moda × vendor diuji');
  const offer = comparisonOffers.find((value) => value.direction === 'impor' && value.country === 'Malaysia' && value.mode === 'LCL' && value.name === 'Pacific Bridge');
  const comparisonPayload = quotation.createComparisonPayload(offer, made);
  const invalidOffers = [null, [], {}, { ...offer, direction: 'domestik' }, { ...offer, country: 'Jepang' }, { ...offer, mode: 'Kereta' }, { ...offer, name: 'Vendor asing' }, { ...offer, name: 'Pacific Air Connect' }, { ...offer, total: offer.total + 1 }];
  for (const field of Object.keys(offer)) {
    const missing = { ...offer }; delete missing[field];
    invalidOffers.push(missing, { ...offer, [field]: null }, { ...offer, [field]: [] }, { ...offer, [field]: '' });
  }
  for (const field of ['freight', 'local', 'total']) {
    for (const value of [0, -1, NaN, Infinity, -Infinity, '100', Number.MAX_VALUE]) invalidOffers.push({ ...offer, [field]: value });
  }
  for (const transit of [0, -1, 1.5, NaN, Infinity, '9']) invalidOffers.push({ ...offer, transit });
  invalidOffers.forEach((value) => assert.equal(quotation.createComparisonPayload(value, made), null));
  assert.equal(quotation.createComparisonPayload(offer, 'kemarin'), null);
  assert.equal(quotation.createComparisonPayload(offer, '2026-02-30T12:00:00.000Z'), null);
  const invalidComparisons = [
    { ...comparisonPayload, sumber: 'kalkulator' }, { ...comparisonPayload, sumber: 'x'.repeat(301) },
    { ...comparisonPayload, versi: 1 }, { ...comparisonPayload, versi: 3 }, { ...comparisonPayload, extra: 'x' },
    { ...comparisonPayload, rute: 'Malaysia → Indonesia' }, { ...comparisonPayload, rute: 'Jakarta → Malaysia' }
  ];
  for (const field of Object.keys(comparisonPayload)) {
    const missing = { ...comparisonPayload }; delete missing[field];
    invalidComparisons.push(missing);
    if (field !== 'versi') invalidComparisons.push({ ...comparisonPayload, [field]: null }, { ...comparisonPayload, [field]: '' }, { ...comparisonPayload, [field]: 'x'.repeat(301) });
  }
  invalidComparisons.forEach((value) => assert.equal(quotation.validatePayload(value), false));
  assert(quotation.validatePayload({ ...comparisonPayload, layanan: 'x'.repeat(300) }));

  const result = calculator.calculate(input, 'Australia', settings).value;
  const payload = quotation.createPayload(result, made);
  assert.equal(quotation.sourceLabel(payload), 'Kalkulator negara');
  const noDescription = quotation.createPayload({ ...result, description: '' }, made);
  assert.equal(noDescription.layanan, 'Ekspor · Laut · LCL');
  assert(quotation.createPayload({ ...result, description: 'a'.repeat(120) }, made));
  for (const value of [null, [], {}, { ...result, total: Infinity }, { ...result, totalIdr: NaN }, { ...result, description: 'a'.repeat(121) }, { ...result, components: {} }, { ...result, volume: 0 }]) {
    assert.equal(quotation.createPayload(value, made), null);
  }
  const enormous = calculator.calculate({ ...input, goods: 1e100 }, 'Australia', settings);
  assert(enormous.ok);
  assert.equal(quotation.createPayload(enormous.value, made), null, 'Jangan potong angka panjang menjadi total palsu');

  const invalid = [null, [], {}, { ...payload, versi: 2 }, { ...payload, extra: 'x' }, { ...payload, arah: 'domestik' }, { ...payload, negara: 'Jepang' }, { ...payload, rute: 'Australia → Indonesia' }, { ...payload, dibuat: 'kemarin' }, { ...payload, dibuat: '2026-02-30T12:00:00.000Z' }];
  for (const field of Object.keys(payload).filter((key) => key !== 'versi')) {
    const missing = { ...payload }; delete missing[field];
    invalid.push(missing, { ...payload, [field]: null }, { ...payload, [field]: 1 }, { ...payload, [field]: [] }, { ...payload, [field]: '' }, { ...payload, [field]: 'x'.repeat(301) });
  }
  assert(quotation.validatePayload({ ...payload, layanan: 'x'.repeat(300) }), 'Batas 300 karakter diterima');
  invalid.forEach((value) => assert.equal(quotation.validatePayload(value), false));

  const surat = sources.get('raja-kirim/surat.js');
  const customers = JSON.parse(new Script(surat.slice(0, surat.indexOf('const defaults =')) + '\nJSON.stringify(customers);').runInNewContext({}, { timeout: 1000 }));
  const customersBefore = JSON.stringify(customers);
  for (const customer of customers) {
    const original = copy(customer);
    const merged = quotation.replacements(customer, payload, 'quotation');
    for (const key of ['rute', 'layanan', 'berat', 'total', 'rincian']) assert.equal(merged[key], payload[key]);
    for (const key of ['id', 'nama', 'perusahaan', 'nomor', 'tanggal']) assert.equal(merged[key], customer[key]);
    assert.deepEqual(copy(quotation.replacements(customer, payload, 'receipt')), { ...original, rincian: '—' });
    assert.deepEqual(copy(quotation.replacements(customer, null, 'quotation')), { ...original, rincian: '—' });
    assert.deepEqual(copy(quotation.replacements(customer, invalid[3], 'quotation')), { ...original, rincian: '—' });
    const comparisonMerged = quotation.replacements(customer, comparisonPayload, 'quotation');
    for (const key of ['rute', 'layanan', 'berat', 'total', 'rincian']) assert.equal(comparisonMerged[key], comparisonPayload[key]);
    for (const key of ['id', 'nama', 'perusahaan', 'nomor', 'tanggal']) assert.equal(comparisonMerged[key], customer[key]);
    assert.deepEqual(copy(quotation.replacements(customer, comparisonPayload, 'receipt')), { ...original, rincian: '—' });
    assert.deepEqual(customer, original);
  }
  assert.equal(JSON.stringify(customers), customersBefore);
  const values = new Map([['raja-kirim-surat-v1', customersBefore], [calculator.storageKey, JSON.stringify(settings)]]);
  const writes = [];
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem(key, value) { writes.push(key); values.set(key, value); },
    removeItem(key) { writes.push(key); values.delete(key); }
  };
  const getStorage = () => storage;
  assert.equal(quotation.loadPayload(getStorage).state, 'empty');
  assert(quotation.savePayload(payload, getStorage).saved);
  assert.deepEqual(copy(quotation.loadPayload(getStorage).payload), copy(payload));
  const navigation = [];
  const handed = quotation.handoff(result, getStorage, (url) => {
    assert(quotation.validatePayload(JSON.parse(values.get(quotation.storageKey))), 'Payload harus tersimpan sebelum navigasi');
    navigation.push(url);
  });
  assert(handed.saved);
  assert.deepEqual(navigation, ['surat.html#dokumen']);
  const another = calculator.calculate({ ...input, direction: 'impor' }, 'Malaysia', settings).value;
  assert(quotation.handoff(another, getStorage, () => {}).saved);
  assert.equal(quotation.loadPayload(getStorage).payload.negara, 'Malaysia', 'Pilihan baru mengganti hasil lama, bukan menambah riwayat');
  assert.equal(values.size, 3);
  assert.equal(quotation.loadPayload(getStorage).payload.versi, 1);
  assert(quotation.handoffComparison(offer, getStorage, (url) => {
    assert.equal(JSON.parse(values.get(quotation.storageKey)).sumber, 'perbandingan', 'Simpan data perbandingan sebelum navigasi');
    navigation.push(url);
  }).saved);
  assert.deepEqual(navigation, ['surat.html#dokumen', 'surat.html#dokumen']);
  assert.equal(values.size, 3, 'Perbandingan mengganti payload kalkulator pada kunci yang sama');
  assert.equal(quotation.loadPayload(getStorage).payload.versi, 2);
  assert.equal(quotation.loadPayload(getStorage).payload.sumber, 'perbandingan');
  assert.equal(quotation.loadPayload(getStorage).payload.rute, 'Malaysia → Jakarta');
  assert.match(quotation.loadPayload(getStorage).payload.layanan, /Pacific Bridge/);
  const previousStored = values.get(quotation.storageKey);
  const blocked = () => { throw new Error('SecurityError'); };
  const full = () => ({ setItem() { throw new Error('QuotaExceededError'); } });
  for (const denied of [blocked, full]) {
    const failure = quotation.handoff(result, denied, () => assert.fail('Dilarang navigasi bila penyimpanan gagal'));
    assert.equal(failure.saved, false);
    assert.match(failure.message, /penyimpanan browser/);
    const comparisonFailure = quotation.handoffComparison(offer, denied, () => assert.fail('Perbandingan gagal tidak boleh navigasi'));
    assert.equal(comparisonFailure.saved, false);
    assert.match(comparisonFailure.message, /penyimpanan browser/);
    assert.equal(values.get(quotation.storageKey), previousStored, 'Kegagalan simpan tidak mengubah data sebelumnya');
  }
  for (const invalidOffer of invalidOffers) {
    const comparisonFailure = quotation.handoffComparison(invalidOffer, getStorage, () => assert.fail('Offer tidak valid tidak boleh navigasi'));
    assert.equal(comparisonFailure.saved, false);
    assert.match(comparisonFailure.message, /Hasil penawaran tidak valid/);
    assert.equal(values.get(quotation.storageKey), previousStored);
  }
  assert.equal(quotation.handoff({}, getStorage, () => assert.fail('Dilarang navigasi bila hasil tidak valid')).saved, false);
  assert.equal(quotation.loadPayload(blocked).state, 'error');
  assert.equal(quotation.clearPayload(blocked).cleared, false);
  assert.equal(quotation.savePayload(invalid[3], getStorage).saved, false);
  for (const raw of ['{rusak', ...invalid.map((value) => JSON.stringify(value)), ...invalidComparisons.map((value) => JSON.stringify(value))]) {
    values.set(quotation.storageKey, raw);
    const restored = quotation.loadPayload(getStorage);
    assert.equal(restored.payload, null);
    assert.equal(restored.state, 'error');
    assert.match(restored.message, /^Data penawaran tersimpan rusak.*dihapus/);
    assert.doesNotMatch(restored.message, /Kalkulator negara/);
    assert.equal(values.has(quotation.storageKey), false);
  }
  const removeDenied = quotation.loadPayload(() => ({ getItem: () => '{rusak', removeItem() { throw new Error('SecurityError'); } }));
  assert.equal(removeDenied.payload, null);
  assert.match(removeDenied.message, /^Data penawaran tersimpan rusak.*diabaikan.*belum dapat dihapus/);
  assert(quotation.savePayload(payload, getStorage).saved);
  assert(quotation.clearPayload(getStorage).cleared);
  assert.equal(quotation.loadPayload(getStorage).payload, null);
  assert(writes.every((key) => key === quotation.storageKey));
  assert.equal(values.get('raja-kirim-surat-v1'), customersBefore, 'Data pelanggan tersimpan tidak boleh disentuh');
  assert.equal(values.get(calculator.storageKey), JSON.stringify(settings));

  // Uji unit fungsi hash, bukan navigasi/otomasi browser.
  const hashSource = surat.slice(surat.indexOf('function activateHashTab()'), surat.indexOf("window.addEventListener('hashchange'"));
  assert(hashSource.includes("location.hash === '#dokumen'"));
  for (const [hash, expected] of [['#dokumen', ['tab-docs', 'quotation', 'load', 'render']], ['#pelanggan', ['tab-customers']], ['', ['tab-mail']]]) {
    const actions = [];
    new Script(hashSource + '\nactivateHashTab();').runInNewContext({
      location: { hash }, $: (id) => id, activateTab: (id) => actions.push(id),
      selectDocumentType: (type) => actions.push(type), loadQuotationSource: () => actions.push('load'), renderDocuments: () => actions.push('render')
    }, { timeout: 1000 });
    assert.deepEqual(actions, expected);
  }
  assert.match(surat, /window\.addEventListener\('hashchange', activateHashTab\)/);
  assert.match(surat, /if \(location\.hash === '#dokumen' \|\| location\.hash === '#pelanggan'\) activateHashTab\(\)/);
  assert.match(surat, /sanitized\(\$\('template-editor'\), values\)/);
  assert.match(surat, /quotation\.replacements\(customer, quotationPayload, currentType\)/);

  const nodes = new Map(['quotation-source', 'quotation-source-text', 'quotation-source-status', 'reset-quotation-source'].map((id) => [id, { textContent: '', hidden: false, addEventListener(event, callback) { this[event] = callback; } }]));
  let renders = 0;
  const sourceContext = { quotation, $: (id) => nodes.get(id), setStatus(node, message) { node.textContent = message; }, renderDocuments() { renders += 1; }, quotationPayload: null };
  // Inject only storage dependency; all banner/reset functions are the production source.
  sourceContext.quotation = { ...quotation, loadPayload: () => quotation.loadPayload(getStorage), clearPayload: () => quotation.clearPayload(getStorage) };
  new Script(surat.slice(surat.indexOf('function loadQuotationSource()'), surat.indexOf('function renderDocuments()'))).runInNewContext(sourceContext, { timeout: 1000 });
  quotation.savePayload(payload, getStorage);
  sourceContext.loadQuotationSource(); sourceContext.renderQuotationSource();
  assert.equal(nodes.get('quotation-source').hidden, false);
  assert.equal(nodes.get('quotation-source-text').textContent, `Data dari Kalkulator negara: ${payload.rute} · ${payload.total}`);
  quotation.savePayload(comparisonPayload, getStorage);
  sourceContext.loadQuotationSource(); sourceContext.renderQuotationSource();
  assert.equal(nodes.get('quotation-source').hidden, false);
  assert.equal(nodes.get('quotation-source-text').textContent, `Data dari Perbandingan harga: ${comparisonPayload.rute} · ${comparisonPayload.total}`);
  nodes.get('reset-quotation-source').click(); sourceContext.renderQuotationSource();
  assert.equal(renders, 1);
  assert.equal(nodes.get('quotation-source').hidden, true);
  assert.equal(quotation.loadPayload(getStorage).payload, null);
  assert.match(nodes.get('quotation-source-status').textContent, /Data contoh pelanggan/);
  values.set(quotation.storageKey, '{rusak'); sourceContext.loadQuotationSource();
  assert.match(nodes.get('quotation-source-status').textContent, /rusak/);
  assert.equal(sourceContext.quotationPayload, null);

  // Test double node hanya untuk kontrak sanitizer: elemen pasif dan teks, tanpa parser HTML.
  const node = (tagName, childNodes = []) => ({ nodeType: 1, tagName, childNodes, append(child) { this.childNodes.push(child); }, getAttribute() { return null; } });
  const text = (value) => ({ nodeType: 3, nodeValue: value });
  const sanitizer = { Node: { TEXT_NODE: 3, ELEMENT_NODE: 1 }, document: { createTextNode: text, createElement: (tag) => node(tag.toUpperCase()), createDocumentFragment: () => node('FRAGMENT') } };
  new Script(surat.slice(surat.indexOf('const safeTags ='), surat.indexOf('function selected('))).runInNewContext(sanitizer, { timeout: 1000 });
  const malicious = '<img src=x onerror=alert(1)>{{total}}';
  const unsafePayload = { ...payload, layanan: malicious, rincian: malicious };
  const target = node('DIV');
  sanitizer.cleanNode(text('{{layanan}} | {{rincian}} | {{total}}'), target, quotation.replacements(customers[0], unsafePayload, 'quotation'));
  assert.equal(target.childNodes.length, 1);
  assert.equal(target.childNodes[0].nodeType, 3);
  assert.equal(target.childNodes[0].nodeValue, `${malicious} | ${malicious} | ${payload.total}`, 'Payload harus menjadi teks literal, bukan HTML atau placeholder rekursif');
  const defaultTarget = node('DIV');
  sanitizer.cleanNode(text('{{rincian}}'), defaultTarget, quotation.replacements(customers[0], null, 'quotation'));
  assert.equal(defaultTarget.childNodes[0].nodeValue, '—');
  for (const tag of ['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'SVG', 'IMG']) sanitizer.cleanNode(node(tag, [text('aktif')]), target, {});
  assert.equal(target.childNodes.length, 1, 'Konten aktif tidak boleh diteruskan');
  const formatted = node('B', [text('{{rute}}')]);
  sanitizer.cleanNode(formatted, target, quotation.replacements(customers[0], payload, 'quotation'));
  assert.equal(target.childNodes[1].tagName, 'B');
  assert.equal(target.childNodes[1].childNodes[0].nodeValue, payload.rute);
  assert.equal(values.get('raja-kirim-surat-v1'), customersBefore);
  const comparisonTarget = node('DIV');
  sanitizer.cleanNode(text('{{rute}} | {{layanan}} | {{berat}} | {{total}} | {{rincian}}'), comparisonTarget, quotation.replacements(customers[0], comparisonPayload, 'quotation'));
  assert.equal(comparisonTarget.childNodes[0].nodeValue, ['rute', 'layanan', 'berat', 'total', 'rincian'].map((key) => comparisonPayload[key]).join(' | '));

  const defaultsSource = surat.slice(surat.indexOf('const defaults ='), surat.indexOf('const templates ='));
  const defaults = new Script(defaultsSource + '\ndefaults;').runInNewContext({}, { timeout: 1000 });
  assert.match(defaults.quotation, /Rincian biaya: \{\{rincian\}\}/);
  assert.doesNotMatch(defaults.receipt, /rincian|Kalkulator/);
  assert.match(sources.get('raja-kirim/kalkulator.js'), /Buat surat penawaran/);
  assert.match(sources.get('raja-kirim/kalkulator.js'), /RajaKirimPenawaran\.handoff\(result\)/);
  assert.match(sources.get('raja-kirim/surat.html'), /id="quotation-source"[^>]*role="status"/);
  assert.match(sources.get('raja-kirim/surat.html'), /\{\{rincian\}\}/);
  const documentStyles = sources.get('raja-kirim/surat.css');
  assert.doesNotMatch(documentStyles, /#[\da-f]{3,8}\b|rgba?\(/i, 'Surat memakai warna token, bukan literal');
  assert.doesNotMatch(documentStyles, /border-radius:\s*[\d.]/, 'Radius surat memakai token bersama');
  assert.match(documentStyles, /font-family: var\(--font-sans\)/);
  assert.match(documentStyles, /font-family: var\(--font-display\)/);
  assert.match(documentStyles, /outline: 3px solid var\(--brand-primary\)/);
  assert.match(documentStyles, /\.status\.error\s*\{\s*color: var\(--brand-destructive\)/);
  assert.match(sources.get('raja-kirim/surat.html'), /<nav class="bc-nav"/);
  assert.match(sources.get('raja-kirim/surat.html'), /class="card document-preview bc-card"/);
  const printSource = surat.slice(surat.indexOf('function exportPDF('), surat.indexOf('function exportPNG('));
  assert.match(printSource, /@media print\{body\{margin:0;padding:0\}header,small,mark\{color:inherit\}mark\{background:transparent\}\}/);
  assert.match(printSource, /body\.append\(content\.cloneNode\(true\)\)/);
  assert.match(printSource, /printWindow\.print\(\)/);
  console.log(`OK penawaran: ${cases} payload kalkulator + ${comparisonOffers.length} pilihan perbandingan; batas/korupsi/kuota/storage-denied, navigasi setelah simpan, penggantian sumber, pelanggan/receipt tidak berubah, reset/banner, hash Dokumen, dan sanitizer teks.`);
};
