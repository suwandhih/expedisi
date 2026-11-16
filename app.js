'use strict';
const $ = (selector) => document.querySelector(selector);
const money = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const vendors = [
  { name: 'Nusantara Ocean', air: 'Meridian Air Cargo', mark: 'NO', adjustment: 0, local: 180, days: 0, label: 'Harga terbaik' },
  { name: 'Pacific Bridge', air: 'Pacific Air Connect', mark: 'PB', adjustment: 185, local: 155, days: -2, label: 'Transit lebih cepat' },
  { name: 'Atlas Freight', air: 'Atlas Air Freight', mark: 'AF', adjustment: 295, local: 210, days: 2, label: 'Opsi fleksibel' }
];
let offers = [];
let shipments = [];
let map;
let mapReady = false;
let markers = [];
let mapFailed = false;
const themeButton = $('#theme-toggle');
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeButton.textContent = theme === 'dark' ? '☀' : '☾';
  themeButton.setAttribute('aria-label', theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap');
  try { localStorage.setItem('expedisi-theme', theme); } catch (_) { /* Theme still works for this session. */ }
}
let savedTheme;
try { savedTheme = localStorage.getItem('expedisi-theme'); } catch (_) { /* Storage may be unavailable. */ }
setTheme(savedTheme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
themeButton.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

function renderRates() {
  const origin = $('#origin').value;
  const destination = $('#destination').value;
  const mode = $('#mode').value;
  const origins = { Malaysia: 0, Singapura: 65, Tiongkok: 120, Vietnam: 85, Indonesia: 45 };
  const base = (mode === 'FCL' ? 2100 : mode === 'Udara' ? 720 : 820) + origins[origin] + (destination === 'Australia' ? -110 : 0);
  const days = (mode === 'Udara' ? 6 : mode === 'FCL' ? 25 : 28) + (destination === 'Australia' ? -4 : 0);
  offers = vendors.map((vendor) => ({ ...vendor, name: mode === 'Udara' ? vendor.air : vendor.name, base: base + vendor.adjustment, total: base + vendor.adjustment + vendor.local, days: Math.max(1, days + vendor.days), origin, destination, mode })).sort((a, b) => a.total - b.total);
  $('#route-summary').textContent = `${origin} → ${destination} · ${mode === 'Udara' ? 'Udara' : 'Laut · ' + mode} · Harga simulasi`;
  $('#result-count').textContent = `${offers.length} opsi`;
  $('#rate-results').innerHTML = offers.map((offer, index) => `<article class="rate-card"><div class="vendor"><div class="vendor-logo">${offer.mark}</div><div><h4>${offer.name}</h4><span>${offer.label} · Vendor simulasi</span></div></div><div class="rate-meta"><span>ESTIMASI TRANSIT</span><strong>${offer.days} hari</strong></div><div class="rate-price"><span>TOTAL ESTIMASI</span><strong>${money(offer.total)}</strong></div><button class="button secondary choose" data-index="${index}">Pilih &amp; Book <span>→</span></button><details class="rate-details"><summary>Rincian biaya</summary><div><span>Base freight</span><strong>${money(offer.base)}</strong></div><div><span>Local charges</span><strong>${money(offer.local)}</strong></div><div><span>Total estimasi</span><strong>${money(offer.total)}</strong></div><small>USD · Tarif dan waktu hanya simulasi; bukan penawaran aktual.</small></details></article>`).join('');
}
$('#rate-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const destination = $('#destination');
  destination.setCustomValidity($('#origin').value === destination.value ? 'Negara asal dan tujuan harus berbeda.' : '');
  if (!destination.reportValidity()) return;
  renderRates();
});
$('#origin').addEventListener('change', () => $('#destination').setCustomValidity(''));
$('#destination').addEventListener('change', () => $('#destination').setCustomValidity(''));
$('#rate-results').addEventListener('click', (event) => {
  const button = event.target.closest('.choose');
  if (!button) return;
  const offer = offers[Number(button.dataset.index)];
  $('#booking-content').innerHTML = `<div class="summary-route"><strong>${escapeHtml(offer.origin)}</strong><span>→</span><strong>${escapeHtml(offer.destination)}</strong></div><div class="detail-row"><span>Moda</span><strong>${escapeHtml(offer.mode)}</strong></div><div class="detail-row"><span>Vendor simulasi</span><strong>${escapeHtml(offer.name)}</strong></div><div class="detail-row"><span>Estimasi transit</span><strong>${offer.days} hari</strong></div><div class="detail-row"><span>Base freight</span><strong>${money(offer.base)}</strong></div><div class="detail-row"><span>Local charges</span><strong>${money(offer.local)}</strong></div><div class="detail-row total"><span>Total estimasi</span><strong>${money(offer.total)}</strong></div>`;
  $('#booking-dialog').showModal();
});
$('#close-dialog').addEventListener('click', () => $('#booking-dialog').close());
$('#confirm-booking').addEventListener('click', () => $('#booking-dialog').close());
renderRates();

function detailRow(label, value) { return `<div class="detail-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`; }
function renderShipment() {
  const s = shipments[Number($('#shipment-select').value)];
  if (!s) return;
  const latest = [...s.events].reverse().find((event) => !event.planned);
  $('#tracking-detail').innerHTML = `<div class="shipment-status"><span class="status-dot"></span><div><small>STATUS PENGIRIMAN</small><strong>${escapeHtml(s.status)}</strong></div><span class="badge">${escapeHtml(s.mode)}</span></div><div class="tracking-route"><div><small>ASAL</small><strong>${escapeHtml(s.origin)}</strong></div><span>→</span><div><small>TUJUAN</small><strong>${escapeHtml(s.destination)}</strong></div></div><div class="tracking-details">${detailRow(s.referenceType, s.reference)}${detailRow('Carrier', s.carrier)}${detailRow('Checkpoint terakhir', latest.place)}${detailRow('Koordinat terakhir', s.coordinates)}${detailRow('Pembaruan contoh', s.lastUpdate)}${detailRow('ETA', s.eta)}</div>`;
  $('#history').innerHTML = [...s.events].reverse().map((e) => `<div class="history-item ${e.planned ? 'planned' : ''}"><span class="history-dot"></span><div><strong>${escapeHtml(e.title)}</strong><p>${escapeHtml(e.place)}</p></div><time>${escapeHtml(e.time)}</time></div>`).join('');
  const steps = [
    ['01', 'Booking & quotation', `${s.origin} → ${s.destination}`, `${s.mode} · ${s.carrier} · ${money(s.invoice.base + s.invoice.local)}`, `Pengirim: ${s.sender} · Penerima: ${s.receiver}`, `Booking: ${s.bookingStatus}`],
    ['02', 'Dokumen & ekspor', 'Commercial invoice · packing list', s.mode.startsWith('Laut') ? 'Bill of Lading (B/L)' : 'Air Waybill (AWB)', `Bea cukai ekspor: ${s.customsExport}`],
    ['03', 'Pickup & transit', 'Penjemputan, pemuatan & keberangkatan', `Checkpoint terakhir: ${latest.place}`, `ETA: ${s.eta}`],
    ['04', 'Impor & last-mile', `Bea cukai impor: ${s.customsImport}`, `Bea / pajak: ${s.tax}`, `Last-mile: ${s.lastMile}`],
    ['05', 'Selesai & POD', s.pod ? `Diterima oleh ${s.pod.recipient}` : 'Menunggu penerimaan', s.pod ? s.pod.time : 'POD belum tersedia']
  ];
  $('#operations').innerHTML = steps.map((step) => `<article class="operation"><span class="operation-number">${step[0]}</span><h3>${escapeHtml(step[1])}</h3>${step.slice(2).map((line) => `<p>${escapeHtml(line)}</p>`).join('')}</article>`).join('');
  $('#documents').innerHTML = s.documents.map((d) => `<div><span>▧ &nbsp; ${escapeHtml(d.name)}</span><strong>${escapeHtml(d.status)}</strong></div>`).join('');
  $('#pod').innerHTML = s.pod ? `<div class="pod-box"><span class="badge">DITERIMA · SIMULASI</span>${detailRow('Penerima', s.pod.recipient)}${detailRow('Waktu', s.pod.time)}<div class="signature">${escapeHtml(s.pod.proof)}</div></div>` : '<div class="empty-state">◌<br><strong>Belum tersedia</strong><p>POD simulasi muncul setelah pengiriman contoh diterima. Pilih pengiriman udara untuk melihat contohnya.</p></div>';
  $('#invoice').innerHTML = `<div class="invoice-box">${detailRow('Base freight', money(s.invoice.base))}${detailRow('Local charges', money(s.invoice.local))}${detailRow('Total estimasi', money(s.invoice.base + s.invoice.local))}<div class="invoice-status">${escapeHtml(s.invoice.status)}</div></div>`;
  $('#claim-result').textContent = '';
  updateMap(s);
}
function updateMap(s) {
  if (!mapReady || !map) return;
  markers.forEach((marker) => marker.remove()); markers = [];
  const coordinates = [];
  s.events.forEach((event) => {
    const coord = [...event.coords];
    if (coordinates.length) {
      const prev = coordinates[coordinates.length - 1][0];
      while (coord[0] - prev > 180) coord[0] -= 360;
      while (coord[0] - prev < -180) coord[0] += 360;
    }
    coordinates.push(coord);
    const popup = new maplibregl.Popup({ offset: 16 }).setText(`${event.title} · ${event.place} · ${event.time} (simulasi)`);
    markers.push(new maplibregl.Marker({ color: event.planned ? '#9ba9a4' : '#087b65' }).setLngLat(coord).setPopup(popup).addTo(map));
  });
  const geojson = { type: 'Feature', geometry: { type: 'LineString', coordinates }, properties: {} };
  if (map.getSource('route')) map.getSource('route').setData(geojson);
  else {
    map.addSource('route', { type: 'geojson', data: geojson });
    map.addLayer({ id: 'route', type: 'line', source: 'route', paint: { 'line-color': '#087b65', 'line-width': 3, 'line-dasharray': [2, 2] } });
  }
  const bounds = coordinates.reduce((b, coord) => b.extend(coord), new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
  map.fitBounds(bounds, { padding: 55, maxZoom: 5, duration: 0 });
}
function initMap() {
  if (!window.maplibregl) { $('#map-status').textContent = 'Peta tidak tersedia. Periksa koneksi internet; riwayat simulasi tetap dapat dibaca di bawah.'; return; }
  try {
    map = new maplibregl.Map({ container: 'map', style: 'https://tiles.openfreemap.org/styles/liberty', center: [110, 5], zoom: 1.5 });
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.on('load', () => { mapReady = true; $('#map-status').hidden = true; updateMap(shipments[Number($('#shipment-select').value)]); });
    map.on('error', () => { if (!mapReady && !mapFailed) { mapFailed = true; $('#map-status').textContent = 'Peta tidak dapat dimuat. Periksa koneksi internet; riwayat simulasi tetap tersedia.'; } });
    setTimeout(() => { if (!mapReady) $('#map-status').textContent = 'Peta belum dapat dimuat. Periksa koneksi internet; riwayat simulasi tetap tersedia.'; }, 12000);
  } catch (_) { $('#map-status').textContent = 'Peta tidak tersedia. Periksa koneksi internet; riwayat simulasi tetap tersedia.'; }
}
$('#shipment-select').addEventListener('change', renderShipment);
$('#claim-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const description = $('#claim-description').value.trim();
  if (!description) { $('#claim-description').setCustomValidity('Isi keterangan contoh.'); $('#claim-description').reportValidity(); return; }
  $('#claim-result').textContent = `Klaim simulasi dicatat sementara · ${$('#claim-type').value} · Status: menunggu peninjauan. Tidak ada data yang dikirim atau disimpan.`;
});
$('#claim-description').addEventListener('input', () => $('#claim-description').setCustomValidity(''));
fetch('data.json?v=20261114-1').then((response) => { if (!response.ok) throw new Error('Data tidak tersedia'); return response.json(); }).then((data) => {
  shipments = data.shipments;
  $('#shipment-select').innerHTML = shipments.map((s, index) => `<option value="${index}">${escapeHtml(s.mode)} · ${escapeHtml(s.id)}</option>`).join('');
  renderShipment(); initMap();
}).catch(() => { $('#tracking-detail').textContent = 'Data contoh tidak dapat dimuat. Buka situs melalui server web dan muat ulang halaman.'; $('#map-status').textContent = 'Peta tidak tersedia tanpa data contoh.'; });
