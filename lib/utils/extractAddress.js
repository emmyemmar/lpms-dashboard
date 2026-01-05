export function extractAddress(html) {
  if (!html) return null;
  const match = html.match(/0x[a-fA-F0-9]{40}/);
  return match ? match[0].toLowerCase() : null;
}
