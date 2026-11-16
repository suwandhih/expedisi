'use strict';
const origin = document.querySelector('#origin');
const destination = document.querySelector('#destination');
const mode = document.querySelector('#mode');
const { countries, vendors, adjustments } = window.RajaKirimData;
const money = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
function setRoute() {
  const isExport = document.querySelector('[name="direction"]:checked').value === 'ekspor';
  const options = countries.map((country) => `<option>${country}</option>`).join('');
  origin.innerHTML = isExport ? '<option>Indonesia</option>' : options;
  destination.innerHTML = isExport ? options : '<option>Indonesia</option>';
  origin.disabled = isExport;
  destination.disabled = !isExport;
}
function renderOffers() {
  const direction = document.querySelector('[name="direction"]:checked').value;
  const country = direction === 'ekspor' ? destination.value : origin.value;
  const adjustment = adjustments[country];
  const base = (mode.value === 'FCL' ? 2100 : mode.value === 'Udara' ? 720 : 820) + adjustment;
  const days = (mode.value === 'Udara' ? 6 : mode.value === 'FCL' ? 25 : 28) + (country === 'Amerika Serikat' ? 5 : 0);
  const offers = vendors.map((vendor) => ({ ...vendor, freight: base + vendor.adjustment, total: base + vendor.adjustment + vendor.local, transit: Math.max(1, days + vendor.days) })).sort((a, b) => a.total - b.total);
  document.querySelector('#summary').textContent = `${direction === 'ekspor' ? 'Ekspor' : 'Impor'} · ${origin.value} → ${destination.value} · ${mode.value === 'Udara' ? 'Udara' : 'Laut · ' + mode.value}`;
  document.querySelector('#count').textContent = `${offers.length} opsi`;
  document.querySelector('#offers').innerHTML = offers.map((offer, index) => `
    <article class="offer bc-card bc-card--raised">
      <div class="offer-tags">
        <span class="bc-badge ${mode.value === 'Udara' ? 'bc-badge--accent' : mode.value === 'LCL' ? 'bc-badge--primary' : 'bc-badge--muted'}">${mode.value === 'Udara' ? 'Udara' : 'Laut · ' + mode.value}</span>
        <span class="bc-badge ${index === 0 ? 'bc-badge--primary' : 'bc-badge--secondary'}">${offer.label}</span>
      </div>
      <div class="offer-heading">
        <div class="vendor-icon" aria-hidden="true">${offer.mark}</div>
        <div><h3>${mode.value === 'Udara' ? offer.air : offer.name}</h3><p>Vendor simulasi</p></div>
      </div>
      <p class="offer-route">${origin.value} → ${destination.value}</p>
      <div class="offer-data">
        <div><span>TOTAL ESTIMASI</span><strong class="price">${money(offer.total)}</strong></div>
        <div><span>ESTIMASI TRANSIT</span><strong>${offer.transit} hari</strong></div>
      </div>
      <details>
        <summary>Rincian biaya</summary>
        <div><span>Biaya pengiriman</span><strong>${money(offer.freight)}</strong></div>
        <div><span>Biaya lokal</span><strong>${money(offer.local)}</strong></div>
        <div><span>Total estimasi</span><strong>${money(offer.total)}</strong></div>
      </details>
    </article>`).join('');
}
document.querySelectorAll('[name="direction"]').forEach((input) => input.addEventListener('change', setRoute));
document.querySelector('#rate-form').addEventListener('submit', (event) => { event.preventDefault(); renderOffers(); });
setRoute();
renderOffers();
