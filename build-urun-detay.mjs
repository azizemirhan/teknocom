import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const t = (name) => fs.readFileSync(join(__dirname, 'tasarim', name), 'utf8');
const L = (s) => s.split(/\r?\n/);

const header = t('header-footer.html');
const pdl = L(t('product-detail.html'));

// CSS: satır 10–1155 (1-based), 0-based slice(9,1155)
const productCss = pdl.slice(9, 1155).join('\n');

// Body: satır 1162–1668, index 1161..1667
const productHtml = pdl.slice(1161, 1668).join('\n');

// Script içeriği: açılış <script> satırı hariç, /* GALLERY */ … observe satırı
// (1671 = <script>, 1764 = </script> → 1672–1763, index 1671..1762)
let productJs = pdl.slice(1671, 1763).join('\n');
productJs = productJs.replace(
  /const observer = new IntersectionObserver/,
  'const fadeInObserver = new IntersectionObserver',
);
productJs = productJs.replace(
  /\.forEach\(el => observer\.observe\(el\)\)/,
  '.forEach((el) => fadeInObserver.observe(el))',
);

// Header: betik (nav sonrası tek blok)
const headerScriptMatch = header.match(
  /<script>\s*(\/\* ─── HEADER SCROLL SHADOW[\s\S]*?)<\/script>\s*<\/body>/,
);
if (!headerScriptMatch) throw new Error('header script bulunamadı');
const headerScriptBody = headerScriptMatch[1];

let out = header;

out = out.replace(
  '<title>Tekno.com — Teknolojinin Adresi</title>',
  '<title>Ürün Detay — Tekno.com | Teknolojinin Adresi</title>',
);
out = out.replace(
  'Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono',
  'Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono',
);
out = out.replace(
  '  --max-width: 1360px;\n}',
  `  --max-width: 1360px;
  --blue-dark: #0a6cd4;
  --blue-ultra: #f0f8ff;
  --green: #10b981;
  --red: #ef4444;
  --orange: #f59e0b;
  --purple: #8b5cf6;
  --radius-xs: 8px;
  --product-shadow: 0 12px 36px rgba(0,0,0,.1);
}`,
);
out = out.replace(
  '  background: var(--white);',
  '  background: var(--gray-50);',
  1,
);
out = out.replace(
  /\/\* ─── MAIN CONTENT PLACEHOLDER ─── \*\/\s*\.main-content \{[^}]+\}[^*]*\.main-content svg[^}]+\}[^*]*\.main-content p[^}]+\}/s,
  `/* ─── MAIN: ürün detay sayfası ─── */
.main-content {
  min-height: 0;
  display: block;
  padding: 0;
  color: inherit;
  --radius: 16px;
  --radius-sm: 12px;
  --radius-xs: 8px;
  --transition: .3s cubic-bezier(.4,0,.2,1);
}
/* galeri: üst bar + header + nav yüksekliğine hizalama */
.product-page .gallery {
  top: calc(36px + 72px + 48px + 8px);
}`,
);
out = out.replace(
  '</style>\n</head>',
  `</style>
<style>
/* ═══ tasarim/product-detail.html ═══ */
${productCss}
</style>
</head>`,
);
out = out.replace(
  /<!-- ═══ MAIN CONTENT \(Placeholder\) ═══ -->\s*<main class="main-content">[\s\S]*?<\/main>/,
  `<!-- ═══ tasarim/product-detail.html + header-footer ═══ -->\n<main class="main-content product-page" id="mainContent">\n${productHtml}\n</main>`,
);
out = out.replace(
  /href="#"( class="logo")/g,
  'href="index.html"$1',
);
out = out.replace(
  '<li><a href="#">Ana Sayfa</a></li>',
  '<li><a href="index.html">Ana Sayfa</a></li>',
);

const fullScript = `<script>
/* ═══ tasarim/product-detail (galeri, sekmeler, fade-in) ═══ */
${productJs}

/* ═══ header-footer ═══ */
${headerScriptBody}
</script>
</body>
</html>
`;

out = out.replace(
  /<script>\s*\/\* ─── HEADER SCROLL SHADOW[\s\S]*?<\/html>\s*$/m,
  fullScript,
);

const outPath = join(__dirname, 'urun-detay.html');
fs.writeFileSync(outPath, out, 'utf8');
console.log('Yazıldı:', outPath);
