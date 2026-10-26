const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const THREE = require("../vendor/three.min.js");
const source = fs.readFileSync(path.join(__dirname, "../hero.js"), "utf8");

function harness({ webgl = true, reduced = false, library = true } = {}) {
  const frames = new Map();
  const listeners = new Map();
  let frameId = 0;
  let renders = 0;
  let meshCount = 0;
  const classes = new Set();
  const children = [];
  const host = {
    dataset: {},
    classList: {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
      contains: (name) => classes.has(name),
    },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 400 }),
    appendChild: (child) => children.push(child),
    addEventListener: (name, fn) => listeners.set("host:" + name, fn),
    removeEventListener: (name) => listeners.delete("host:" + name),
  };
  function makeCanvas() {
    return {
      width: 0,
      height: 0,
      style: {},
      getContext: (type) =>
        type === "2d"
          ? {
              createRadialGradient: () => ({ addColorStop() {} }),
              fillRect() {},
            }
          : webgl
            ? {}
            : null,
      setAttribute() {},
      addEventListener: (name, fn) => listeners.set("canvas:" + name, fn),
      removeEventListener: (name) => listeners.delete("canvas:" + name),
      remove() {
        const i = children.indexOf(this);
        if (i >= 0) children.splice(i, 1);
      },
    };
  }
  class Renderer {
    constructor() {
      this.shadowMap = {};
    }
    setPixelRatio() {}
    setClearColor() {}
    setSize() {}
    dispose() {}
    render(scene) {
      renders++;
      meshCount = 0;
      scene.traverse((object) => {
        if (object.isMesh) meshCount++;
      });
    }
  }
  const document = {
    readyState: "complete",
    hidden: false,
    getElementById: () => host,
    createElement: () => makeCanvas(),
    addEventListener: (name, fn) => listeners.set("document:" + name, fn),
    removeEventListener: (name) => listeners.delete("document:" + name),
  };
  const motion = {
    matches: reduced,
    addEventListener: (name, fn) => listeners.set("motion:" + name, fn),
    removeEventListener: (name) => listeners.delete("motion:" + name),
  };
  const window = {
    THREE: library ? { ...THREE, WebGLRenderer: Renderer } : null,
    matchMedia: () => motion,
    devicePixelRatio: 2,
    addEventListener: (name, fn) => listeners.set("window:" + name, fn),
    removeEventListener: (name) => listeners.delete("window:" + name),
  };
  vm.runInNewContext(source, {
    window,
    document,
    requestAnimationFrame: (fn) => {
      frames.set(++frameId, fn);
      return frameId;
    },
    cancelAnimationFrame: (id) => frames.delete(id),
  });
  return {
    api: window.RecipeHero,
    host,
    frames,
    children,
    listeners,
    document,
    motion,
    get renders() {
      return renders;
    },
    get meshCount() {
      return meshCount;
    },
    event(key, args) {
      listeners.get(key)?.(args || {});
    },
    drain() {
      let n = 0;
      while (frames.size && n++ < 100) {
        const [id, fn] = frames.entries().next().value;
        frames.delete(id);
        fn(n * 16);
      }
      return n;
    },
  };
}

test("hero keeps static fallback when WebGL or the optional library is absent", () => {
  for (const options of [{ webgl: false }, { library: false }]) {
    const h = harness(options);
    assert.equal(h.api.active, false);
    assert.equal(h.children.length, 0);
    assert.equal(h.api.init(), false);
  }
});

test("hero is idle after initialization, batches geometry, and renders only finite pointer easing", () => {
  const h = harness();
  assert.equal(h.api.active, true);
  assert.equal(h.frames.size, 0, "there is no perpetual animation loop");
  assert.ok(
    h.meshCount < 45,
    `expected fewer than 45 draws, found ${h.meshCount}`,
  );
  h.event("host:pointermove", {
    pointerType: "mouse",
    clientX: 390,
    clientY: 100,
  });
  assert.equal(h.frames.size, 1);
  assert.ok(h.drain() < 100);
  assert.equal(h.frames.size, 0, "animation settles and stops");
  h.api.destroy();
  assert.equal(h.children.length, 0);
  assert.equal(h.api.active, false);
  assert.equal(h.host.dataset.sceneInitialized, undefined);
  assert.equal(h.api.init(), true, "explicit re-enable works");
  assert.equal(h.children.length, 1);
  h.api.destroy();
});

test("reduced motion remains stationary and hidden documents stop pending frames", () => {
  const reduced = harness({ reduced: true });
  reduced.event("host:pointermove", {
    pointerType: "mouse",
    clientX: 300,
    clientY: 100,
  });
  assert.equal(reduced.frames.size, 0);
  reduced.api.destroy();
  const h = harness();
  h.event("host:pointermove", {
    pointerType: "mouse",
    clientX: 300,
    clientY: 100,
  });
  h.document.hidden = true;
  const before = h.renders;
  h.event("document:visibilitychange");
  assert.equal(h.frames.size, 0);
  assert.equal(h.renders, before);
  h.api.destroy();
});

test("context loss restores fallback and cleanup is idempotent", () => {
  const h = harness();
  h.event("canvas:webglcontextlost", { preventDefault() {} });
  assert.equal(h.api.active, false);
  assert.equal(h.host.classList.contains("scene-ready"), false);
  assert.equal(h.children.length, 0);
  assert.doesNotThrow(() => h.api.destroy());
});
