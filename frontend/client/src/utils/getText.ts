export function getText(
  textRecord: Record<string, string> | string | undefined,
  language: string
): string {
  if (!textRecord) return '';

  // If it's already a plain string (e.g. "1 year"), return it directly
  if (typeof textRecord === 'string') return textRecord;

  return textRecord[language] || '';
}
