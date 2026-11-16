'use strict';
// Unit Node/VM dan test double terbatas, bukan otomasi browser.
const assert = require('node:assert/strict');
const { Script } = require('node:vm');
const copy = value => JSON.parse(JSON.stringify(value));
function declaration(source, name) {
  const match = source.match(new RegExp(`^function ${name}\\([^\\n]*\\) \\{[\\s\\S]*?^\\}`, 'm'));
  assert(match, `Fungsi ${name} harus tersedia`);
  return match[0];
}
module.exports = function checkCustomers(sources) {
  const sandbox = { window: {} };
  new Script(sources.get('raja-kirim/pelanggan.js')).runInNewContext(sandbox, { timeout: 1000 });
  const api = sandbox.window.RajaKirimPelanggan;
  assert(Object.isFrozen(api));
  const legacy = { id: 'custom', nama: 'Pelanggan tersimpan', perusahaan: 'Perusahaan tersimpan', nomor: 'NO-123', tanggal: 'Kemarin', rute: 'Jakarta → Medan', layanan: 'Layanan lama', berat: '15 kg', total: 'Rp 150.000', alamat: 'Jl. Pelanggan No. 42\nMedan', email1: '', email2: 'second@example.test', phone1: '', phone2: '+62 812 3456 7800' };
  const oldHistory = [{ customer: legacy.id, channel: 'Email', direction: 'incoming', subject: 'Riwayat asli', body: 'Jangan diubah', date: '15 Nov 2026' }];
  const old = { customers: [legacy], history: oldHistory };
  const original = JSON.stringify(old);
  const restored = api.restore(old);
  const customer = restored.customers[0];
  assert.equal(customer.fax, '');
  assert.equal(customer.primaryEmail, 'email2');
  assert.equal(customer.primaryPhone, 'phone2');
  assert.equal(customer.primaryChannel, 'Email');
  assert.equal(api.validateContact(customer), '');
  assert.equal(restored.history[0].destination, '', 'Jangan tebak tujuan riwayat lama dari kontak terbaru');
  assert.equal(JSON.stringify(old), original, 'Migrasi tidak mengubah objek sumber');
  for (const key of Object.keys(legacy)) assert.equal(customer[key], legacy[key]);
  const preferred = { ...customer, fax: '021 555 1234', primaryChannel: 'WhatsApp' };
  assert.deepEqual(copy(api.contactFor(preferred)), { channel: 'WhatsApp', destination: legacy.phone2 });
  assert.deepEqual(copy(api.contactFor(preferred, 'Email')), { channel: 'Email', destination: legacy.email2 });
  const saved = { version: 2, customers: [preferred], history: [{ ...oldHistory[0], destination: 'original@example.test' }] };
  const savedAgain = api.restore(copy(saved));
  assert.equal(savedAgain.customers[0].fax, preferred.fax);
  assert.equal(savedAgain.customers[0].primaryChannel, 'WhatsApp');
  assert.equal(savedAgain.history[0].destination, 'original@example.test');
  const manual = api.normalizeContact({ ...legacy, email2: '', phone2: '' });
  assert.equal(api.validateContact(manual), '', 'Pelanggan manual tanpa kontak elektronik diperbolehkan');
  for (const bad of [null, [], {}, { ...old, version: 3 }, { ...old, customers: [legacy, legacy] }, { ...old, customers: [{ ...legacy, id: '' }] }, { ...old, customers: [{ ...legacy, alamat: 1 }] }, { ...old, customers: [{ ...legacy, primaryChannel: 'Fax' }] }, { ...old, customers: [{ ...legacy, fax: 123 }] }, { ...old, history: [{ ...oldHistory[0], customer: 'unknown' }] }, { ...old, history: [{ ...oldHistory[0], channel: 'Fax' }] }, { ...old, history: [{ ...oldHistory[0], destination: 12 }] }]) assert.throws(() => api.restore(bad));
  for (const changes of [{ nama: '' }, { perusahaan: '' }, { alamat: 'a'.repeat(501) }, { email2: 'bukan-email' }, { email1: 'a'.repeat(255) }, { phone2: 'abc123' }, { fax: '123' }, { primaryEmail: 'email1' }, { primaryPhone: 'phone1' }, { primaryChannel: 'Fax' }, { primaryEmail: 'email3' }, { primaryPhone: 'phone3' }]) assert(api.validateContact({ ...customer, ...changes }), JSON.stringify(changes));
  assert(api.validateContact({ ...customer, email2: '', primaryChannel: 'Email' }));
  assert.equal(api.validateContact({ ...customer, alamat: 'a'.repeat(500), fax: '+62 (21) 555-1234' }), '');

  const date = '16 Nov 2026';
  const nextCustomer = { ...preferred, id: 'second', nama: 'Pelanggan kedua', primaryChannel: 'Email' };
  for (const direction of ['incoming', 'outgoing']) {
    const draft = api.createMessages([preferred, nextCustomer], 'preferred', direction, 'Subjek', 'Isi pesan', date);
    assert(draft.ok);
    assert.deepEqual(copy(draft.entries.map(item => [item.customer, item.channel, item.destination, item.direction])), [[preferred.id, 'WhatsApp', legacy.phone2, direction], ['second', 'Email', legacy.email2, direction]]);
    const snapshot = draft.entries[0].destination;
    const changed = { ...preferred, phone2: '0812 9999 8888' };
    assert.notEqual(api.contactFor(changed).destination, snapshot);
    assert.equal(draft.entries[0].destination, snapshot, 'Tujuan adalah snapshot ketika pesan dicatat');
  }
  const explicit = api.createMessages([preferred, nextCustomer], 'Email', 'outgoing', 'x'.repeat(160), 'Isi', date);
  assert(explicit.ok);
  assert(explicit.entries.every(item => item.channel === 'Email' && item.destination === legacy.email2));
  for (const args of [[[], 'Email', 'incoming', 'A', 'B'], [[manual], 'preferred', 'incoming', 'A', 'B'], [[preferred, manual], 'Email', 'incoming', 'A', 'B'], [[preferred], 'Fax', 'incoming', 'A', 'B'], [[preferred], 'Email', 'invalid', 'A', 'B'], [[preferred], 'Email', 'incoming', '', 'B'], [[preferred], 'Email', 'incoming', 'x'.repeat(161), 'B'], [[preferred], 'Email', 'incoming', 'A', '  ']]) {
    const failed = api.createMessages(...args, date);
    assert.equal(failed.ok, false);
    assert.equal(failed.entries, undefined, 'Gagal secara atomik; tidak mencatat sebagian penerima');
  }
  const examples = api.missingExamples(preferred, []);
  assert.equal(examples.length, 4);
  assert.deepEqual(copy(examples.map(item => `${item.channel}/${item.direction}`).sort()), ['Email/incoming', 'Email/outgoing', 'WhatsApp/incoming', 'WhatsApp/outgoing']);
  assert(examples.every(item => item.customer === preferred.id && item.destination && item.body.includes(preferred.nama)));
  assert.equal(api.missingExamples(preferred, examples).length, 0, 'Pelengkapan contoh idempoten');
  assert.equal(api.missingExamples(preferred, oldHistory).length, 3, 'Riwayat lama tidak digandakan');
  assert.equal(api.missingExamples(manual, []).length, 0, 'Tidak membuat tujuan palsu untuk kontak kosong');
  const otherExamples = api.missingExamples(nextCustomer, examples);
  const combined = [...examples, ...otherExamples];
  for (const c of [preferred, nextCustomer]) {
    for (const channel of ['Email', 'WhatsApp']) {
      for (const direction of ['incoming', 'outgoing']) {
        const box = api.mailbox(combined, { customer: c.id, channel, direction });
        assert.equal(box.count, 1);
        assert(box.entries.every(item => item.customer === c.id && item.channel === channel && item.direction === direction));
      }
    }
  }
  assert.equal(api.mailbox(combined, { customer: 'unknown' }).count, 0);
  const many = Array.from({ length: 19 }, (_, i) => ({ ...examples[0], subject: `Pesan ${i}` }));
  const page1 = api.mailbox([...many, ...otherExamples], { customer: preferred.id });
  const page2 = api.mailbox(many, { customer: preferred.id, page: 2 });
  const page3 = api.mailbox(many, { customer: preferred.id, page: 999 });
  assert.equal(page1.count, 19); assert.equal(page1.pages, 3); assert.equal(page1.entries.length, 8);
  assert.equal(page2.entries[0].subject, 'Pesan 8'); assert.equal(page2.entries.length, 8);
  assert.equal(page3.page, 3); assert.equal(page3.entries.length, 3);
  assert.equal(api.mailbox(many, { customer: preferred.id, page: -1 }).page, 1);

  const surat = sources.get('raja-kirim/surat.js');
  const prefix = surat.slice(0, surat.indexOf('const safeTags ='));
  function load(raw, failRead = false, failWrite = false) {
    const status = { textContent: '' }; const writes = [];
    const context = { window: { RajaKirimPelanggan: api }, document: { getElementById: () => status }, localStorage: {
      getItem(key) { assert.equal(key, api.storageKey); if (failRead) throw new Error('SecurityError'); return raw; },
      setItem(key, value) { if (failWrite) throw new Error('QuotaExceededError'); writes.push([key, value]); }
    } };
    const data = new Script(prefix + '\n({customers, history, saveData});').runInNewContext(context, { timeout: 1000 });
    return { data, status, writes };
  }
  const defaultData = load(null);
  assert.equal(defaultData.data.customers.length, 3);
  for (const c of defaultData.data.customers) {
    assert.equal(api.missingExamples(c, defaultData.data.history).length, 0);
    assert.equal(api.mailbox(defaultData.data.history, { customer: c.id }).count, 4);
    assert(c.alamat && c.fax);
  }
  assert.equal(defaultData.writes.length, 0, 'Jangan menulis contoh pada pemuatan halaman');
  const migrated = load(JSON.stringify(old));
  assert.equal(migrated.data.customers.length, 1);
  assert.equal(migrated.data.customers[0].nama, legacy.nama);
  assert.equal(migrated.data.history.length, 1, 'Jangan menyuntikkan contoh ke riwayat tersimpan');
  assert.equal(migrated.data.history[0].destination, '');
  assert.equal(migrated.writes.length, 0);
  assert(migrated.data.saveData());
  assert.equal(migrated.writes[0][0], api.storageKey);
  const persisted = JSON.parse(migrated.writes[0][1]);
  assert.equal(persisted.version, 2);
  assert.equal(persisted.customers[0].alamat, legacy.alamat);
  assert.equal(persisted.history[0].body, oldHistory[0].body);
  const reloaded = load(migrated.writes[0][1]);
  assert.equal(reloaded.data.customers[0].primaryEmail, 'email2');
  assert.equal(reloaded.data.history.length, 1);
  assert.match(load('{rusak').status.textContent, /tidak dapat dibaca/);
  assert.match(load(null, true).status.textContent, /tidak dapat dibaca/);
  const full = load(JSON.stringify(old), false, true);
  assert.equal(full.data.saveData(), false);
  assert.match(full.status.textContent, /penuh/);

  // Render kotak riwayat memakai hasil modul yang sama, dengan test double node sederhana.
  const nodes = new Map(['history-list', 'history-filter', 'history-channel', 'history-customer-title', 'history-count', 'history-page', 'history-prev', 'history-next', 'history-examples'].map(id => [id, { value: '', textContent: '', disabled: false, replaceChildren() {} }]));
  nodes.get('history-filter').value = preferred.id;
  nodes.get('history-channel').value = 'Email';
  let shown;
  const renderContext = { $: id => nodes.get(id), customers: [preferred, nextCustomer], history: combined, pelanggan: api, direction: 'incoming', historyPage: 1, appendHistory(list, entries) { shown = entries; } };
  new Script(declaration(surat, 'renderHistory') + '\nrenderHistory();').runInNewContext(renderContext);
  assert.equal(shown.length, 1); assert.equal(shown[0].customer, preferred.id); assert.equal(shown[0].channel, 'Email');
  assert.equal(nodes.get('history-customer-title').textContent, `${preferred.nama} · ${preferred.perusahaan}`);
  nodes.get('history-filter').value = nextCustomer.id;
  renderContext.renderHistory(); assert.equal(shown[0].customer, nextCustomer.id);

  const html = sources.get('raja-kirim/surat.html');
  assert(html.indexOf('src="pelanggan.js"') < html.indexOf('src="surat.js"'));
  for (const name of ['primary-email', 'primary-phone', 'primary-channel']) assert(html.includes(`name="${name}"`));
  for (const placeholder of ['alamat', 'fax']) {
    assert(html.includes(`{{${placeholder}}}`));
    const defaults = new Script(surat.slice(surat.indexOf('const defaults ='), surat.indexOf('const templates =')) + '\ndefaults;').runInNewContext({});
    assert(defaults.quotation.includes(`{{${placeholder}}}`));
    assert(defaults.receipt.includes(`{{${placeholder}}}`));
  }
  assert.doesNotMatch(html, /<option value="all">Semua pelanggan/);
  assert.match(html, /Utama tiap pelanggan/);
  assert.match(surat, /values\.alamat \|\|= '—'; values\.fax \|\|= '—'/);
  assert.match(surat, /primaryEmail === 'email1'/);
  assert.match(surat, /primaryPhone === 'phone2'/);
  assert.match(surat, /pelanggan\.validateContact\(values\)/);
  assert.match(surat, /\{ \.\.\.entry, body:/);
  const node = (tagName, childNodes = []) => ({ nodeType: 1, tagName, childNodes, append(child) { this.childNodes.push(child); }, getAttribute() { return null; } });
  const text = nodeValue => ({ nodeType: 3, nodeValue });
  const sanitizer = { Node: { TEXT_NODE: 3, ELEMENT_NODE: 1 }, document: { createTextNode: text, createElement: tag => node(tag.toUpperCase()), createDocumentFragment: () => node('FRAGMENT') } };
  new Script(surat.slice(surat.indexOf('const safeTags ='), surat.indexOf('function selected('))).runInNewContext(sanitizer);
  const target = node('DIV');
  const unsafe = '<img src=x onerror=alert(1)>Jl. Test';
  sanitizer.cleanNode(text('{{alamat}} | {{fax}}'), target, { alamat: unsafe, fax: '{{total}}0215551234' });
  assert.equal(target.childNodes.length, 1);
  assert.equal(target.childNodes[0].nodeType, 3);
  assert.equal(target.childNodes[0].nodeValue, `${unsafe} | {{total}}0215551234`, 'Alamat dan fax hanya menjadi teks, tanpa HTML atau penggantian rekursif');
  console.log('Pelanggan: migrasi, kontak utama, tujuan snapshot, 4 kotak per pelanggan, contoh idempoten, pagination dan penyimpanan lulus.');
};
