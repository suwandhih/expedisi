'use strict';
const origin = document.querySelector('#origin');
const destination = document.querySelector('#destination');
const mode = document.querySelector('#mode');
const countries = ['Singapura', 'Malaysia', 'Tiongkok', 'Vietnam', 'Australia', 'Amerika Serikat'];
const vendors = [
  { name: 'Nusantara Ocean', air: 'Meridian Air Cargo', mark: 'NO', adjustment: 0, local: 180, days: 0, label: 'Harga terendah' },
  { name: 'Pacific Bridge', air: 'Pacific Air Connect', mark: 'PB', adjustment: 185, local: 155, days: -2, label: 'Transit lebih cepat' },
  { name: 'Atlas Freight', air: 'Atlas Air Freight', mark: 'AF', adjustment: 295, local: 210, days: 2, label: 'Opsi fleksibel' }
];
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
  const adjustment = { Singapura: 0, Malaysia: 35, Tiongkok: 120, Vietnam: 85, Australia: 150, 'Amerika Serikat': 380 }[country];
  const base = (mode.value === 'FCL' ? 2100 : mode.value === 'Udara' ? 720 : 820) + adjustment;
  const days = (mode.value === 'Udara' ? 6 : mode.value === 'FCL' ? 25 : 28) + (country === 'Amerika Serikat' ? 5 : 0);
  const offers = vendors.map((vendor) => ({ ...vendor, freight: base + vendor.adjustment, total: base + vendor.adjustment + vendor.local, transit: Math.max(1, days + vendor.days) })).sort((a, b) => a.total - b.total);
  document.querySelector('#summary').textContent = `${direction === 'ekspor' ? 'Ekspor' : 'Impor'} · ${origin.value} → ${destination.value} · ${mode.value === 'Udara' ? 'Udara' : 'Laut · ' + mode.value}`;
  document.querySelector('#count').textContent = `${offers.length} opsi`;
  document.querySelector('#offers').innerHTML = offers.map((offer, index) => `<article class="offer"><div class="offer-heading"><div class="vendor-icon">${offer.mark}</div><div><h3>${mode.value === 'Udara' ? offer.air : offer.name}</h3><p>Vendor simulasi</p></div><span class="offer-tag ${index === 0 ? 'best' : ''}">${offer.label}</span></div><div class="offer-data"><div><span>ESTIMASI TRANSIT</span><strong>${offer.transit} hari</strong></div><div><span>TOTAL ESTIMASI</span><strong class="price">${money(offer.total)}</strong></div></div><details><summary>Rincian biaya <span>⌄</span></summary><div><span>Biaya pengiriman</span><strong>${money(offer.freight)}</strong></div><div><span>Biaya lokal</span><strong>${money(offer.local)}</strong></div><div><span>Total estimasi</span><strong>${money(offer.total)}</strong></div></details></article>`).join('');
}
document.querySelectorAll('[name="direction"]').forEach((input) => input.addEventListener('change', setRoute));
document.querySelector('#rate-form').addEventListener('submit', (event) => { event.preventDefault(); renderOffers(); });
setRoute();
renderOffers();
