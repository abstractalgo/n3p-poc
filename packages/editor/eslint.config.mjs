import { config } from "@repo/eslint-config/react-internal";
import { defineConfig } from "eslint/config";
import lexicalPlugin from "@lexical/eslint-plugin";

export default defineConfig(...config, {
  plugins: {
    "@lexical": lexicalPlugin,
  },
  rules: {
    "@lexical/rules-of-lexical": "error",
  },
});
