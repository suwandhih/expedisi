'use strict';

// Pemeriksaan unit Node/VM, tanpa browser atau dependensi tambahan.
const assert = require('node:assert/strict');
const { Script } = require('node:vm');
const copy = (value) => JSON.parse(JSON.stringify(value));

module.exports = function checkCalculator(sources, sandbox) {
  const data = sandbox.window.RajaKirimData;
  const countries = ['Singapura', 'Malaysia', 'Tiongkok', 'Vietnam', 'Australia', 'Amerika Serikat'];
  assert.deepEqual(copy(data.countries), countries, 'Enam negara lama harus dipertahankan');
  function frozen(value) {
    if (!value || typeof value !== 'object') return;
    assert(Object.isFrozen(value), 'Semua data bersama, termasuk nested, harus dibekukan');
    Object.values(value).forEach(frozen);
  }
  frozen(data);
  assert.deepEqual(copy(data.adjustments), { Singapura: 0, Malaysia: 35, Tiongkok: 120, Vietnam: 85, Australia: 150, 'Amerika Serikat': 380 });
  const legacyVendors = [
    { name: 'Nusantara Ocean', air: 'Meridian Air Cargo', mark: 'NO', adjustment: 0, local: 180, days: 0, label: 'Harga terendah' },
    { name: 'Pacific Bridge', air: 'Pacific Air Connect', mark: 'PB', adjustment: 185, local: 155, days: -2, label: 'Transit lebih cepat' },
    { name: 'Atlas Freight', air: 'Atlas Air Freight', mark: 'AF', adjustment: 295, local: 210, days: 2, label: 'Opsi fleksibel' }
  ];
  assert.deepEqual(copy(data.vendors).map(({ keunggulan, ...vendor }) => vendor), legacyVendors, 'Harga dan data vendor harus sama dengan baseline sebelum refactor');
  const benefits = [
    ['Jadwal keberangkatan reguler', 'Cocok untuk pengiriman rutin hemat biaya'],
    ['Prioritas muat di pelabuhan/bandara', 'Pembaruan status pengiriman harian', 'Bantuan pengurusan dokumen pabean'],
    ['Jadwal muat dapat diubah sebelum keberangkatan', 'Penanganan barang khusus atau mudah pecah', 'Penjemputan barang di gudang pelanggan']
  ];
  assert.deepEqual(copy(data.vendors).map((vendor) => vendor.keunggulan), benefits, 'Keunggulan laut dan udara memakai contoh yang disepakati');

  // Stub terbatas untuk kontrak render/event perbandingan, bukan simulasi browser.
  function comparisonNodes() {
    const nodes = new Map();
    for (const selector of ['#origin', '#destination', '#origin-label', '#destination-label', '#mode', '#summary', '#count', '#offers', '#results-note', '#selection-summary', '#rate-form', '[name="direction"]:checked']) {
      nodes.set(selector, { value: '', innerHTML: '', textContent: '', events: new Map(), addEventListener(event, handler) { this.events.set(event, handler); } });
    }
    const offers = nodes.get('#offers');
    Object.defineProperty(offers, 'innerHTML', {
      get() { return this.markup || ''; },
      set(markup) {
        this.markup = markup;
        this.cards = [...markup.matchAll(/<article class="([^"]+)" data-offer-index="(\d+)">([\s\S]*?)<\/article>/g)].map(([, classes, index, body]) => {
          const classSet = new Set(classes.split(' '));
          const input = body.match(/<input\b[^>]+>/)?.[0];
          assert(input, 'Setiap kartu harus berisi radio native');
          const attributes = new Map([...input.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value]));
          const radio = {
            attributes, value: attributes.get('value'), checked: /\schecked(?:\s|>)/.test(input), tabIndex: Number(attributes.get('tabindex')),
            setAttribute(key, value) { this.attributes.set(key, value); },
            matches(selector) { return selector === '[name="offer"]'; },
            focus() { offers.focused = this; }
          };
          const badge = { hidden: /class="offer-selection[^"]*" hidden/.test(body) };
          return {
            dataset: { offerIndex: index }, radio, badge,
            classList: { toggle(name, enabled) { if (enabled) classSet.add(name); else classSet.delete(name); }, contains(name) { return classSet.has(name); } },
            querySelector(selector) {
              if (selector === '[name="offer"]') return radio;
              assert.equal(selector, '.offer-selection');
              return badge;
            }
          };
        });
      }
    });
    offers.querySelectorAll = (selector) => { assert.equal(selector, '.offer'); return offers.cards; };
    return nodes;
  }
  function assertSelected(nodes, index) {
    const cards = nodes.get('#offers').cards;
    assert.equal(cards.length, 3);
    assert.equal(cards.filter((card) => card.classList.contains('offer--selected')).length, 1);
    assert.equal(cards.filter((card) => card.radio.checked).length, 1);
    assert.equal(cards.filter((card) => !card.badge.hidden).length, 1);
    assert.equal(cards.filter((card) => card.radio.tabIndex === 0).length, 1);
    cards.forEach((card, i) => {
      assert.equal(card.classList.contains('offer--selected'), i === index);
      assert.equal(card.radio.checked, i === index);
      assert.equal(card.radio.attributes.get('aria-checked'), String(i === index));
      assert.equal(card.radio.tabIndex, i === index ? 0 : -1);
      assert.equal(card.badge.hidden, i !== index);
    });
  }
  const money = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  const rupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  assert.equal(data.kurs, 16000, 'Kurs contoh harus tetap sama');
  let priceCases = 0;
  for (const direction of ['ekspor', 'impor']) {
    for (const mode of ['Udara', 'LCL', 'FCL']) {
      for (const country of countries) {
        const nodes = comparisonNodes();
        nodes.get('#origin').value = direction === 'ekspor' ? 'Jakarta, Indonesia' : country;
        nodes.get('#destination').value = direction === 'ekspor' ? country : 'Jakarta, Indonesia';
        nodes.get('#mode').value = mode;
        nodes.get('[name="direction"]:checked').value = direction;
        const context = { window: { RajaKirimData: data }, document: { querySelector: (selector) => nodes.get(selector), querySelectorAll: () => [] } };
        new Script(sources.get('raja-kirim/harga.js')).runInNewContext(context, { timeout: 1000 });
        const output = nodes.get('#offers').innerHTML;
        const base = (mode === 'FCL' ? 2100 : mode === 'Udara' ? 720 : 820) + data.adjustments[country];
        const transit = (mode === 'Udara' ? 6 : mode === 'FCL' ? 25 : 28) + (country === 'Amerika Serikat' ? 5 : 0);
        const totals = [...output.matchAll(/class="price">([^<]+)/g)].map((match) => match[1]);
        const days = [...output.matchAll(/<strong>(\d+) hari<\/strong>/g)].map((match) => Number(match[1]));
        const names = [...output.matchAll(/<h3>([^<]+)<\/h3>/g)].map((match) => match[1]);
        const costs = [...output.matchAll(/Biaya (?:pengiriman|lokal)<\/span><strong>([^<]+)/g)].map((match) => match[1]);
        assert.deepEqual(totals, legacyVendors.map((vendor) => money(base + vendor.adjustment + vendor.local)));
        assert.deepEqual(days, legacyVendors.map((vendor) => transit + vendor.days));
        assert.deepEqual(names, legacyVendors.map((vendor) => mode === 'Udara' ? vendor.air : vendor.name));
        assert.deepEqual(costs, legacyVendors.flatMap((vendor) => [money(base + vendor.adjustment), money(vendor.local)]));
        const route = direction === 'ekspor' ? `Jakarta → ${country}` : `${country} → Jakarta`;
        const estimates = [...output.matchAll(/<small class="price-idr bc-muted">([^<]+)<\/small>/g)].map((match) => match[1]);
        assert.deepEqual(estimates, legacyVendors.map((vendor) => `≈ ${rupiah((base + vendor.adjustment + vendor.local) * 16000)}`));
        const detailTotals = [...output.matchAll(/Total estimasi<\/span><strong>([^<]+)/g)].map((match) => match[1]);
        assert.deepEqual(detailTotals, totals, 'Rincian total harus tetap dalam USD');
        assert.equal(nodes.get('#count').textContent, '3 alternatif ekspedisi');
        assert.equal(nodes.get('#summary').textContent, `${direction === 'ekspor' ? 'Ekspor' : 'Impor'} · ${route} · ${mode === 'Udara' ? 'Udara' : 'Laut · ' + mode}`);
        assert.equal(nodes.get('#origin-label').textContent, direction === 'ekspor' ? 'Kota asal' : 'Negara asal');
        assert.equal(nodes.get('#destination-label').textContent, direction === 'ekspor' ? 'Negara tujuan' : 'Kota tujuan');
        assert.equal(nodes.get('#results-note').textContent, `ⓘ Harga dalam USD, termasuk biaya lokal contoh. Perkiraan Rupiah memakai kurs contoh ${rupiah(16000)} per USD. Estimasi transit dan tarif bukan penawaran aktual.`);
        assert.equal((output.match(/<article class="offer bc-card bc-card--raised(?: offer--best offer--selected)?" data-offer-index="\d">/g) || []).length, 3);
        assert.equal((output.match(/ offer--best\b/g) || []).length, 1, 'Hanya satu kartu termurah');
        assert.match(output.trim(), /^<article class="offer bc-card bc-card--raised offer--best offer--selected"/, 'Pilih harga terendah setelah render');
        assertSelected(nodes, 0);
        assert.equal((output.match(/\schecked>/g) || []).length, 1, 'Markup awal hanya mencentang satu radio');
        assert.equal((output.match(/type="radio" name="offer"/g) || []).length, 3);
        assert.equal((output.match(/>Terpilih<\/span>/g) || []).length, 3);
        assert.equal((output.match(/<h4>Keunggulan contoh \(simulasi\)<\/h4>/g) || []).length, 3);
        assert.deepEqual([...output.matchAll(/<li>([^<]+)<\/li>/g)].map((match) => match[1]), benefits.flat());
        assert(output.includes('Harga terendah · pembanding'));
        assert(output.includes(`+${money(160)} dibanding termurah · 2 hari lebih cepat`));
        assert(output.includes(`+${money(325)} dibanding termurah · 2 hari lebih lama`));
        names.forEach((name, i) => assert(output.includes(`id="offer-${i}"`) && output.includes(`<span>Pilih ${name}</span>`)));
        assert.equal(nodes.get('#selection-summary').textContent, `Pilihan Anda: ${names[0]} (simulasi) · ${route} · ${mode === 'Udara' ? 'Udara' : 'Laut · ' + mode} · ${totals[0]} (≈ ${rupiah((base + 180) * 16000)}) · transit ${transit} hari · Harga terendah · pembanding`);
        const shares = [...output.matchAll(/<div class="offer-meter" aria-hidden="true"><span style="--offer-share: ([\d.]+)%"><\/span><\/div>/g)].map((match) => Number(match[1]));
        const expectedTotals = legacyVendors.map((vendor) => base + vendor.adjustment + vendor.local);
        assert.deepEqual(shares, expectedTotals.map((total) => total / Math.max(...expectedTotals) * 100), 'Meter dekoratif harus mengikuti proporsi total tanpa mengubah biaya');
        assert(shares.every((share) => share > 0 && share <= 100));
        assert.equal((output.match(/<details>\s*<summary>Rincian biaya<\/summary>/g) || []).length, 3);
        assert.equal((output.match(/class="offer-route"/g) || []).length, 3);
        const modeBadge = mode === 'Udara' ? 'accent' : mode === 'LCL' ? 'primary' : 'secondary';
        assert(output.includes(`bc-badge--${modeBadge}">${mode === 'Udara' ? 'Udara' : 'Laut · ' + mode}</span>`));
        assert(output.includes('bc-badge--primary">Harga terendah</span>'));
        assert.equal([...output.matchAll(/<p class="offer-route">([^<]+)<\/p>/g)].filter((match) => match[1] === route).length, 3, 'Semua kartu harus memakai rute yang sama');
        priceCases += 1;
      }
    }
  }
  assert.equal(priceCases, 36, 'Semua kombinasi arah, negara dan moda harus diuji');
  // Cabang transit sama tanpa mengubah fixture tarif asli.
  const equalTransitNodes = comparisonNodes();
  equalTransitNodes.get('#destination').value = 'Singapura';
  equalTransitNodes.get('#mode').value = 'LCL';
  equalTransitNodes.get('[name="direction"]:checked').value = 'ekspor';
  const equalTransitData = copy(data);
  equalTransitData.vendors.forEach((vendor) => { vendor.days = 0; });
  new Script(sources.get('raja-kirim/harga.js')).runInNewContext({
    window: { RajaKirimData: equalTransitData },
    document: { querySelector: (selector) => equalTransitNodes.get(selector), querySelectorAll: () => [] }
  }, { timeout: 1000 });
  assert.equal((equalTransitNodes.get('#offers').innerHTML.match(/dibanding termurah · transit sama/g) || []).length, 2);
  equalTransitNodes.get('#offers').events.get('change')({ target: equalTransitNodes.get('#offers').cards[1].radio });
  assert(equalTransitNodes.get('#selection-summary').textContent.endsWith('transit sama'));

  // Kontrak event tanpa browser: perubahan arah mengisi ulang pilihan;
  // submit memakai pilihan terbaru dan mencegah navigasi form.
  const eventNodes = comparisonNodes();
  for (const selector of ['#origin', '#destination']) {
    const node = eventNodes.get(selector);
    Object.defineProperty(node, 'innerHTML', {
      get() { return this.markup || ''; },
      set(markup) { this.markup = markup; this.value = markup.match(/<option>([^<]+)<\/option>/)?.[1] || ''; }
    });
  }
  const radios = ['ekspor', 'impor'].map((value) => ({ value, events: new Map(), addEventListener(event, handler) { this.events.set(event, handler); } }));
  eventNodes.get('[name="direction"]:checked').value = 'ekspor';
  eventNodes.get('#mode').value = 'LCL';
  new Script(sources.get('raja-kirim/harga.js')).runInNewContext({
    window: { RajaKirimData: data },
    document: { querySelector: (selector) => eventNodes.get(selector), querySelectorAll: () => radios }
  }, { timeout: 1000 });
  const originNode = eventNodes.get('#origin');
  const destinationNode = eventNodes.get('#destination');
  const countryOptions = countries.map((country) => `<option>${country}</option>`).join('');
  assert.equal(originNode.innerHTML, '<option>Jakarta, Indonesia</option>');
  assert.equal(destinationNode.innerHTML, countryOptions);
  assert.equal(originNode.disabled, true);
  assert.equal(destinationNode.disabled, false);
  assert.equal(eventNodes.get('#origin-label').textContent, 'Kota asal');
  assert.equal(eventNodes.get('#destination-label').textContent, 'Negara tujuan');
  eventNodes.get('[name="direction"]:checked').value = 'impor';
  radios[1].events.get('change')();
  assert.equal(originNode.innerHTML, countryOptions);
  assert.equal(destinationNode.innerHTML, '<option>Jakarta, Indonesia</option>');
  assert.equal(originNode.disabled, false);
  assert.equal(destinationNode.disabled, true);
  assert.equal(eventNodes.get('#origin-label').textContent, 'Negara asal');
  assert.equal(eventNodes.get('#destination-label').textContent, 'Kota tujuan');
  originNode.value = 'Malaysia';
  let malaysiaPrevented = false;
  eventNodes.get('#rate-form').events.get('submit')({ preventDefault() { malaysiaPrevented = true; } });
  assert(malaysiaPrevented);
  assert.equal(eventNodes.get('#summary').textContent, 'Impor · Malaysia → Jakarta · Laut · LCL');
  assert.equal(eventNodes.get('#count').textContent, '3 alternatif ekspedisi');
  const malaysiaOutput = eventNodes.get('#offers').innerHTML;
  assert.equal((malaysiaOutput.match(/<p class="offer-route">Malaysia → Jakarta<\/p>/g) || []).length, 3);
  assert.deepEqual([...malaysiaOutput.matchAll(/class="price">([^<]+)/g)].map((match) => match[1]), [1035, 1195, 1360].map(money));
  assert.deepEqual([...malaysiaOutput.matchAll(/<small class="price-idr bc-muted">([^<]+)<\/small>/g)].map((match) => match[1]), [1035, 1195, 1360].map((total) => `≈ ${rupiah(total * 16000)}`));
  assert(malaysiaOutput.includes(`+${money(160)} dibanding termurah · 2 hari lebih cepat`));
  assert(malaysiaOutput.includes(`+${money(325)} dibanding termurah · 2 hari lebih lama`));
  const offersNode = eventNodes.get('#offers');
  const selectionSummary = eventNodes.get('#selection-summary');
  function expectedMalaysiaSummary(index) {
    return `Pilihan Anda: ${legacyVendors[index].name} (simulasi) · Malaysia → Jakarta · Laut · LCL · ${money([1035, 1195, 1360][index])} (≈ ${rupiah([1035, 1195, 1360][index] * 16000)}) · transit ${[28, 26, 30][index]} hari · ${index === 0 ? 'Harga terendah · pembanding' : `+${money(index === 1 ? 160 : 325)} dibanding termurah · 2 hari ${index === 1 ? 'lebih cepat' : 'lebih lama'}`}`;
  }
  assertSelected(eventNodes, 0);
  assert.equal(selectionSummary.textContent, expectedMalaysiaSummary(0));
  // Klik/tap di badan setiap kartu memilih dan memfokuskan radio tanpa render ulang.
  for (const index of [1, 2, 0]) {
    offersNode.events.get('click')({ target: { closest(selector) { return selector === '.offer' ? offersNode.cards[index] : null; } } });
    assertSelected(eventNodes, index);
    assert.equal(offersNode.focused, offersNode.cards[index].radio);
    assert.equal(selectionSummary.textContent, expectedMalaysiaSummary(index));
  }
  for (const tag of ['details', 'summary']) {
    offersNode.events.get('click')({ target: { closest(selector) { return selector === 'details, summary' ? { tag } : offersNode.cards[2]; } } });
    assertSelected(eventNodes, 0);
    assert.equal(selectionSummary.textContent, expectedMalaysiaSummary(0), 'Rincian biaya tidak mengubah pilihan');
  }
  offersNode.events.get('click')({ target: { closest() { return null; } } });
  assertSelected(eventNodes, 0);
  // Perubahan radio native (termasuk Space) memperbarui pilihan/ringkasan.
  offersNode.events.get('change')({ target: offersNode.cards[1].radio });
  assertSelected(eventNodes, 1);
  assert.equal(selectionSummary.textContent, expectedMalaysiaSummary(1));
  for (const [sourceIndex, key, expectedIndex] of [[1, 'ArrowRight', 2], [2, 'ArrowDown', 0], [0, 'ArrowLeft', 2], [2, 'ArrowUp', 1]]) {
    let keyPrevented = false;
    offersNode.events.get('keydown')({ key, target: offersNode.cards[sourceIndex].radio, preventDefault() { keyPrevented = true; } });
    assert(keyPrevented, 'Panah tidak boleh menggulir halaman');
    assertSelected(eventNodes, expectedIndex);
    assert.equal(offersNode.focused, offersNode.cards[expectedIndex].radio);
    assert.equal(selectionSummary.textContent, expectedMalaysiaSummary(expectedIndex));
  }
  offersNode.events.get('keydown')({ key: 'Tab', target: offersNode.cards[1].radio, preventDefault() { assert.fail('Tab tetap berperilaku native'); } });
  assertSelected(eventNodes, 1);
  offersNode.events.get('change')({ target: { value: '9', matches() { return true; } } });
  assertSelected(eventNodes, 1);
  eventNodes.get('#rate-form').events.get('submit')({ preventDefault() {} });
  assertSelected(eventNodes, 0);
  assert.equal(selectionSummary.textContent, expectedMalaysiaSummary(0), 'Bandingkan lagi harus kembali memilih termurah');
  originNode.value = 'Australia';
  eventNodes.get('#mode').value = 'Udara';
  let prevented = false;
  eventNodes.get('#rate-form').events.get('submit')({ preventDefault() { prevented = true; } });
  assert(prevented);
  assert.equal(eventNodes.get('#summary').textContent, 'Impor · Australia → Jakarta · Udara');
  assert(eventNodes.get('#offers').innerHTML.includes(`<strong class="price">${money(720 + 150 + 180)}</strong>`));
  assertSelected(eventNodes, 0);
  assert(selectionSummary.textContent.includes('Meridian Air Cargo (simulasi) · Australia → Jakarta · Udara'));
  offersNode.events.get('change')({ target: offersNode.cards[2].radio });
  assertSelected(eventNodes, 2);
  assert(selectionSummary.textContent.includes('Atlas Air Freight (simulasi) · Australia → Jakarta · Udara'));
  assert(selectionSummary.textContent.includes(`${money(1375)} (≈ ${rupiah(1375 * 16000)}) · transit 8 hari`));
  eventNodes.get('[name="direction"]:checked').value = 'ekspor';
  radios[0].events.get('change')();
  assert.equal(originNode.innerHTML, '<option>Jakarta, Indonesia</option>');
  assert.equal(destinationNode.innerHTML, countryOptions);
  assert.equal(originNode.disabled, true);
  assert.equal(destinationNode.disabled, false);
  assert.equal(eventNodes.get('#origin-label').textContent, 'Kota asal');
  assert.equal(eventNodes.get('#destination-label').textContent, 'Negara tujuan');

  new Script(sources.get('raja-kirim/kalkulator.js'), { filename: 'kalkulator.js' }).runInNewContext(sandbox, { timeout: 1000 });
  const calculator = sandbox.window.RajaKirimKalkulator;
  assert(Object.isFrozen(calculator));
  assert(calculator.validateSettings(calculator.defaults()));
  const input = { direction: 'ekspor', countries: [...countries], mode: 'Udara', goods: 1000, weight: 100, volume: 1, containers: 2, description: 'Kopi kemasan' };
  const settings = calculator.defaults();
  settings.asuransi = 1;
  settings.rute.ekspor.Singapura = { tarif: { Udara: 2, LCL: 20, FCL: 700 }, lokal: 100, bea: 10, pajak: 20, transit: { Udara: 2, LCL: 6, FCL: 5 } };
  const close = (actual, expected) => assert(Math.abs(actual - expected) < 0.000001, `Diharapkan ${expected}, menerima ${actual}`);
  const air = calculator.calculate(input, 'Singapura', settings);
  assert(air.ok);
  close(air.value.quantity, 167);
  close(air.value.components.kirim, 334);
  close(air.value.components.asuransi, 13.34);
  close(air.value.cif, 1347.34);
  close(air.value.components.bea, 134.734);
  close(air.value.components.pajak, 296.4148);
  close(air.value.total, 1878.4888);
  close(air.value.totalIdr, 30055820.8);
  assert.equal(air.value.route, 'Indonesia → Singapura');
  const lcl = calculator.calculate({ ...input, mode: 'LCL', weight: 2500 }, 'Singapura', settings);
  assert(lcl.ok);
  close(lcl.value.quantity, 2.5);
  close(lcl.value.total, 1499.86);
  close(calculator.calculate({ ...input, mode: 'LCL', volume: 0.2 }, 'Singapura', settings).value.quantity, 1);
  close(calculator.calculate({ ...input, weight: 1000 }, 'Singapura', settings).value.quantity, 1000);
  const fcl = calculator.calculate({ ...input, mode: 'FCL', weight: NaN, volume: NaN }, 'Singapura', settings);
  assert(fcl.ok);
  close(fcl.value.components.kirim, 1400);
  close(fcl.value.total, 3299.68);
  assert.equal(fcl.value.weight, null);
  assert.equal(fcl.value.volume, null);
  const serialized = JSON.stringify(settings);
  let comparisons = 0;
  for (const direction of ['ekspor', 'impor']) {
    for (const mode of ['Udara', 'LCL', 'FCL']) {
      const result = calculator.compare({ ...input, direction, mode }, settings);
      assert(result.ok);
      assert.equal(result.results.length, 6);
      result.results.forEach((value, index) => {
        assert.equal(Object.keys(value.components).length, 6);
        close(value.total, Object.values(value.components).reduce((sum, part) => sum + part, 0));
        close(value.difference, value.total - result.results[0].total);
        if (index) assert(value.total >= result.results[index - 1].total);
        assert.equal(value.route, direction === 'ekspor' ? `Indonesia → ${value.country}` : `${value.country} → Indonesia`);
        assert(Number.isFinite(value.totalIdr) && value.transit > 0);
        if (direction === 'impor') assert.equal(value.pajak, 11);
        comparisons += 1;
      });
    }
  }
  assert.equal(JSON.stringify(settings), serialized, 'Perhitungan tidak boleh mengubah pengaturan');
  const selected = calculator.compare({ ...input, countries: ['Australia', 'Malaysia'] }, settings);
  assert(selected.ok && selected.results.length === 2);
  assert.deepEqual(copy(selected.results.map((value) => value.country)).sort(), ['Australia', 'Malaysia']);
  for (const patch of [
    { countries: [] }, { countries: ['Tidak ada'] }, { countries: ['Malaysia', 'Malaysia'] }, { countries: null },
    { direction: 'lain' }, { mode: 'lain' }, { goods: 0 }, { goods: -1 }, { goods: NaN }, { goods: Infinity },
    { weight: 0 }, { volume: 0 }, { description: 'a'.repeat(121) }, { description: null },
    { mode: 'FCL', containers: 0 }, { mode: 'FCL', containers: 51 }, { mode: 'FCL', containers: 1.5 }
  ]) assert.equal(calculator.compare({ ...input, ...patch }, settings).ok, false, `Input tidak valid diterima: ${JSON.stringify(patch)}`);
  assert(Object.keys(calculator.validateInput(null)).length);
  assert.equal(calculator.calculate(input, 'Tidak ada', settings).ok, false);
  assert.equal(calculator.calculate({ ...input, countries: ['Malaysia'] }, 'Singapura', settings).ok, false);
  assert.equal(calculator.compare({ ...input, goods: 1e308 }, settings).ok, false, 'Overflow harus ditolak');

  const invalidSettings = [];
  function invalid(change) {
    const value = calculator.defaults();
    change(value);
    invalidSettings.push(value);
  }
  invalid((value) => { value.version = 2; });
  invalid((value) => { value.kurs = 0; });
  invalid((value) => { value.kurs = Infinity; });
  invalid((value) => { value.kurs = '16000'; });
  invalid((value) => { value.asuransi = 101; });
  invalid((value) => { value.asuransi = -1; });
  invalid((value) => { value.rute.impor.Singapura.pajak = 12; });
  invalid((value) => { delete value.rute.ekspor.Malaysia; });
  invalid((value) => { value.rute.ekspor.Singapura.transit.LCL = 1.5; });
  invalid((value) => { value.rute.ekspor.Singapura.transit.Udara = 0; });
  invalid((value) => { value.rute.impor.Malaysia.transit.FCL = 121; });
  invalid((value) => { value.rute.ekspor.Vietnam.tarif.FCL = 1000001; });
  invalid((value) => { value.rute.ekspor.Vietnam.tarif.Udara = -1; });
  invalid((value) => { value.rute.impor.Australia.lokal = 1000001; });
  invalid((value) => { value.rute.impor.Australia.bea = -1; });
  invalid((value) => { value.rute.ekspor.Tiongkok.pajak = 101; });
  invalid((value) => { value.rute.ekspor.Tiongkok.transit = []; });
  invalid((value) => { value.extra = true; });
  invalidSettings.push(null, [], {});
  invalidSettings.forEach((value) => {
    assert.equal(calculator.validateSettings(value), false, 'Pengaturan rusak harus ditolak');
    assert.equal(calculator.saveSettings(value, () => { throw new Error('Tidak boleh menyimpan'); }).saved, false);
  });
  const limits = calculator.defaults();
  limits.asuransi = 100;
  limits.rute.ekspor.Singapura.tarif.LCL = 1000000;
  limits.rute.ekspor.Singapura.lokal = 0;
  limits.rute.ekspor.Singapura.bea = 100;
  limits.rute.ekspor.Singapura.pajak = 0;
  limits.rute.ekspor.Singapura.transit.LCL = 120;
  assert(calculator.validateSettings(limits), 'Batas rentang yang valid harus diterima');
  const values = new Map();
  const storage = () => ({ getItem: (key) => values.has(key) ? values.get(key) : null, setItem: (key, value) => values.set(key, value) });
  assert.equal(calculator.loadSettings(storage).state, 'default');
  assert(calculator.saveSettings(settings, storage).saved);
  assert(values.has('raja-kirim-kalkulator-v1'));
  assert.deepEqual(copy(calculator.loadSettings(storage).settings), copy(settings));
  // Muat ulang konteks JS menggunakan penyimpanan yang sama, tanpa DOM/browser.
  const reload = { window: {} };
  new Script(sources.get('raja-kirim/tarif-contoh.js')).runInNewContext(reload, { timeout: 1000 });
  new Script(sources.get('raja-kirim/kalkulator.js')).runInNewContext(reload, { timeout: 1000 });
  assert.deepEqual(copy(reload.window.RajaKirimKalkulator.loadSettings(storage).settings), copy(settings));
  assert(calculator.saveSettings(calculator.defaults(), storage).saved);
  assert.deepEqual(copy(calculator.loadSettings(storage).settings), copy(calculator.defaults()));
  for (const value of ['{rusak', 'null', '[]', '{}', ...invalidSettings.map((entry) => JSON.stringify(entry))]) {
    values.set(calculator.storageKey, value);
    const restored = calculator.loadSettings(storage);
    assert.equal(restored.state, 'error');
    assert.match(restored.message, /angka contoh/);
    assert.deepEqual(copy(restored.settings), copy(calculator.defaults()));
  }
  const denied = () => { throw new Error('SecurityError'); };
  assert.equal(calculator.loadSettings(denied).state, 'error');
  assert.equal(calculator.saveSettings(settings, denied).saved, false);
  assert.equal(calculator.saveSettings(settings, () => ({ setItem() { throw new Error('QuotaExceededError'); } })).saved, false);
  assert.match(sources.get('raja-kirim/kalkulator.js'), /window\.confirm\(/, 'Reset memerlukan konfirmasi');
  assert.doesNotMatch(sources.get('raja-kirim/kalkulator.js'), /\.innerHTML\s*=|insertAdjacentHTML|document\.write/, 'Kalkulator harus memakai DOM API untuk render');
  const calculatorHtml = sources.get('raja-kirim/kalkulator.html');
  const calculatorCss = sources.get('raja-kirim/kalkulator.css');
  const calculatorJs = sources.get('raja-kirim/kalkulator.js');
  assert.match(calculatorHtml, /maxlength="120"/);
  assert.match(calculatorHtml, /aria-live="polite"/);
  assert.match(calculatorHtml, /<nav class="bc-nav" aria-label="Navigasi utama">/);
  assert.match(calculatorHtml, /aria-current="page" href="kalkulator\.html"/);
  for (const primitive of ['bc-header', 'bc-alert', 'bc-card', 'bc-select', 'bc-btn--primary', 'bc-btn--outline']) {
    assert(calculatorHtml.includes(primitive), `Kalkulator memakai primitif bersama ${primitive}`);
  }
  assert.doesNotMatch(calculatorCss, /#[\da-f]{3,8}\b|\brgba?\s*\(/i, 'CSS kalkulator harus memakai token warna');
  assert(calculatorCss.includes('var(--brand-destructive)'), 'Validasi memakai token destructive');
  assert.match(calculatorCss, /\.table-scroll\s*\{[^}]*overflow-x:\s*auto/, 'Tabel lebar digeser di dalam panel');
  for (const width of [1050, 650, 420]) {
    assert(calculatorCss.includes(`@media (max-width: ${width}px)`), `Breakpoint kalkulator ${width}px dipertahankan`);
  }
  assert.match(calculatorJs, /element\('article', 'offer bc-card bc-card--raised'\)/);
  assert.match(calculatorJs, /element\('button', 'button primary bc-btn bc-btn--primary', 'Buat surat penawaran'\)/);
  assert.match(calculatorJs, /element\('input', 'bc-select'\)/);
  console.log(`OK kalkulator: ${comparisons} hasil ekspor/impor × moda; rumus CIF, urutan, validasi, simpan/muat ulang/reset, penyimpanan rusak/tidak tersedia; ${priceCases} kombinasi harga lama identik.`);
};
