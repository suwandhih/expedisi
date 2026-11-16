'use strict';

const customers = [
  { id: 'ayu', nama: 'Ayu Lestari', perusahaan: 'PT Nusantara Rasa', nomor: 'RK-2026-001', tanggal: '16 November 2026', rute: 'Jakarta → Surabaya', layanan: 'Regular', berat: '25 kg', total: 'Rp 375.000' },
  { id: 'budi', nama: 'Budi Santoso', perusahaan: 'CV Maju Bersama', nomor: 'RK-2026-002', tanggal: '15 November 2026', rute: 'Bandung → Semarang', layanan: 'Express', berat: '12 kg', total: 'Rp 288.000' },
  { id: 'citra', nama: 'Citra Dewi', perusahaan: 'Toko Bunga Citra', nomor: 'RK-2026-003', tanggal: '14 November 2026', rute: 'Yogyakarta → Denpasar', layanan: 'Cargo', berat: '40 kg', total: 'Rp 640.000' }
];
const defaults = {
  quotation: '<p>Kepada Yth. {{nama}}<br>{{perusahaan}}</p><p>Terima kasih atas kepercayaan Anda. Berikut penawaran pengiriman dari Raja Kirim:</p><p>Nomor penawaran: <b>{{nomor}}</b><br>Tanggal: {{tanggal}}<br>Rute: {{rute}}<br>Layanan: {{layanan}}<br>Berat: {{berat}}<br>Total penawaran: <b>{{total}}</b></p><p>Penawaran ini merupakan contoh simulasi dan bukan transaksi sebenarnya.</p><p>Hormat kami,<br>Tim Raja Kirim</p>',
  receipt: '<p><b>TANDA TERIMA</b></p><p>Telah diterima dari {{nama}} ({{perusahaan}}) untuk transaksi berikut:</p><p>Nomor: <b>{{nomor}}</b><br>Tanggal: {{tanggal}}<br>Rute: {{rute}}<br>Layanan: {{layanan}}<br>Berat: {{berat}}<br>Jumlah: <b>{{total}}</b></p><p>Dokumen ini hanya contoh simulasi, bukan bukti pembayaran yang sah.</p><p>Terima kasih,<br>Tim Raja Kirim</p>'
};
const templates = { ...defaults };
const history = [
  { customer: 'ayu', direction: 'incoming', channel: 'Email', subject: 'Permintaan penawaran pengiriman', body: 'Mohon informasi biaya pengiriman Jakarta ke Surabaya.', date: '16 Nov 2026' },
  { customer: 'budi', direction: 'outgoing', channel: 'WhatsApp', subject: 'Konfirmasi pengiriman', body: 'Pengiriman Anda sedang kami siapkan. Terima kasih!', date: '15 Nov 2026' },
  { customer: 'citra', direction: 'incoming', channel: 'Email', subject: 'Informasi layanan kargo', body: 'Apakah tersedia layanan kargo ke Denpasar?', date: '14 Nov 2026' },
  { customer: 'ayu', direction: 'outgoing', channel: 'Email', subject: 'Penawaran pengiriman', body: 'Berikut contoh penawaran pengiriman Anda.', date: '16 Nov 2026' },
  { customer: 'ayu', direction: 'incoming', channel: 'WhatsApp', subject: 'Pertanyaan pengiriman', body: 'Kapan paket dapat dikirim?', date: '16 Nov 2026' },
  { customer: 'ayu', direction: 'outgoing', channel: 'WhatsApp', subject: 'Jadwal pengiriman', body: 'Paket dijadwalkan dikirim besok.', date: '16 Nov 2026' }
];
const $ = id => document.getElementById(id);
const storageKey = 'raja-kirim-surat-v1';
const contactFields = ['alamat', 'email1', 'email2', 'phone1', 'phone2'];
const sampleContacts = {
  ayu: { alamat: 'Jl. Contoh No. 10, Jakarta', email1: 'ayu@example.test', email2: 'kantor@example.test', phone1: '0812 0000 1001', phone2: '0812 0000 1002' },
  budi: { alamat: 'Jl. Contoh No. 20, Bandung', email1: 'budi@example.test', email2: '', phone1: '0812 0000 2001', phone2: '' },
  citra: { alamat: 'Jl. Contoh No. 30, Yogyakarta', email1: 'citra@example.test', email2: '', phone1: '0812 0000 3001', phone2: '' }
};
customers.forEach(customer => Object.assign(customer, sampleContacts[customer.id]));
try {
  const saved = localStorage.getItem(storageKey);
  if (saved !== null) {
    const data = JSON.parse(saved);
    const stringFields = ['id', 'nama', 'perusahaan', 'nomor', 'tanggal', 'rute', 'layanan', 'berat', 'total', ...contactFields];
    if (!data || !Array.isArray(data.customers) || !Array.isArray(data.history) ||
        !data.customers.every(c => c && stringFields.every(field => typeof c[field] === 'string') && c.id && c.nama && c.perusahaan) ||
        new Set(data.customers.map(c => c.id)).size !== data.customers.length ||
        !data.history.every(item => item && ['customer', 'subject', 'body', 'date'].every(field => typeof item[field] === 'string') && ['incoming', 'outgoing'].includes(item.direction) && ['Email', 'WhatsApp'].includes(item.channel) && data.customers.some(c => c.id === item.customer))) throw new Error('Invalid stored data');
    customers.splice(0, customers.length, ...data.customers);
    history.splice(0, history.length, ...data.history);
  }
} catch (error) {
  $('storage-status').textContent = 'Penyimpanan tidak dapat dibaca; data contoh digunakan. Perubahan mungkin tidak tersimpan.';
}
function saveData() {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ customers, history }));
    $('storage-status').textContent = '';
    return true;
  } catch (error) {
    $('storage-status').textContent = 'Penyimpanan browser tidak tersedia atau penuh; perubahan hanya berlaku selama halaman terbuka.';
    return false;
  }
}
const safeTags = new Set(['P', 'DIV', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'MARK']);

// Copy only formatting elements and text; never retain user-supplied attributes or active content.
function cleanNode(node, target, replacements = {}) {
  if (node.nodeType === Node.TEXT_NODE) {
    target.append(document.createTextNode(node.nodeValue.replace(/\{\{(nama|perusahaan|nomor|tanggal|rute|layanan|berat|total)\}\}/g, (match, key) => replacements[key] ?? match)));
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'SVG', 'IMG'].includes(node.tagName)) return;
    let destination = target;
    if (safeTags.has(node.tagName)) {
      destination = document.createElement(node.tagName.toLowerCase());
      target.append(destination);
    } else if (node.tagName === 'SPAN' && /background(-color)?\s*:/i.test(node.getAttribute('style') || '')) {
      destination = document.createElement('mark');
      target.append(destination);
    }
    node.childNodes.forEach(child => cleanNode(child, destination, replacements));
  }
}
function sanitized(source, replacements = {}) {
  const fragment = document.createDocumentFragment();
  source.childNodes.forEach(node => cleanNode(node, fragment, replacements));
  return fragment;
}
function safeHTML(source) {
  const container = document.createElement('div');
  container.append(sanitized(source));
  return container.innerHTML;
}
function selected(container) {
  return [...container.querySelectorAll('input:checked')].map(input => customers.find(c => c.id === input.value)).filter(Boolean);
}
function refreshCustomerOptions(initial = false) {
  ['mail-customers', 'doc-customers'].forEach(id => {
    const container = $(id);
    const checked = new Set([...container.querySelectorAll('input:checked')].map(input => input.value));
    container.replaceChildren();
    customers.forEach((customer, index) => {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'checkbox'; input.value = customer.id; input.checked = initial ? index === 0 : checked.has(customer.id);
      label.append(input, document.createTextNode(customer.nama));
      container.append(label);
    });
  });
  const filter = $('history-filter');
  const value = filter.value;
  filter.replaceChildren(new Option('Semua pelanggan', 'all'));
  customers.forEach(customer => filter.add(new Option(customer.nama, customer.id)));
  filter.value = customers.some(c => c.id === value) ? value : 'all';
}
refreshCustomerOptions(true);

const commands = [
  { command: 'bold', label: 'Tebal', text: 'B' },
  { command: 'italic', label: 'Miring', text: 'I' },
  { command: 'insertUnorderedList', label: 'Daftar berpoin', text: '• ≡' },
  { command: 'insertOrderedList', label: 'Daftar bernomor', text: '1. ≡' },
  { command: 'hiliteColor', label: 'Sorot teks', text: '▰' }
];
document.querySelectorAll('.toolbar').forEach(toolbar => {
  const editor = $(toolbar.dataset.editor);
  commands.forEach(({ command, label, text }) => {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = text; button.title = label; button.setAttribute('aria-label', label);
    if (command === 'italic') button.style.fontStyle = 'italic';
    // Preserve the editor selection when activating a toolbar button with a pointer.
    button.addEventListener('mousedown', event => event.preventDefault());
    button.addEventListener('click', () => {
      editor.focus();
      document.execCommand(command, false, command === 'hiliteColor' ? '#fff09a' : null);
      editor.dispatchEvent(new Event('input', { bubbles: true }));
    });
    toolbar.append(button);
  });
  editor.addEventListener('paste', event => {
    event.preventDefault();
    document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
  });
  editor.addEventListener('drop', event => event.preventDefault());
});

function activateTab(tab) {
  document.querySelectorAll('[role=tab]').forEach(item => {
    const active = item === tab;
    item.classList.toggle('active', active); item.setAttribute('aria-selected', String(active));
    $(item.getAttribute('aria-controls')).hidden = !active;
  });
}
document.querySelectorAll('[role=tab]').forEach(tab => tab.addEventListener('click', () => {
  activateTab(tab);
  if (tab.id === 'tab-customers') {
    if (location.hash !== '#pelanggan') location.hash = 'pelanggan';
  } else if (location.hash === '#pelanggan') {
    historyReplaceWithoutHash();
  }
}));
function historyReplaceWithoutHash() {
  window.history.replaceState(null, '', location.pathname + location.search);
}
function activateHashTab() {
  if (location.hash === '#pelanggan') activateTab($('tab-customers'));
  else activateTab($('tab-mail'));
}
window.addEventListener('hashchange', activateHashTab);
if (location.hash === '#pelanggan') activateHashTab();

let direction = 'all';
function renderHistory() {
  const list = $('history-list'); list.replaceChildren();
  const entries = history.filter(item => (direction === 'all' || item.direction === direction) && ($('history-filter').value === 'all' || item.customer === $('history-filter').value));
  $('history-count').textContent = String(entries.length);
  appendHistory(list, entries);
}
function appendHistory(list, entries) {
  if (!entries.length) { const empty = document.createElement('p'); empty.className = 'empty'; empty.textContent = 'Belum ada surat untuk pelanggan atau filter ini.'; list.append(empty); return; }
  entries.forEach(item => {
    const customer = customers.find(c => c.id === item.customer);
    const article = document.createElement('article'); article.className = 'history-item';
    const top = document.createElement('div'); top.className = 'history-top';
    const badge = document.createElement('span'); badge.className = `direction ${item.direction}`; badge.textContent = item.direction === 'incoming' ? '↓ Masuk' : '↑ Keluar';
    const time = document.createElement('time'); time.textContent = item.date;
    top.append(badge, time);
    const title = document.createElement('h4'); title.textContent = item.subject;
    const meta = document.createElement('p'); meta.textContent = `${customer.nama} · ${customer.perusahaan} · ${item.channel} (simulasi)`;
    const body = document.createElement('p'); body.className = 'history-message'; body.textContent = item.body;
    article.append(top, title, meta, body); list.append(article);
  });
}
$('history-filter').addEventListener('change', renderHistory);
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  direction = button.dataset.direction;
  document.querySelectorAll('.filter').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
  renderHistory();
}));
renderHistory();
function setStatus(element, message, error = false) { element.textContent = message; element.classList.toggle('error', error); }
function validateMail() {
  if (!selected($('mail-customers')).length) return 'Pilih setidaknya satu pelanggan.';
  if (!$('mail-subject').value.trim()) return 'Isi subjek pesan.';
  if (!$('mail-body').innerText.trim()) return 'Isi pesan terlebih dahulu.';
  return '';
}
function renderMailPreview() {
  const error = validateMail();
  if (error) { setStatus($('mail-status'), error, true); $('mail-preview').hidden = true; return false; }
  setStatus($('mail-status'), 'Pratinjau saja — pesan tidak akan dikirim.');
  const content = $('mail-preview-content'); content.replaceChildren();
  const channel = document.querySelector('input[name=channel]:checked').value;
  const mailDirection = document.querySelector('input[name=mail-direction]:checked').value;
  selected($('mail-customers')).forEach(customer => {
    const card = document.createElement('div'); card.className = 'message-preview';
    const recipient = document.createElement('p'); recipient.textContent = `${mailDirection === 'incoming' ? 'Dari' : 'Kepada'}: ${customer.nama} · ${customer.perusahaan} | ${channel} simulasi`;
    const subject = document.createElement('p'); subject.textContent = `Subjek: ${$('mail-subject').value.trim()}`;
    const body = document.createElement('div'); body.className = 'rich-content'; body.append(sanitized($('mail-body'), customer));
    card.append(recipient, subject, body); content.append(card);
  });
  $('mail-preview').hidden = false; return true;
}
$('preview-mail').addEventListener('click', renderMailPreview);
$('record-mail').addEventListener('click', () => {
  if (!renderMailPreview()) return;
  const channel = document.querySelector('input[name=channel]:checked').value;
  const mailDirection = document.querySelector('input[name=mail-direction]:checked').value;
  const date = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date());
  selected($('mail-customers')).forEach(customer => {
    const body = document.createElement('div'); body.append(sanitized($('mail-body'), customer));
    history.unshift({ customer: customer.id, direction: mailDirection, channel, subject: $('mail-subject').value.trim(), body: body.innerText || body.textContent, date });
  });
  const saved = saveData();
  renderHistory(); renderCustomerDetail(); setStatus($('mail-status'), saved ? 'Simulasi dicatat di browser ini. Tidak ada pesan yang dikirim.' : 'Simulasi dicatat sementara, tetapi tidak dapat disimpan. Tidak ada pesan yang dikirim.', !saved);
});
// Avoid showing stale previews after changes.
['mail-customers', 'mail-subject', 'mail-body'].forEach(id => $(id).addEventListener('input', () => { $('mail-preview').hidden = true; setStatus($('mail-status'), ''); }));
document.querySelectorAll('input[name=channel], input[name=mail-direction]').forEach(input => input.addEventListener('change', () => { $('mail-preview').hidden = true; setStatus($('mail-status'), ''); }));

let selectedCustomerId = customers[0]?.id;
let editingCustomerId = null;
const customerInputs = { nama: 'customer-name', perusahaan: 'customer-company', alamat: 'customer-address', email1: 'customer-email1', email2: 'customer-email2', phone1: 'customer-phone1', phone2: 'customer-phone2' };
function renderCustomerDetail() {
  const detail = $('customer-detail'); detail.replaceChildren();
  const customer = customers.find(c => c.id === selectedCustomerId);
  if (!customer) return;
  const heading = document.createElement('div'); heading.className = 'customer-detail-heading';
  const name = document.createElement('h4'); name.textContent = `${customer.nama} · ${customer.perusahaan}`;
  const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'button secondary'; edit.textContent = 'Edit pelanggan';
  edit.addEventListener('click', () => {
    editingCustomerId = customer.id;
    Object.entries(customerInputs).forEach(([field, id]) => { $(id).value = customer[field] || ''; });
    $('customer-form-title').textContent = 'Edit pelanggan'; $('cancel-customer').hidden = false;
    setStatus($('customer-status'), ''); $('customer-name').focus();
  });
  heading.append(name, edit); detail.append(heading);
  const info = document.createElement('dl'); info.className = 'customer-info';
  [['Alamat', customer.alamat], ['Email 1', customer.email1], ['Email 2', customer.email2], ['Telepon 1', customer.phone1], ['Telepon 2', customer.phone2]].forEach(([label, value]) => {
    const dt = document.createElement('dt'); dt.textContent = label;
    const dd = document.createElement('dd'); dd.textContent = value || '—'; info.append(dt, dd);
  });
  const historyTitle = document.createElement('h4'); historyTitle.textContent = 'Riwayat simulasi';
  const list = document.createElement('div'); list.className = 'history-list';
  appendHistory(list, history.filter(item => item.customer === customer.id));
  detail.append(info, historyTitle, list);
}
function renderCustomerList() {
  const list = $('customer-list'); list.replaceChildren();
  $('customer-count').textContent = String(customers.length);
  customers.forEach(customer => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'customer-choice';
    button.textContent = `${customer.nama} · ${customer.perusahaan}`;
    button.setAttribute('aria-pressed', String(customer.id === selectedCustomerId));
    button.addEventListener('click', () => { selectedCustomerId = customer.id; renderCustomerList(); });
    list.append(button);
  });
  renderCustomerDetail();
}
function resetCustomerForm() {
  editingCustomerId = null; $('customer-form').reset(); $('customer-form-title').textContent = 'Tambah pelanggan'; $('cancel-customer').hidden = true;
}
$('cancel-customer').addEventListener('click', () => { resetCustomerForm(); setStatus($('customer-status'), ''); });
$('customer-form').addEventListener('submit', event => {
  event.preventDefault();
  const values = Object.fromEntries(Object.entries(customerInputs).map(([field, id]) => [field, $(id).value.trim()]));
  if (!values.nama || !values.perusahaan) { setStatus($('customer-status'), 'Isi nama PIC dan perusahaan.', true); return; }
  let customer = customers.find(c => c.id === editingCustomerId);
  if (customer) Object.assign(customer, values);
  else {
    let id;
    do { id = `customer-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`; } while (customers.some(c => c.id === id));
    customer = { id, ...values, nomor: 'Contoh nomor', tanggal: 'Contoh tanggal', rute: 'Contoh rute', layanan: 'Contoh layanan', berat: 'Contoh berat', total: 'Contoh total' };
    customers.push(customer);
  }
  selectedCustomerId = customer.id;
  const saved = saveData();
  resetCustomerForm(); refreshCustomerOptions(); renderHistory(); renderCustomerList(); renderDocuments();
  $('mail-preview').hidden = true;
  setStatus($('customer-status'), saved ? 'Data pelanggan disimpan di browser ini.' : 'Data pelanggan hanya tersimpan sementara.', !saved);
});
renderCustomerList();

let currentType = 'quotation';
$('template-editor').innerHTML = defaults[currentType];
function renderDocuments() {
  const container = $('doc-previews'); container.replaceChildren();
  const chosen = selected($('doc-customers'));
  if (!chosen.length) { const empty = document.createElement('p'); empty.className = 'empty'; empty.textContent = 'Pilih setidaknya satu pelanggan untuk melihat dokumen.'; container.append(empty); return; }
  chosen.forEach(customer => {
    const sheet = document.createElement('article'); sheet.className = 'document-sheet';
    const top = document.createElement('div'); top.className = 'sheet-top';
    const brand = document.createElement('strong'); brand.textContent = '✦ Raja Kirim';
    const label = document.createElement('span'); label.textContent = `${currentType === 'quotation' ? 'QUOTATION · PDF' : 'TANDA TERIMA · PNG'}\nSIMULASI`; label.style.whiteSpace = 'pre-line';
    top.append(brand, label);
    const content = document.createElement('div'); content.className = 'rich-content'; content.append(sanitized($('template-editor'), customer));
    const actions = document.createElement('div'); actions.className = 'sheet-actions';
    const button = document.createElement('button'); button.type = 'button'; button.className = 'button secondary';
    button.textContent = currentType === 'quotation' ? 'Cetak / simpan PDF' : 'Unduh PNG';
    button.setAttribute('aria-label', `${button.textContent} untuk ${customer.nama}`);
    button.addEventListener('click', () => currentType === 'quotation' ? exportPDF(customer, content) : exportPNG(customer, content));
    actions.append(button); sheet.append(top, content, actions); container.append(sheet);
  });
}
$('document-type').addEventListener('change', event => {
  templates[currentType] = safeHTML($('template-editor'));
  currentType = event.target.value; $('template-editor').innerHTML = templates[currentType];
  setStatus($('doc-status'), ''); renderDocuments();
});
$('template-editor').addEventListener('input', renderDocuments);
$('doc-customers').addEventListener('change', renderDocuments);
$('reset-template').addEventListener('click', () => { templates[currentType] = defaults[currentType]; $('template-editor').innerHTML = defaults[currentType]; setStatus($('doc-status'), 'Template dikembalikan ke contoh awal.'); renderDocuments(); });
renderDocuments();

function exportPDF(customer, content) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) { setStatus($('doc-status'), 'Jendela cetak diblokir. Izinkan pop-up untuk menyimpan PDF.', true); return; }
  const doc = printWindow.document;
  doc.title = `Quotation ${customer.nama} - Simulasi`;
  const style = doc.createElement('style');
  style.textContent = 'body{font-family:Arial,sans-serif;color:#20352f;max-width:720px;margin:48px auto;padding:0 24px;line-height:1.6}header{color:#137c68;border-bottom:2px solid #137c68;padding-bottom:18px;margin-bottom:25px;font-weight:bold}small{display:block;color:#666;margin-top:6px}p{margin:0 0 14px}mark{background:#fff09a}@media print{body{margin:0;padding:0}}';
  doc.head.append(style);
  const header = doc.createElement('header'); header.textContent = 'RAJA KIRIM · QUOTATION';
  const note = doc.createElement('small'); note.textContent = 'DOKUMEN SIMULASI — BUKAN TRANSAKSI SEBENARNYA'; header.append(note);
  const body = doc.createElement('main'); body.append(content.cloneNode(true));
  doc.body.append(header, body);
  printWindow.focus(); printWindow.print();
  setStatus($('doc-status'), 'Pilih “Simpan sebagai PDF” pada dialog cetak.');
}
function exportPNG(customer, content) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) { setStatus($('doc-status'), 'Gagal membuat gambar di browser ini.', true); return; }
  const width = 1000, margin = 70, lineHeight = 34;
  context.font = '22px Arial';
  // innerText preserves visible line breaks from paragraphs and lists.
  const paragraphs = (content.innerText || content.textContent).replace(/\r/g, '').split('\n');
  const lines = [];
  paragraphs.forEach(paragraph => {
    if (!paragraph.trim()) { lines.push(''); return; }
    let line = '';
    for (const word of paragraph.split(/\s+/)) {
      const test = line ? `${line} ${word}` : word;
      if (context.measureText(test).width > width - margin * 2 && line) { lines.push(line); line = word; } else line = test;
      // Break exceptionally long words so they remain visible.
      while (context.measureText(line).width > width - margin * 2) {
        let part = '';
        for (const char of line) { if (context.measureText(part + char).width > width - margin * 2) break; part += char; }
        if (!part) break;
        lines.push(part); line = line.slice(part.length);
      }
    }
    lines.push(line);
  });
  canvas.width = width; canvas.height = Math.max(420, 220 + lines.length * lineHeight);
  context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#137c68'; context.font = 'bold 30px Arial'; context.fillText('RAJA KIRIM · TANDA TERIMA', margin, 70);
  context.font = '16px Arial'; context.fillText('DOKUMEN SIMULASI — BUKAN BUKTI PEMBAYARAN SAH', margin, 105);
  context.fillRect(margin, 128, width - margin * 2, 2);
  context.fillStyle = '#20352f'; context.font = '22px Arial';
  lines.forEach((line, index) => context.fillText(line, margin, 180 + index * lineHeight));
  try {
    const link = document.createElement('a'); link.download = `tanda-terima-${customer.id}-simulasi.png`; link.href = canvas.toDataURL('image/png'); link.click();
    setStatus($('doc-status'), `PNG simulasi untuk ${customer.nama} diunduh.`);
  } catch (error) { setStatus($('doc-status'), 'Gagal mengunduh PNG. Coba kurangi isi template.', true); }
}
