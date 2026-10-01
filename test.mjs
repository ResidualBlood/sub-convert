import { readFileSync } from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const element = () => ({ value: "", checked: false, classList: { toggle() {} }, addEventListener() {}, querySelectorAll: () => [] });
const elements = new Map();
const context = vm.createContext({
  URL, URLSearchParams, console,
  document: { querySelector(selector) { if (!elements.has(selector)) elements.set(selector, element()); return elements.get(selector); } },
  localStorage: { getItem: () => null, setItem() {} },
});
vm.runInContext(readFileSync(new URL("app.js", import.meta.url), "utf8"), context);
vm.runInContext(`
  globalThis.result = buildConversionUrl({ ...DEFAULTS, sourceUrls: "https://example.com/a?token=dummy\\nhttps://example.com/b" });
  globalThis.defaults = DEFAULTS;
  globalThis.presets = CONFIG_PRESETS;
  globalThis.bad = validate({ ...DEFAULTS, sourceUrls: "javascript:alert(1)" });
`, context);
const url = new URL(context.result);
assert.equal(url.origin, "https://suc.duohao.xyz");
assert.equal(url.pathname, "/sub");
assert.equal(url.searchParams.get("target"), "clash");
assert.equal(url.searchParams.get("url"), "https://example.com/a?token=dummy|https://example.com/b");
assert.equal(url.searchParams.get("config"), context.defaults.configUrl);
assert.equal(url.searchParams.get("scv"), "false");
assert.equal(url.searchParams.get("udp"), "false");
assert.equal(url.searchParams.get("expand"), "false");
vm.runInContext(`globalThis.compact = buildConversionUrl({ ...DEFAULTS, sourceUrls: "https://example.com/a", expand: false });`, context);
assert.equal(new URL(context.compact).searchParams.get("expand"), "false");
assert.equal(elements.get("#udp").checked, false);
assert.equal(context.presets.length, 3);
assert.ok(context.presets[1].url.endsWith("/Home_NOAD.ini"));
assert.ok(context.bad);
assert.equal(elements.get("#apiUrl").value, "https://suc.duohao.xyz");
assert.equal(elements.get("#copyButton").disabled, true);
console.log("PASS: defaults, Home presets, source order, conversion URL, validation");
