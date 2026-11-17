'use strict';
const origin = document.querySelector('#origin');
const destination = document.querySelector('#destination');
const mode = document.querySelector('#mode');
const offersNode = document.querySelector('#offers');
const quotationButton = document.querySelector('#create-quotation');
const quotationStatus = document.querySelector('#quotation-status');
let lastComparison = null;
const { countries, vendors, adjustments, kurs } = window.RajaKirimData;
const money = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
const rupiah = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
function setRoute() {
  const isExport = document.querySelector('[name="direction"]:checked').value === 'ekspor';
  const options = countries.map((country) => `<option>${country}</option>`).join('');
  document.querySelector('#origin-label').textContent = isExport ? 'Kota asal' : 'Negara asal';
  document.querySelector('#destination-label').textContent = isExport ? 'Negara tujuan' : 'Kota tujuan';
  origin.innerHTML = isExport ? '<option>Jakarta, Indonesia</option>' : options;
  destination.innerHTML = isExport ? options : '<option>Jakarta, Indonesia</option>';
  origin.disabled = isExport;
  destination.disabled = !isExport;
}
function offerDifference(offer, index) {
  if (index === 0) return 'Harga terendah · pembanding';
  const cheapest = lastComparison.offers[0];
  const days = offer.transit - cheapest.transit;
  const transit = days === 0 ? 'transit sama' : `${Math.abs(days)} hari ${days < 0 ? 'lebih cepat' : 'lebih lama'}`;
  return `+${money(offer.total - cheapest.total)} dibanding termurah · ${transit}`;
}
function selectOffer(index, focus = false) {
  if (!lastComparison || !Number.isInteger(index) || index < 0 || index >= lastComparison.offers.length) return;
  lastComparison.selectedIndex = index;
  offersNode.querySelectorAll('.offer').forEach((card, cardIndex) => {
    const selected = cardIndex === index;
    const radio = card.querySelector('[name="offer"]');
    card.classList.toggle('offer--selected', selected);
    radio.checked = selected;
    radio.setAttribute('aria-checked', String(selected));
    radio.tabIndex = selected ? 0 : -1;
    card.querySelector('.offer-selection').hidden = !selected;
    if (selected && focus) radio.focus();
  });
  const { offers, route, mode: shipmentMode } = lastComparison;
  const offer = offers[index];
  const name = shipmentMode === 'Udara' ? offer.air : offer.name;
  const service = shipmentMode === 'Udara' ? 'Udara' : `Laut · ${shipmentMode}`;
  document.querySelector('#selection-summary').textContent = `Pilihan Anda: ${name} (simulasi) · ${route} · ${service} · ${money(offer.total)} (≈ ${rupiah(offer.total * kurs)}) · transit ${offer.transit} hari · ${offerDifference(offer, index)}`;
  quotationButton.setAttribute('aria-label', `Buat surat penawaran untuk ${name} · ${route}`);
  quotationStatus.textContent = '';
  quotationStatus.hidden = true;
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
  lastComparison = { offers, route, mode: mode.value, direction, country, selectedIndex: 0 };
  document.querySelector('#summary').textContent = `${direction === 'ekspor' ? 'Ekspor' : 'Impor'} · ${route} · ${mode.value === 'Udara' ? 'Udara' : 'Laut · ' + mode.value}`;
  document.querySelector('#count').textContent = `${offers.length} alternatif ekspedisi`;
  document.querySelector('#results-note').textContent = `ⓘ Harga dalam USD, termasuk biaya lokal contoh. Perkiraan Rupiah memakai kurs contoh ${rupiah(kurs)} per USD. Estimasi transit dan tarif bukan penawaran aktual.`;
  offersNode.innerHTML = offers.map((offer, index) => `
    <article class="offer bc-card bc-card--raised${index === 0 ? ' offer--best offer--selected' : ''}" data-offer-index="${index}">
      <div class="offer-tags">
        <span class="bc-badge ${mode.value === 'Udara' ? 'bc-badge--accent' : mode.value === 'LCL' ? 'bc-badge--primary' : 'bc-badge--secondary'}">${mode.value === 'Udara' ? 'Udara' : 'Laut · ' + mode.value}</span>
        <span class="bc-badge ${index === 0 ? 'bc-badge--primary' : 'bc-badge--secondary'}">${offer.label}</span>
        <span class="offer-selection bc-badge bc-badge--primary"${index === 0 ? '' : ' hidden'}>Terpilih</span>
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
      <p class="offer-difference" id="offer-difference-${index}">${offerDifference(offer, index)}</p>
      <div class="offer-benefits"><h4>Keunggulan contoh (simulasi)</h4><ul>${offer.keunggulan.map((benefit) => `<li>${benefit}</li>`).join('')}</ul></div>
      <label class="offer-choice-label" for="offer-${index}"><input class="offer-choice" type="radio" name="offer" id="offer-${index}" value="${index}" aria-describedby="offer-difference-${index}" aria-checked="${index === 0}" tabindex="${index === 0 ? 0 : -1}"${index === 0 ? ' checked' : ''}><span>Pilih ${mode.value === 'Udara' ? offer.air : offer.name}</span></label>
      <details>
        <summary>Rincian biaya</summary>
        <div><span>Biaya pengiriman</span><strong>${money(offer.freight)}</strong></div>
        <div><span>Biaya lokal</span><strong>${money(offer.local)}</strong></div>
        <div><span>Total estimasi</span><strong>${money(offer.total)}</strong></div>
      </details>
    </article>`).join('');
  selectOffer(0);
}
offersNode.addEventListener('click', (event) => {
  if (event.target.closest('details, summary')) return;
  const card = event.target.closest('.offer');
  if (card) selectOffer(Number(card.dataset.offerIndex), true);
});
offersNode.addEventListener('change', (event) => {
  if (event.target.matches('[name="offer"]')) selectOffer(Number(event.target.value));
});
offersNode.addEventListener('keydown', (event) => {
  if (!event.target.matches('[name="offer"]') || !['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) return;
  event.preventDefault();
  const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
  const count = lastComparison.offers.length;
  selectOffer((Number(event.target.value) + step + count) % count, true);
});
quotationButton.addEventListener('click', () => {
  let selected = null;
  if (lastComparison) {
    const { offers, selectedIndex, direction, country, mode: shipmentMode } = lastComparison;
    const offer = offers[selectedIndex];
    selected = { ...offer, direction, country, mode: shipmentMode, name: shipmentMode === 'Udara' ? offer.air : offer.name };
  }
  const saved = window.RajaKirimPenawaran.handoffComparison(selected);
  quotationStatus.textContent = saved.message;
  quotationStatus.hidden = saved.saved;
});
document.querySelectorAll('[name="direction"]').forEach((input) => input.addEventListener('change', setRoute));
document.querySelector('#rate-form').addEventListener('submit', (event) => { event.preventDefault(); renderOffers(); });
setRoute();
renderOffers();
