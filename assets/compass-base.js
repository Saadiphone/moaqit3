// إنشاء صورة البوصلة الأساسية كـ Base64
export const compassBase = `data:image/svg+xml;base64,${btoa(`
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="256" cy="256" r="240" stroke="#2ecc71" stroke-width="2" fill="none"/>
  <path d="M256 16V64" stroke="#2ecc71" stroke-width="2"/>
  <path d="M256 448V496" stroke="#2ecc71" stroke-width="2"/>
  <path d="M496 256H448" stroke="#2ecc71" stroke-width="2"/>
  <path d="M64 256H16" stroke="#2ecc71" stroke-width="2"/>
  <text x="256" y="40" text-anchor="middle" fill="#2ecc71" font-size="24">N</text>
  <text x="256" y="485" text-anchor="middle" fill="#2ecc71" font-size="24">S</text>
  <text x="485" y="264" text-anchor="middle" fill="#2ecc71" font-size="24">E</text>
  <text x="27" y="264" text-anchor="middle" fill="#2ecc71" font-size="24">W</text>
</svg>
`)}`;
