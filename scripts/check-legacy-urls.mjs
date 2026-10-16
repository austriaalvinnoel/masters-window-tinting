// Run: node scripts/check-legacy-urls.mjs
// Read-only checks against production. No external dependencies.
const base = 'https://masterswindowtinting.com';
const cases = [
  ['/?idpage=ABOUT', '/about'],
  ['/?idpage=CONTACT', '/contact'],
  ['/?idpage=GALLERY', '/gallery'],
  ['/?idpage=Liquid_Paint_Protection_Film', '/liquid-ppf'],
  ['/?idpage=Ceramic_Pro_Long_Island_Car_and_Boat_Detailing', '/ceramic-coating'],
  ['/?idpage=WINDOW_TINTING_AND_CERAMIC_PRO_SERVICES', '/window-tinting'],
  ['/?idpage=Specialty_Window_Films', '/residential'],
  ['/?idpage=Boat_Tinting', '/marine-window-tinting'],
  ['/?idpage=ABOUT&sid=legacy-test', '/about'],
];
let failures = 0;
for (const [legacy, expected] of cases) {
  try {
    const response = await fetch(base + legacy, { redirect: 'manual', signal: AbortSignal.timeout(12000) });
    const location = response.headers.get('location');
    const resolved = location ? new URL(location, base) : null;
    const ok = [301, 308].includes(response.status) && resolved?.origin === base && resolved.pathname === expected;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${response.status} ${legacy} -> ${location || '(no Location header)'}`);
    if (!ok) failures++;
  } catch (error) {
    console.error(`ERROR ${legacy}: ${error.message}`);
    failures++;
  }
}
// sid-only URLs must be assessed individually: never redirect all sid values blindly.
console.log('NOTE: sid-only legacy URLs require evidence of their original destination before mapping.');
if (failures) process.exitCode = 1;
