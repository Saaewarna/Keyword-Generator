#!/usr/bin/env node
/**
 * Judi Bola Keyword Generator — tambah KW turunan (descend)
 *
 * Contoh:
 *   // KW turunan, buang tanda kurung, minimal 2 kata
 *   node generate-judi-bola.js --descend --min-ngram=2 --strip-paren
 *
 *   // Output ke folder out
 *   node generate-judi-bola.js --descend --out=out
 */

const fs = require("fs");
const path = require("path");

// ====== DATA ======
const YEAR = new Date().getFullYear();

/** 1) Keyword Utama & Akses (Kompetisi Tinggi) */
const SEED = [
  "togel online",
  "situs togel terpercaya",
  "bandar togel resmi",
  "agen togel terbaik",
  "daftar akun togel",
  "link alternatif togel",
  "togel deposit pulsa",
  "togel deposit dana",
  "situs togel terbesar"
];

/** Intent umum */
const INTENTS = [
  "apa itu", "cara main", "panduan", "strategi", "trik menang",
  "rumus jitu", "angka hoki", "prediksi", "forum syair",
  "buku mimpi", "erek erek", "arti mimpi",
  "cara daftar", "cara login", "fitur", "bonus", "promo"
];

/** 2) Jenis Pasaran / Mode */
const TOPICS_BASE = [
  "Togel Singapore (SGP)",
  "Togel Hongkong (HK)",
  "Togel Sydney (SDY)",
  "Togel Macau",
  "Togel Cambodia",
  "Togel Taiwan",
  "Togel Japan",
  "Togel Malaysia",
  "Togel Bullseye"
];

/** 3) Navigasional (Brand/Platform) — global: kosong */
const PROVIDERS = [];

/** 5) Transaksional & Spesifikasi */
const FEATURES = [
  "Togel Minimal Deposit 10rb",
  "Togel Bet Kecil",
  "Togel Deposit Pulsa Tanpa Potongan",
  "Togel Via Dana",
  "Bonus New Member Togel",
  "Bonus Harian Togel",
  "Diskon 4D 3D 2D",
  "Referral Togel Terbesar",
  "Hadiah 4D 3D 2D Terbesar"
];

/** 4) Long-Tail (Prediksi, Erek-Erek, Buku Mimpi) */
const INFO = [
  "Prediksi Togel Hari Ini",
  "Buku Mimpi 2D 3D 4D Terlengkap",
  "Erek Erek Bergambar",
  "Kode Alam Togel Terbaru",
  "Tafsir Mimpi Togel",
  "Rumus Togel 2D 3D 4D",
  "Data Keluaran Togel",
  "Forum Syair Togel",
  "Prediksi JP Hari Ini"
];

// ====== ARGS ======
const arg = (name, def = true) => {
  const a = process.argv.find(v => v.startsWith(`--${name}=`));
  if (a) return a.split("=")[1];
  if (process.argv.includes(`--${name}`)) return true;
  if (process.argv.includes(`--no-${name}`)) return false;
  return def;
};

// ====== DEFAULT BEHAVIOR (biar sama kayak --out=out --min-ngram=2 --strip-paren --no-csv) ======
const LIMIT = parseInt(arg("limit", "0"), 10) || 0;
const WRITE_CSV = arg("csv", false);       // default: NO CSV
const WRITE_TXT = arg("txt", true);        // default: TXT aja
const OUT_DIR_DEFAULT = "out";             // default folder output

const DESCEND = arg("descend", true);      // KW turunan ON
const MIN_NGRAM = parseInt(arg("min-ngram", "2"), 10) || 2;
const STRIP_PAREN = arg("strip-paren", true);
const OUT_DIR = arg("out", OUT_DIR_DEFAULT);

// Minimum kata global (buat filter umum)
const MIN_WORDS = parseInt(arg("min-words", "0"), 10) || 0;

// ====== UTIL ======
const norm = s =>
  s.toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s*-\s*/g, "-")
    .trim();

const uniqPush = (set, s) => {
  const t = norm(s);
  if (!t) return;
  set.add(t);
};

const stripParen = s => s.replace(/\s*\([^)]*\)/g, "").replace(/\s{2,}/g, " ").trim();

function descendVariants(line, minN = 2, strip = true) {
  const base = strip ? stripParen(line) : line;
  const toks = base.split(" ").filter(Boolean);
  const out = [];
  for (let k = toks.length; k >= minN; k--) out.push(toks.slice(0, k).join(" "));
  return out;
}

// ====== GENERATOR ======
function generateAll() {
  const out = new Set();

  // 1) intent + seed + topic (mode)
  INTENTS.forEach(i =>
    SEED.forEach(seed =>
      TOPICS_BASE.forEach(t => {
        uniqPush(out, `${i} ${seed} ${t}`);
      })
    )
  );

  // 2) provider combos (navigational)
  SEED.forEach(seed =>
    PROVIDERS.forEach(p => {
      uniqPush(out, `${seed} ${p}`);
      INTENTS.forEach(i => uniqPush(out, `${i} ${seed} ${p}`));
    })
  );

  // 3) feature-based combos (transaksional)
  SEED.forEach(seed =>
    FEATURES.forEach(f => {
      uniqPush(out, `${seed} ${f}`);
      INTENTS.forEach(i => uniqPush(out, `${i} ${seed} ${f}`));
    })
  );

  // 4) info / long-tail (langsung push)
  INFO.forEach(x => uniqPush(out, x));

  let list = Array.from(out);

  // KW turunan (step-down)
  if (DESCEND) {
    const ladder = new Set();
    list.forEach(line => {
      descendVariants(line, MIN_NGRAM, STRIP_PAREN).forEach(v => uniqPush(ladder, v));
    });
    list = Array.from(ladder);
  }

  // Filter minimum kata per baris (opsional)
  if (MIN_WORDS > 0) {
    list = list.filter(x => x.split(" ").length >= MIN_WORDS);
  }

  if (LIMIT > 0) list = list.slice(0, LIMIT);
  return list;
}

// ====== EXPORT (aman dari EBUSY) ======
function ensureDir(dir) {
  if (!dir) return process.cwd();
  const outDir = path.resolve(process.cwd(), dir);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  return outDir;
}

function safeFilename(base, ext, outDir) {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  return path.join(outDir, `${base}-${ts}${ext}`);
}

function writeFileSafe(filename, content) {
  const outDir = ensureDir(OUT_DIR);
  let target = path.join(outDir, filename);
  const temp = target + ".tmp";

  try {
    fs.writeFileSync(temp, content, "utf8");
    try {
      fs.renameSync(temp, target);
      return target;
    } catch (e) {
      if (e && (e.code === "EBUSY" || e.code === "EPERM")) {
        const ext = path.extname(filename);
        const base = path.basename(filename, ext);
        target = safeFilename(base, ext, outDir);
        fs.renameSync(temp, target);
        return target;
      }
      try { fs.unlinkSync(temp); } catch {}
      throw e;
    }
  } catch (e) {
    if (e && (e.code === "EBUSY" || e.code === "EPERM")) {
      const ext = path.extname(filename);
      const base = path.basename(filename, ext);
      target = safeFilename(base, ext, outDir);
      fs.writeFileSync(target, content, "utf8");
      return target;
    }
    throw e;
  }
}

function toCSV(rows) {
  const lines = ["keyword"];
  for (const kw of rows) lines.push(`"${kw.replace(/"/g, '""')}"`);
  return lines.join("\n");
}

// ====== MAIN ======
(function main() {
  const rows = generateAll();

  if (rows.length === 0) {
    console.log("no keywords generated.");
    return;
  }

  const baseName = DESCEND ? "kw-new" : "keywords-new";

  if (arg("txt", true)) {
    const txtPath = writeFileSafe(`${baseName}.txt`, rows.join("\n"));
    console.log(`TXT  -> ${txtPath} (${rows.length} baris)`);
  }
  if (arg("csv", true)) {
    const csvPath = writeFileSafe(`${baseName}.csv`, toCSV(rows));
    console.log(`CSV  -> ${csvPath} (${rows.length} baris)`);
  }
  if (!arg("csv", true) && !arg("txt", true)) {
    console.log(rows.join("\n"));
  }
})();
