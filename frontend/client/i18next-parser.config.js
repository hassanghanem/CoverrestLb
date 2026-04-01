export default {
  contextSeparator: '_',
  createOldCatalogs: false,
  defaultNamespace: 'translation',
  defaultValue: '',
  indentation: 2,
  keepRemoved: false,
  keySeparator: false,
  namespaceSeparator: false,
  output: 'src/i18n/messages/$LOCALE.json',
  input: ['src/**/*.{js,jsx,ts,tsx}'],
  locales: ['en'],
  verbose: true,
};
