export async function hashPassword(pass, compareHash) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(pass));
  const hash = Array.from(new Uint8Array(buf)).map(x => x.toString(16).padStart(2, "0")).join("");
  if (compareHash) return hash === compareHash;
  return hash;
}

export function randomApiKey() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32))).map(x => x.toString(16).padStart(2, "0")).join("");
}

export function randomBase32(len = 16) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  return Array.from(crypto.getRandomValues(new Uint8Array(len))).map(x => alphabet[x % alphabet.length]).join("");
}
