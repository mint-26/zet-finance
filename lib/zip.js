// Minimal ZIP writer for the CRM backup, in the browser. Files are stored without compression:
// PDFs and photos hardly shrink further, and it keeps this free of a dependency.
const MAX_SIZE = 0xfffffffe; // No ZIP64: a single archive stays below 4 GB.

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function header(size, write) {
  const view = new DataView(new ArrayBuffer(size));
  write(view);
  return view.buffer;
}

// entries: [{ name: 'folder/file.pdf', blob }]. Returns one Blob with the archive.
export async function createZip(entries, now = new Date()) {
  if (entries.length >= 0xffff) throw new Error('Zu viele Dateien für ein Backup');
  const encoder = new TextEncoder();
  const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const UTF8_NAMES = 0x0800;

  const parts = [];
  const central = [];
  let offset = 0;

  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const bytes = new Uint8Array(await entry.blob.arrayBuffer());
    const crc = crc32(bytes);
    const size = bytes.length;

    parts.push(header(30, (v) => {
      v.setUint32(0, 0x04034b50, true);
      v.setUint16(4, 20, true);
      v.setUint16(6, UTF8_NAMES, true);
      v.setUint16(10, time, true);
      v.setUint16(12, date, true);
      v.setUint32(14, crc, true);
      v.setUint32(18, size, true);
      v.setUint32(22, size, true);
      v.setUint16(26, name.length, true);
    }), name, entry.blob);

    central.push(header(46, (v) => {
      v.setUint32(0, 0x02014b50, true);
      v.setUint16(4, 20, true);
      v.setUint16(6, 20, true);
      v.setUint16(8, UTF8_NAMES, true);
      v.setUint16(12, time, true);
      v.setUint16(14, date, true);
      v.setUint32(16, crc, true);
      v.setUint32(20, size, true);
      v.setUint32(24, size, true);
      v.setUint16(28, name.length, true);
      v.setUint32(42, offset, true);
    }), name);

    offset += 30 + name.length + size;
    if (offset > MAX_SIZE) throw new Error('Das Backup wäre größer als 4 GB');
  }

  const centralSize = central.reduce((sum, p) => sum + p.byteLength, 0);
  const end = header(22, (v) => {
    v.setUint32(0, 0x06054b50, true);
    v.setUint16(8, entries.length, true);
    v.setUint16(10, entries.length, true);
    v.setUint32(12, centralSize, true);
    v.setUint32(16, offset, true);
  });
  return new Blob([...parts, ...central, end], { type: 'application/zip' });
}
