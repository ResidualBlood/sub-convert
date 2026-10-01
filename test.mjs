import { readFileSync } from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const element = () => ({ value: "", checked: false, classList: { toggle() {} }, addEventListener() {}, querySelectorAll: () => [] });
const elements = new Map();
let storedState = null;
const context = vm.createContext({
  URL, URLSearchParams, console,
  document: { querySelector(selector) { if (!elements.has(selector)) elements.set(selector, element()); return elements.get(selector); } },
  localStorage: { getItem: () => storedState, setItem(key, value) { storedState = value; } },
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
assert.equal(url.searchParams.has("scv"), false);
assert.equal(url.searchParams.has("udp"), false);
assert.equal(url.searchParams.get("expand"), "false");
vm.runInContext(`globalThis.compact = buildConversionUrl({ ...DEFAULTS, sourceUrls: "https://example.com/a", expand: false });`, context);
assert.equal(new URL(context.compact).searchParams.get("expand"), "false");
assert.equal(elements.get("#udp").value, "");
assert.equal(elements.get("#scv").value, "");
for (const udp of ["", "true", "false"]) {
  for (const scv of ["", "true", "false"]) {
    context.selection = { udp, scv, sourceUrls: "https://example.com/a" };
    vm.runInContext(`applyState({ ...DEFAULTS, ...selection }); globalThis.state = readState();`, context);
    const params = new URL(elements.get("#resultUrl").value).searchParams;
    assert.equal(params.get("udp"), udp || null);
    assert.equal(params.get("scv"), scv || null);
    assert.equal(context.state.udp, udp);
    assert.equal(context.state.scv, scv);
    assert.equal(JSON.parse(storedState).settingsVersion, 4);
    vm.runInContext(`applyState(loadState());`, context);
    assert.equal(elements.get("#udp").value, udp);
    assert.equal(elements.get("#scv").value, scv);
  }
}
for (const settingsVersion of [undefined, 2, 3]) {
  for (const enabled of [false, true]) {
    storedState = JSON.stringify({
      settingsVersion, udp: enabled, scv: enabled, expand: true, emoji: false,
      sourceUrls: "https://example.com/saved", apiUrl: "https://example.com/api",
      configUrl: "https://raw.githubusercontent.com/Zbuter/clash-config-ini/refs/heads/main/config.ini",
    });
    vm.runInContext(`globalThis.migrated = loadState(); applyState(migrated);`, context);
    assert.equal(context.migrated.udp, settingsVersion && enabled ? "true" : "");
    assert.equal(context.migrated.scv, enabled ? "true" : "");
    assert.equal(context.migrated.expand, settingsVersion === 3);
    assert.equal(context.migrated.emoji, false);
    assert.equal(context.migrated.sourceUrls, "https://example.com/saved");
    assert.equal(context.migrated.apiUrl, "https://example.com/api");
    assert.equal(context.migrated.configUrl, context.defaults.configUrl);
    assert.equal(context.migrated.settingsVersion, 4);
  }
}
vm.runInContext(`applyState(DEFAULTS);`, context);
assert.equal(elements.get("#udp").value, "");
assert.equal(elements.get("#scv").value, "");
assert.equal(context.presets.length, 3);
assert.ok(context.presets[1].url.endsWith("/Home_NOAD.ini"));
assert.ok(context.bad);
assert.equal(elements.get("#apiUrl").value, "https://suc.duohao.xyz");
assert.equal(elements.get("#copyButton").disabled, true);
console.log("PASS: defaults, Home presets, source order, tri-state overrides, storage migration, conversion URL, validation");
