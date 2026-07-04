/**
 * GitHub Pages 用のビルド後処理。
 *
 * basename("/semi-tracker/") 付きでプリレンダーすると HTML が
 * build/client/semi-tracker/ 配下に出力されるが、GitHub Pages は公開ディレクトリを
 * https://<user>.github.io/semi-tracker/ に割り当てるため、そのままだとパスが二重になる。
 * → HTML を build/client/ 直下へ移動してフラット化する。
 * あわせて SPA フォールバックを 404.html にコピーし、未プリレンダーのURL直叩きにも対応する。
 */
import { cpSync, existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const clientDir = fileURLToPath(new URL("../build/client/", import.meta.url));
const nestedDir = `${clientDir}semi-tracker/`;
const spaFallback = `${clientDir}__spa-fallback.html`;

if (existsSync(nestedDir)) {
  cpSync(nestedDir, clientDir, { recursive: true });
  rmSync(nestedDir, { recursive: true });
  console.log("postbuild: build/client/semi-tracker/* → build/client/ にフラット化");
}

if (existsSync(spaFallback)) {
  cpSync(spaFallback, `${clientDir}404.html`);
  console.log("postbuild: __spa-fallback.html → 404.html");
}
