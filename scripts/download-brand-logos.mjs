import https from 'https';
import http from 'http';
import fs from 'fs';

const files = [
  {
    url: 'https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png',
    dest: 'public/logos/google-brand.png'
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    dest: 'public/logos/apple-brand.svg'
  }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        const size = (fs.statSync(dest).size / 1024).toFixed(1);
        console.log(`✅ Saved: ${dest} (${size} KB)`);
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

for (const f of files) {
  try {
    await download(f.url, f.dest);
  } catch (e) {
    console.error(`❌ Failed: ${f.dest} — ${e.message}`);
  }
}
