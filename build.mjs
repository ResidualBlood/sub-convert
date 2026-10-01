import { mkdir, copyFile } from "node:fs/promises";

await mkdir(new URL("./public/", import.meta.url), { recursive: true });
for (const file of ["index.html", "app.js", "styles.css", "_headers"]) {
  await copyFile(new URL(file, import.meta.url), new URL(`public/${file}`, import.meta.url));
}
console.log("Built public/: index.html, app.js, styles.css, _headers");
