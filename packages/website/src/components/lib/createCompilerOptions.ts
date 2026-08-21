import type * as ts from 'typescript';

/**
 * Converts compiler options from JSON to ts.CompilerOptions
 */
export function createCompilerOptions(
  tsConfig: Record<string, unknown> = {},
): ts.CompilerOptions {
  const config = window.ts.convertCompilerOptionsFromJson(
    {
      // `allowJs` is a default rather than an override so that the playground
      // can load `.js`/`.cjs`/`.mjs` files, while still letting a user's
      // tsconfig turn it off (e.g. to use `isolatedDeclarations`).
      allowJs: true,
      jsx: 'preserve',
      module: 'esnext',
      target: 'esnext',
      ...tsConfig,
      baseUrl: undefined,
      lib: Array.isArray(tsConfig.lib) ? tsConfig.lib : undefined,
      moduleDetection: undefined,
      moduleResolution: undefined,
      paths: undefined,
      plugins: undefined,
      typeRoots: undefined,
    },
    '/tsconfig.json',
  );

  const options = config.options;

  options.lib ??= [window.ts.getDefaultLibFileName(options)];

  return options;
}
