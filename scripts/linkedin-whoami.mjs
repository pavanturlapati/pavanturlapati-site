// One-time helper: prints the LinkedIn author URN for an access token.
//
// PowerShell:
//   $env:LINKEDIN_ACCESS_TOKEN = Read-Host "Token"
//   node scripts/linkedin-whoami.mjs
//
// The token needs the scopes openid, profile and w_member_social. Never paste
// the token into chat or commit it.

const token = process.env.LINKEDIN_ACCESS_TOKEN;
if (!token) {
  console.error("Set LINKEDIN_ACCESS_TOKEN first.");
  process.exit(1);
}

const res = await fetch("https://api.linkedin.com/v2/userinfo", {
  headers: { Authorization: `Bearer ${token}` },
});
if (!res.ok) {
  console.error(`LinkedIn returned ${res.status}: ${(await res.text()).slice(0, 300)}`);
  console.error("Check that the token includes the openid and profile scopes.");
  process.exit(1);
}
const me = await res.json();
console.log(`Name:   ${me.name}`);
console.log(`Author: urn:li:person:${me.sub}`);
