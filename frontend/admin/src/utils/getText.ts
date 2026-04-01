export function getText(
  textRecord: Record<string, string> | undefined,
  language: string
): string {
  if (!textRecord) return '';
  return textRecord[language] || '';
}
