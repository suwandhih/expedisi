'use strict';
const origin = document.querySelector('#origin');
const destination = document.querySelector('#destination');
const mode = document.querySelector('#mode');
const { countries, vendors, adjustments, kurs } = window.RajaKirimData;
const money = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
const rupiah = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
function setRoute() {
  const isExport = document.querySelector('[name="direction"]:checked').value === 'ekspor';
  const options = countries.map((country) => `<option>${country}</option>`).join('');
  origin.innerHTML = isExport ? '<option>Jakarta, Indonesia</option>' : options;
  destination.innerHTML = isExport ? options : '<option>Jakarta, Indonesia</option>';
  origin.disabled = isExport;
  destination.disabled = !isExport;
  document.querySelector('#origin-label').textContent = isExport ? 'Kota asal' : 'Negara asal';
  document.querySelector('#destination-label').textContent = isExport ? 'Negara tujuan' : 'Kota tujuan';
}
function renderOffers() {
  const direction = document.querySelector('[name="direction"]:checked').value;
  const country = direction === 'ekspor' ? destination.value : origin.value;
  const adjustment = adjustments[country];
  const base = (mode.value === 'FCL' ? 2100 : mode.value === 'Udara' ? 720 : 820) + adjustment;
  const days = (mode.value === 'Udara' ? 6 : mode.value === 'FCL' ? 25 : 28) + (country === 'Amerika Serikat' ? 5 : 0);
  const offers = vendors.map((vendor) => ({ ...vendor, freight: base + vendor.adjustment, total: base + vendor.adjustment + vendor.local, transit: Math.max(1, days + vendor.days) })).sort((a, b) => a.total - b.total);
  const route = direction === 'ekspor' ? `Jakarta → ${country}` : `${country} → Jakarta`;
  const highestTotal = Math.max(...offers.map((offer) => offer.total));
  document.querySelector('#summary').textContent = `${direction === 'ekspor' ? 'Ekspor' : 'Impor'} · ${route} · ${mode.value === 'Udara' ? 'Udara' : 'Laut · ' + mode.value}`;
  document.querySelector('#count').textContent = `${offers.length} alternatif ekspedisi`;
  document.querySelector('#results-note').textContent = `ⓘ Harga dalam USD, termasuk biaya lokal contoh. Perkiraan Rupiah memakai kurs contoh ${rupiah(kurs)} per USD. Estimasi transit dan tarif bukan penawaran aktual.`;
  document.querySelector('#offers').innerHTML = offers.map((offer, index) => `
    <article class="offer bc-card bc-card--raised${index === 0 ? ' offer--best' : ''}">
      <div class="offer-tags">
        <span class="bc-badge ${mode.value === 'Udara' ? 'bc-badge--accent' : mode.value === 'LCL' ? 'bc-badge--primary' : 'bc-badge--secondary'}">${mode.value === 'Udara' ? 'Udara' : 'Laut · ' + mode.value}</span>
        <span class="bc-badge ${index === 0 ? 'bc-badge--primary' : 'bc-badge--secondary'}">${offer.label}</span>
      </div>
      <div class="offer-heading">
        <div class="vendor-icon" aria-hidden="true">${offer.mark}</div>
        <div><h3>${mode.value === 'Udara' ? offer.air : offer.name}</h3><p>Vendor simulasi</p></div>
      </div>
      <p class="offer-route">${route}</p>
      <div class="offer-data">
        <div><span>TOTAL ESTIMASI</span><strong class="price">${money(offer.total)}</strong><small class="price-idr bc-muted">≈ ${rupiah(offer.total * kurs)}</small></div>
        <div><span>ESTIMASI TRANSIT</span><strong>${offer.transit} hari</strong></div>
      </div>
      <div class="offer-meter" aria-hidden="true"><span style="--offer-share: ${offer.total / highestTotal * 100}%"></span></div>
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
