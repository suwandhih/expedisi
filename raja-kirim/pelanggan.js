'use strict';
(() => {
  const storageKey = 'raja-kirim-surat-v1';
  const channels = ['Email', 'WhatsApp'];
  const contactLimits = Object.freeze({ nama: 120, perusahaan: 160, alamat: 500, email1: 254, email2: 254, phone1: 40, phone2: 40, fax: 40 });
  const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const isEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isPhone = value => /^[+\d][\d\s().-]*$/.test(value) && value.replace(/\D/g, '').length >= 6;

  // Add only the new fields to legacy records; never replace a saved contact with sample data.
  function normalizeContact(customer) {
    return {
      ...customer,
      fax: customer.fax ?? '',
      primaryEmail: customer.primaryEmail ?? (customer.email1 ? 'email1' : customer.email2 ? 'email2' : 'email1'),
      primaryPhone: customer.primaryPhone ?? (customer.phone1 ? 'phone1' : customer.phone2 ? 'phone2' : 'phone1'),
      primaryChannel: customer.primaryChannel ?? (customer.email1 || customer.email2 ? 'Email' : customer.phone1 || customer.phone2 ? 'WhatsApp' : 'Email')
    };
  }
  function validateContact(customer) {
    if (!record(customer) || !Object.entries(contactLimits).every(([field, limit]) => typeof customer[field] === 'string' && customer[field].length <= limit)) return 'Data kontak tidak valid atau terlalu panjang.';
    if (!customer.nama.trim() || !customer.perusahaan.trim()) return 'Isi nama PIC dan perusahaan.';
    if (!['email1', 'email2'].includes(customer.primaryEmail) || !['phone1', 'phone2'].includes(customer.primaryPhone) || !channels.includes(customer.primaryChannel)) return 'Pilih kontak dan saluran utama yang valid.';
    if (['email1', 'email2'].some(field => customer[field] && !isEmail(customer[field]))) return 'Periksa format alamat email pelanggan.';
    if (['phone1', 'phone2', 'fax'].some(field => customer[field] && !isPhone(customer[field]))) return 'Periksa nomor WhatsApp atau fax; gunakan sedikitnya 6 digit angka.';
    if ((customer.email1 || customer.email2) && !customer[customer.primaryEmail]) return 'Email yang ditandai utama belum diisi.';
    if ((customer.phone1 || customer.phone2) && !customer[customer.primaryPhone]) return 'Nomor WhatsApp yang ditandai utama belum diisi.';
    if ((customer.email1 || customer.email2 || customer.phone1 || customer.phone2) && !contactFor(customer).destination) return 'Saluran utama belum memiliki kontak. Isi kontaknya atau pilih saluran lain.';
    return '';
  }
  function contactFor(customer, choice = 'preferred') {
    const channel = choice === 'preferred' ? customer.primaryChannel : choice;
    const destination = channel === 'Email' ? customer[customer.primaryEmail] : channel === 'WhatsApp' ? customer[customer.primaryPhone] : '';
    return { channel, destination: destination || '' };
  }
  function restore(data) {
    const required = ['id', 'nama', 'perusahaan', 'nomor', 'tanggal', 'rute', 'layanan', 'berat', 'total', 'alamat', 'email1', 'email2', 'phone1', 'phone2'];
    if (!record(data) || (data.version !== undefined && data.version !== 2) || !Array.isArray(data.customers) || !Array.isArray(data.history)) throw new Error('Invalid stored data');
    if (!data.customers.every(c => record(c) && required.every(field => typeof c[field] === 'string') && c.id && c.nama && c.perusahaan)) throw new Error('Invalid stored customers');
    const ids = new Set(data.customers.map(c => c.id));
    if (ids.size !== data.customers.length) throw new Error('Duplicate customer');
    const customers = data.customers.map(normalizeContact);
    // Preserve even older manually entered contacts; new/edited contacts use the stricter form validation.
    if (!customers.every(c => typeof c.fax === 'string' && ['email1', 'email2'].includes(c.primaryEmail) && ['phone1', 'phone2'].includes(c.primaryPhone) && channels.includes(c.primaryChannel))) throw new Error('Invalid stored preferences');
    if (!data.history.every(item => record(item) && ['customer', 'subject', 'body', 'date'].every(field => typeof item[field] === 'string') && ids.has(item.customer) && ['incoming', 'outgoing'].includes(item.direction) && channels.includes(item.channel) && (item.destination === undefined || typeof item.destination === 'string'))) throw new Error('Invalid stored history');
    return { customers, history: data.history.map(item => ({ ...item, destination: item.destination ?? '' })) };
  }
  function createMessages(chosen, choice, direction, subject, body, date) {
    if (!chosen.length) return { ok: false, message: 'Pilih setidaknya satu pelanggan.' };
    if (!['preferred', ...channels].includes(choice) || !['incoming', 'outgoing'].includes(direction)) return { ok: false, message: 'Pilih saluran dan arah pesan yang valid.' };
    if (!subject.trim() || subject.length > 160) return { ok: false, message: 'Isi subjek pesan, maksimal 160 karakter.' };
    if (!body.trim()) return { ok: false, message: 'Isi pesan terlebih dahulu.' };
    const entries = [];
    for (const customer of chosen) {
      const contact = contactFor(customer, choice);
      const valid = contact.channel === 'Email' ? isEmail(contact.destination) : isPhone(contact.destination);
      if (!valid) return { ok: false, message: `${customer.nama}: kontak utama ${contact.channel} belum diisi atau tidak valid. Perbarui data pelanggan dahulu.` };
      entries.push({ customer: customer.id, direction, ...contact, subject: subject.trim(), body, date });
    }
    return { ok: true, entries };
  }
  function missingExamples(customer, history) {
    const entries = [];
    for (const channel of channels) {
      const contact = contactFor(customer, channel);
      if (!(channel === 'Email' ? isEmail(contact.destination) : isPhone(contact.destination))) continue;
      for (const direction of ['incoming', 'outgoing']) {
        if (history.some(item => item.customer === customer.id && item.channel === channel && item.direction === direction)) continue;
        entries.push({ customer: customer.id, direction, ...contact,
          subject: `${direction === 'incoming' ? 'Permintaan informasi' : 'Balasan penawaran'} · ${channel}`,
          body: direction === 'incoming' ? `Contoh pesan dari ${customer.nama} (${customer.perusahaan}): mohon informasi pengiriman ${customer.rute}.` : `Contoh balasan untuk ${customer.nama} (${customer.perusahaan}): berikut informasi pengiriman ${customer.rute}. Semua hanya simulasi.`,
          date: '16 Nov 2026' });
      }
    }
    return entries;
  }
  function mailbox(history, { customer, channel = 'all', direction = 'all', page = 1 }) {
    const all = history.filter(item => item.customer === customer && (channel === 'all' || item.channel === channel) && (direction === 'all' || item.direction === direction));
    const pages = Math.max(1, Math.ceil(all.length / 8));
    const current = Math.min(pages, Math.max(1, Number.isInteger(page) ? page : 1));
    return { entries: all.slice((current - 1) * 8, current * 8), count: all.length, page: current, pages };
  }
  window.RajaKirimPelanggan = Object.freeze({ storageKey, contactLimits, normalizeContact, validateContact, contactFor, restore, createMessages, missingExamples, mailbox });
})();
