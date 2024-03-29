import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  splitting: true,
  dts: true,
  replaceNodeEnv: true,
  outExtension() {
    return {
      js: '.js'
    };
  }
});
