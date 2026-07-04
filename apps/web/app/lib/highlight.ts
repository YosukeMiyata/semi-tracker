export function highlightRowClass(symbol: string, highlight: string | null): string {
  if (highlight !== symbol) {
    return "";
  }
  return "bg-copper-soft ring-2 ring-copper/35";
}
