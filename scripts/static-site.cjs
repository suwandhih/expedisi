'use strict';

// Build/check tooling only. The application remains plain browser JavaScript.
const assert = require('node:assert/strict');
const { copyFileSync, mkdirSync, readFileSync } = require('node:fs');
const path = require('node:path');
const { Script } = require('node:vm');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const files = [
  'index.html',
  'styles.css',
  'app.js',
  'data.json',
  'raja-kirim/index.html',
  'raja-kirim/harga.css',
  'raja-kirim/harga.js',
  'raja-kirim/surat.html',
  'raja-kirim/surat.css',
  'raja-kirim/surat.js'
];

function localTarget(file, reference) {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(reference)) return null;
  const target = new URL(reference, `https://static.invalid/${file}`);
  const relative = decodeURIComponent(target.pathname).slice(1);
  assert(files.includes(relative), `${file}: referensi di luar berkas situs: ${reference}`);
  return { file: relative, hash: target.hash };
}

function check() {
  const serverConfig = JSON.parse(readFileSync(path.join(root, 'serve.json'), 'utf8'));
  assert.equal(serverConfig.directoryListing, false, 'Daftar direktori harus dinonaktifkan');
  assert.notEqual(serverConfig.cleanUrls, false, 'Resolusi halaman indeks server harus tetap aktif');
  const sources = new Map(files.map((file) => [file, readFileSync(path.join(root, file), 'utf8')]));
  let references = 0;
  for (const [file, source] of sources) {
    if (file.endsWith('.js')) new Script(source, { filename: file });
    if (file.endsWith('.html')) {
      assert.match(source, /<!doctype html>/i, `${file}: doctype HTML tidak tersedia`);
      assert.match(source, /<html\b[^>]*lang="id"/i, `${file}: bahasa halaman harus dipertahankan`);
      const ids = [...source.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
      assert.equal(new Set(ids).size, ids.length, `${file}: ID HTML duplikat`);
      for (const match of source.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
        const target = localTarget(file, match[1]);
        if (!target) {
          if (match[1].startsWith('#')) {
            assert(ids.includes(match[1].slice(1)), `${file}: tautan bagian tidak ditemukan: ${match[1]}`);
          }
          continue;
        }
        references += 1;
        if (target.hash) {
          const customerTab = target.file === 'raja-kirim/surat.html' && target.hash === '#pelanggan'
            && sources.get('raja-kirim/surat.js').includes("location.hash === '#pelanggan'");
          assert(customerTab || sources.get(target.file).includes(`id="${target.hash.slice(1)}"`), `${file}: bagian tujuan tidak ditemukan`);
        }
      }
    }
    if (file.endsWith('.css')) {
      for (const match of source.matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g)) localTarget(file, match[1]);
    }
  }
  const data = JSON.parse(sources.get('data.json'));
  assert(Array.isArray(data.shipments) && data.shipments.length > 0, 'Data pengiriman contoh tidak tersedia');
  const shipmentIds = new Set();
  for (const shipment of data.shipments) {
    for (const field of ['id', 'referenceType', 'reference', 'mode', 'carrier', 'origin', 'destination', 'status', 'lastUpdate', 'eta', 'coordinates', 'sender', 'receiver', 'bookingStatus', 'customsExport', 'customsImport', 'tax', 'lastMile']) {
      assert.equal(typeof shipment[field], 'string', `Data pengiriman: ${field} tidak valid`);
    }
    assert(!shipmentIds.has(shipment.id), 'ID pengiriman duplikat');
    shipmentIds.add(shipment.id);
    assert(Array.isArray(shipment.events) && shipment.events.some((event) => !event.planned), 'Checkpoint aktual contoh tidak tersedia');
    for (const event of shipment.events) {
      for (const field of ['title', 'place', 'time']) assert.equal(typeof event[field], 'string', `Checkpoint: ${field} tidak valid`);
      assert(Array.isArray(event.coords) && event.coords.length === 2 && event.coords.every(Number.isFinite), 'Koordinat checkpoint tidak valid');
      assert(Math.abs(event.coords[0]) <= 180 && Math.abs(event.coords[1]) <= 90, 'Koordinat di luar batas');
    }
    assert(Array.isArray(shipment.documents), 'Daftar dokumen tidak valid');
    for (const document of shipment.documents) {
      assert.equal(typeof document.name, 'string');
      assert.equal(typeof document.status, 'string');
    }
    for (const field of ['base', 'local']) assert(Number.isFinite(shipment.invoice[field]) && shipment.invoice[field] >= 0, 'Biaya contoh tidak valid');
    assert.equal(typeof shipment.invoice.status, 'string');
    if (shipment.pod !== null) {
      for (const field of ['recipient', 'time', 'proof']) assert.equal(typeof shipment.pod[field], 'string');
    }
  }
  assert.match(sources.get('app.js'), /fetch\('data\.json(?:\?[^']*)?'\)/, 'Lokasi pemuatan data contoh berubah');
  console.log(`OK: 3 halaman HTML, 3 skrip JavaScript, ${references} referensi lokal, ${data.shipments.length} pengiriman contoh.`);
}

function build() {
  check();
  for (const file of files) {
    const target = path.join(output, file);
    mkdirSync(path.dirname(target), { recursive: true });
    copyFileSync(path.join(root, file), target);
  }
  console.log(`OK: ${files.length} berkas statis disiapkan di dist/; tanpa backend atau kompilasi frontend.`);
}

async function verifyHttp(address) {
  assert(address, 'Masukkan alamat Preview sebagai argumen');
  const base = new URL(address);
  assert(['http:', 'https:'].includes(base.protocol), 'Alamat harus HTTP atau HTTPS');
  base.pathname = base.pathname.replace(/\/?$/, '/');
  for (const file of files) {
    const requestPath = file.endsWith('index.html') ? file.slice(0, -10) || './' : file;
    const response = await fetch(new URL(requestPath, base), { signal: AbortSignal.timeout(20000) });
    assert.equal(response.status, 200, `${file}: HTTP ${response.status}`);
    const body = await response.text();
    const expected = readFileSync(path.join(output, file), 'utf8');
    if (file.endsWith('.html')) {
      assert.match(response.headers.get('content-type') || '', /text\/html/);
      assert(body.includes(expected.match(/<title>[^<]+<\/title>/)[0]), `${file}: judul halaman tidak sesuai`);
    } else {
      assert.equal(body, expected, `${file}: respons tidak sesuai berkas situs`);
    }
    console.log(`OK HTTP 200: ${file}`);
  }
  for (const file of ['.git/HEAD', 'README.md', 'AGENTS.md', 'Doc/expedisi.txt', 'scripts/static-site.cjs', '.cdf/runtime.json', '.cdf-library/']) {
    const response = await fetch(new URL(file, base), { signal: AbortSignal.timeout(20000) });
    assert.equal(response.status, 404, `${file}: berkas internal tidak boleh tersedia`);
    await response.body?.cancel();
    console.log(`OK HTTP 404: ${file}`);
  }
}

async function main() {
  const action = process.argv[2];
  if (action === 'check') check();
  else if (action === 'build') build();
  else if (action === 'http') await verifyHttp(process.argv[3]);
  else throw new Error('Gunakan check, build, atau http <alamat>');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
