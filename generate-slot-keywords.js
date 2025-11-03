#!/usr/bin/env node
/**
 * Slot Keyword Advanced Mixer (ID)
 * Jalankan: node generate-slot-keywords.js
 * Opsi: node generate-slot-keywords.js --limit=10000 --no-txt --no-csv
 */

const fs = require("fs");
const path = require("path");

// ====== DATA MASTER ======
const YEAR = new Date().getFullYear(); // auto tahun berjalan

// Seed
const SEED = ["slot"];

// Grup A — Status/Kualitas
const A = [
  "gacor", "maxwin", "jackpot", "terpercaya",
  "resmi", "terbaik", "anti rungkad", "gampang menang"
];

// Grup B — Waktu/Tren
const B = [
  "hari ini", "malam ini", "terbaru", String(YEAR), "sekarang"
];

// Grup C — Platform/Akses
const C = [
  "situs", "link", "daftar", "login", "deposit pulsa", "deposit dana",
  "e-wallet", "alternatif", "demo", "apk", "deposit qris", "via gopay",
  "minimal deposit 10k", "login anti blokir"
];

// Grup D — Provider (populer + tambahan advanced)
const D = [
  // populer
  "pragmatic play", "pg soft", "habanero", "microgaming", "joker123",
  "cq9", "playtech", "spadegaming", "slot88", "live22", "rtg",
  "flow gaming", "yggdrasil", "play'n go", "onetouch", "booongo",
  "advantplay", "vivo gaming", "evoplay", "red tiger",
  // tambahan advanced
  "ka gaming", "real time gaming", "jdb", "nolimit city", "fastspin",
  "fa chai", "hacksaw", "bng", "relax gaming", "nextspin", "naga games", "betsoft"
];

// Grup E — Nama Game (populer + tambahan advanced)
const E = [
  // populer
  "gates of olympus", "sweet bonanza", "mahjong ways", "mahjong ways 2",
  "starlight princess", "wild west gold", "aztec gems", "koi gate",
  "fortune tiger", "sugar rush", "ganesha fortune", "lucky neko", "bonanza gold",
  "power of thor", "great rhino megaways", "5 lions megaways", "hot fiesta",
  "bigger bass bonanza", "fire strike", "big bass amazon xtreme",
  "madame destiny megaways", "wild beach party", "floating dragon",
  "buffalo king", "fruit party", "dog house megaways", "gems bonanza",
  // tambahan advanced
  "the dog house", "big bass bonanza", "gates of gatotkaca", "wild bandito",
  "treasure aztec", "golden lion", "dragon tiger", "crazy train"
];

// Grup F — Angka & Bet (Ultra Long-Tail)
const F = [
  "bet 200", "bet kecil", "bet murah", "deposit 5000", "deposit 10k",
  "modal receh", "jackpot x500", "x1000", "x10000"
];

// ====== UTIL ======
const arg = (name, def = true) => {
  const a = process.argv.find(v => v.startsWith(`--${name}=`));
  if (a) return a.split("=")[1];
  if (process.argv.includes(`--${name}`)) return true;
  if (process.argv.includes(`--no-${name}`)) return false;
  return def;
};

const LIMIT = parseInt(arg("limit", "0"), 10) || 0;
const WRITE_CSV = arg("csv", true);
const WRITE_TXT = arg("txt", true);

const norm = s =>
  s
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s*-\s*/g, "-")
    .trim();

const uniqPush = (set, s) => { const t = norm(s); if (!set.has(t)) set.add(t); };

// ====== POLA KOMBINASI ======
// Set pola yang umum dan efektif buat SEO ID.
function generateAll() {
  const out = new Set();

  // 1) [C] slot [A] [D] [B]
  C.forEach(c => A.forEach(a => D.forEach(d => B.forEach(b => {
    uniqPush(out, `${c} ${SEED[0]} ${a} ${d} ${b}`);
  }))));

  // 2) demo slot [E] [B]
  B.forEach(b => E.forEach(e => {
    uniqPush(out, `demo ${SEED[0]} ${e} ${b}`);
  }));

  // 3) slot [D] [F]
  D.forEach(d => F.forEach(f => {
    uniqPush(out, `${SEED[0]} ${d} ${f}`);
  }));

  // 4) pola slot [E] [F]
  E.forEach(e => F.forEach(f => {
    uniqPush(out, `pola ${SEED[0]} ${e} ${f}`);
  }));

  // 5) rtp slot [D] [B]
  D.forEach(d => B.forEach(b => {
    uniqPush(out, `rtp ${SEED[0]} ${d} ${b}`);
  }));

  // 6) link slot [F]
  F.forEach(f => {
    uniqPush(out, `link ${SEED[0]} ${f}`);
  });

  // 7) cara menang main slot [E]
  E.forEach(e => {
    uniqPush(out, `cara menang main ${SEED[0]} ${e}`);
  });

  // 8) ekstra: [C] [E] (akses langsung ke game)
  C.forEach(c => E.forEach(e => {
    uniqPush(out, `${c} ${e}`);
  }));

  // 9) ekstra: [A] slot [D]
  A.forEach(a => D.forEach(d => {
    uniqPush(out, `${a} ${SEED[0]} ${d}`);
  }));

  // 10) ekstra freshness: [SEED] [E] [B]
  E.forEach(e => B.forEach(b => {
    uniqPush(out, `${SEED[0]} ${e} ${b}`);
  }));

  let list = Array.from(out);
  if (LIMIT > 0) list = list.slice(0, LIMIT);
  return list;
}

// ====== EXPORT ======
function toCSV(rows) {
  const header = ["keyword"];
  const lines = [header.join(",")];
  for (const kw of rows) {
    // escape CSV minimal
    const cell = `"${kw.replace(/"/g, '""')}"`;
    lines.push(cell);
  }
  return lines.join("\n");
}

function writeFileSafe(filename, content) {
  const fp = path.resolve(process.cwd(), filename);
  fs.writeFileSync(fp, content, "utf8");
  return fp;
}

(function main(){
  const rows = generateAll();

  if (WRITE_TXT) {
    const txtPath = writeFileSafe("keywords-slot-advanced.txt", rows.join("\n"));
    console.log(`TXT  -> ${txtPath} (${rows.length} baris)`);
  }
  if (WRITE_CSV) {
    const csvPath = writeFileSafe("keywords-slot-advanced.csv", toCSV(rows));
    console.log(`CSV  -> ${csvPath} (${rows.length} baris)`);
  }
  if (!WRITE_CSV && !WRITE_TXT) {
    console.log(rows.join("\n"));
  }
})();
