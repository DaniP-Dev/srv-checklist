const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const dir = path.join("public", "icons");
fs.mkdirSync(dir, { recursive: true });

function svgFor(size) {
  const fontSize = Math.round(size * 0.28);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="100%" height="100%" fill="#0f4c81"/>
  <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif" font-weight="700"
    font-size="${fontSize}" fill="#ffffff">SRV</text>
</svg>`;
}

async function makeIcon(size, filename) {
  await sharp(Buffer.from(svgFor(size)))
    .png()
    .toFile(path.join(dir, filename));
}

async function makeMaskable(size, filename) {
  const pad = Math.round(size * 0.1);
  const inner = size - pad * 2;
  const innerBuf = await sharp(Buffer.from(svgFor(inner))).png().toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: "#0f4c81",
    },
  })
    .composite([{ input: innerBuf, left: pad, top: pad }])
    .png()
    .toFile(path.join(dir, filename));
}

(async () => {
  await makeIcon(192, "icon-192.png");
  await makeIcon(512, "icon-512.png");
  await makeMaskable(512, "icon-maskable-512.png");
  console.log("icons ok");
})();
