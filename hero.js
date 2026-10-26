/* A small, local-only Three.js still life. The recipe app never depends on WebGL. */
(function () {
  "use strict";
  let currentDestroy = null;
  const api = {
    init,
    destroy: function () {
      if (currentDestroy) currentDestroy();
    },
    get active() {
      return Boolean(currentDestroy);
    },
  };
  window.RecipeHero = api;
  function init() {
    const host = document.getElementById("hero-scene");
    if (!host || !window.THREE) return false;
    if (host.dataset.sceneInitialized)
      return host.classList.contains("scene-ready");
    const T = window.THREE;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const canvas = document.createElement("canvas");
    const contextOptions = {
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    };
    let context;
    try {
      context =
        canvas.getContext("webgl2", contextOptions) ||
        canvas.getContext("webgl", contextOptions);
    } catch (_) {
      return false;
    }
    if (!context) return false;
    let renderer;
    try {
      renderer = new T.WebGLRenderer({
        canvas,
        context,
        alpha: true,
        antialias: true,
      });
    } catch (_) {
      return false;
    }
    host.dataset.sceneInitialized = "true";
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;";
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = false; // Static soft contact shadow; no second render pass.
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    const scene = new T.Scene();
    const camera = new T.OrthographicCamera(-3.3, 3.3, 3.3, -3.3, 0.1, 30);
    camera.position.set(0, 8.5, 5.5);
    camera.lookAt(0, 0.15, 0);
    scene.add(new T.HemisphereLight(0xfff8e6, 0x68775d, 3));
    const sun = new T.DirectionalLight(0xfff6da, 3.5);
    sun.position.set(-3, 7, 4);
    sun.castShadow = false;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, {
      left: -4,
      right: 4,
      top: 4,
      bottom: -4,
      near: 0.1,
      far: 20,
    });
    sun.shadow.bias = -0.001;
    sun.shadow.normalBias = 0.025;
    sun.shadow.radius = 4;
    scene.add(sun);
    const fill = new T.DirectionalLight(0xf2f8ed, 1.4);
    fill.position.set(4, 3, -3);
    scene.add(fill);
    const dish = new T.Group();
    scene.add(dish);
    const materials = {};
    function mat(color, roughness) {
      const key = color + ":" + (roughness || 0.7);
      return (
        materials[key] ||
        (materials[key] = new T.MeshStandardMaterial({
          color,
          roughness: roughness || 0.7,
          metalness: 0,
        }))
      );
    }
    function mesh(geometry, material, parent) {
      const object = new T.Mesh(geometry, material);
      object.castShadow = true;
      object.receiveShadow = true;
      (parent || dish).add(object);
      return object;
    }
    // A real revolved ceramic profile, with an ivory interior and a forest-green foot.
    const profile = [
      [0, 0.06],
      [0.85, 0.06],
      [1.05, 0.1],
      [1.55, 0.25],
      [1.91, 0.52],
      [1.96, 0.58],
      [1.9, 0.62],
      [1.79, 0.54],
      [1.46, 0.34],
      [0.9, 0.22],
      [0, 0.22],
    ].map((p) => new T.Vector2(p[0], p[1]));
    mesh(new T.LatheGeometry(profile, 80), mat("#f9f4e5", 0.28));
    const foot = mesh(
      new T.CylinderGeometry(1.15, 0.99, 0.15, 64),
      mat("#345840", 0.48),
    );
    foot.position.y = 0.02;
    const rim = mesh(
      new T.TorusGeometry(1.925, 0.024, 8, 100),
      mat("#d8d8bd", 0.5),
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.59;
    const base = mesh(
      new T.CylinderGeometry(1.48, 1.3, 0.075, 64),
      mat("#d0bc7d"),
    );
    base.position.y = 0.3;
    let seed = 83;
    function random() {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    }
    const sphere = new T.SphereGeometry(1, 12, 8);
    const veinGeometry = new T.CylinderGeometry(0.007, 0.012, 1.55, 5);
    const stemGeometry = new T.ConeGeometry(1, 1, 4);
    const sliceGeometry = new T.CylinderGeometry(1, 1, 1, 24);
    const cubeGeometry = new T.BoxGeometry(0.13, 0.12, 0.15);
    const pastaPoints = Array.from({ length: 17 }, (_, j) => {
      const t = j / 16;
      return new T.Vector3(
        Math.sin(t * 5.5) * 0.15,
        Math.sin(t * 3.14) * 0.06,
        (t - 0.5) * 0.34,
      );
    });
    const pastaGeometry = new T.TubeGeometry(
      new T.CatmullRomCurve3(pastaPoints),
      16,
      0.041,
      5,
      false,
    );
    function leaf(x, z, size, rotation, color, y) {
      const group = new T.Group();
      group.position.set(x, y || 0.42, z);
      group.rotation.y = rotation;
      dish.add(group);
      const leafMesh = mesh(sphere, mat(color), group);
      leafMesh.scale.set(size * 0.5, size * 0.085, size);
      leafMesh.rotation.z = 0.13;
      const vein = mesh(veinGeometry, mat("#a5bc6d"), group);
      vein.scale.y = size;
      vein.rotation.x = Math.PI / 2;
      vein.position.y = size * 0.085;
      return group;
    }
    const greens = ["#5f803a", "#456c36", "#799649", "#365b35", "#91a753"];
    for (let i = 0; i < 32; i++) {
      const angle = i * 2.39996,
        radius = Math.sqrt((i + 0.5) / 32) * 1.3;
      leaf(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0.28 + random() * 0.22,
        angle + random(),
        greens[i % greens.length],
        0.39 + random() * 0.13,
      );
    }
    // Ridged little pasta curls weave through the leaves.
    for (let i = 0; i < 15; i++) {
      const angle = i * 2.39996,
        radius = Math.sqrt((i + 0.5) / 15) * 1.19;
      const curl = mesh(pastaGeometry, mat("#e5c16b"));
      curl.position.set(
        Math.cos(angle) * radius,
        0.57 + random() * 0.11,
        Math.sin(angle) * radius,
      );
      curl.rotation.y = angle;
    }
    function tomato(x, z, size) {
      const group = new T.Group();
      group.position.set(x, 0.61, z);
      dish.add(group);
      const fruit = mesh(sphere, mat("#df5035", 0.35), group);
      fruit.scale.set(size, size * 0.8, size);
      for (let j = 0; j < 5; j++) {
        const stem = mesh(stemGeometry, mat("#3d6538"), group);
        stem.scale.set(0.025, size * 0.7, 0.025);
        stem.position.set(
          Math.cos(j * 1.256) * size * 0.2,
          size * 0.78,
          Math.sin(j * 1.256) * size * 0.2,
        );
        stem.rotation.z = Math.PI / 3;
        stem.rotation.y = j * 1.256;
      }
    }
    [
      [-0.85, -0.6, 0.21],
      [0.9, 0.2, 0.25],
      [0.15, 0.95, 0.22],
      [-0.7, 0.7, 0.18],
      [0.55, -0.95, 0.19],
      [0.35, -0.15, 0.2],
    ].forEach((a) => tomato(...a));
    function cucumber(x, z, r, rotation) {
      const group = new T.Group();
      group.position.set(x, 0.61, z);
      group.rotation.z = 0.12;
      group.rotation.y = rotation;
      dish.add(group);
      const skin = mesh(sliceGeometry, mat("#456c3a"), group);
      skin.scale.set(r, 0.065, r);
      const flesh = mesh(sliceGeometry, mat("#c0d78c"), group);
      flesh.scale.set(r * 0.87, 0.071, r * 0.87);
      flesh.position.y = 0.01;
      for (let j = 0; j < 5; j++) {
        const s = mesh(sphere, mat("#e8e6b9"), group);
        s.scale.set(0.018, 0.008, 0.043);
        s.position.set(
          Math.cos(j * 1.256) * r * 0.35,
          0.05,
          Math.sin(j * 1.256) * r * 0.35,
        );
        s.rotation.y = -j * 1.256;
      }
    }
    [
      [-0.25, -0.7, 0.28, 0.2],
      [0.78, 0.72, 0.24, -0.2],
      [-1.05, 0.12, 0.25, 0.7],
      [0.3, 0.38, 0.27, 1],
    ].forEach((a) => cucumber(...a));
    for (let i = 0; i < 26; i++) {
      const a = i * 2.39996,
        d = Math.sqrt(random()) * 1.27;
      const pea = mesh(sphere, mat(i % 3 ? "#d9b769" : "#e4c584"));
      pea.scale.set(0.065 + random() * 0.018, 0.06, 0.07);
      pea.position.set(
        Math.cos(a) * d,
        0.64 + random() * 0.04,
        Math.sin(a) * d,
      );
    }
    for (let i = 0; i < 8; i++) {
      const a = i * 2.39996,
        d = Math.sqrt(random()) * 1.2;
      const cube = mesh(cubeGeometry, mat("#fff4d5"));
      cube.position.set(Math.cos(a) * d, 0.68, Math.sin(a) * d);
      cube.rotation.set(0.1, a, 0.1);
    }
    // A lemon wedge and a basil sprig sit on the table beside the bowl.
    const lemon = mesh(
      new T.CylinderGeometry(0.38, 0.38, 0.12, 32, 1, false, 0, Math.PI),
      mat("#e5bc3e"),
    );
    lemon.position.set(1.95, -0.01, 0.9);
    lemon.rotation.y = -0.8;
    const lemonFlesh = mesh(
      new T.CylinderGeometry(0.32, 0.32, 0.125, 32, 1, false, 0, Math.PI),
      mat("#f4d777"),
    );
    lemonFlesh.position.copy(lemon.position);
    lemonFlesh.position.y += 0.015;
    lemonFlesh.rotation.y = -0.8;
    leaf(-1.9, 0.8, 0.27, 1.1, "#537b3a", -0.02);
    leaf(-2.03, 1.05, 0.22, 0.4, "#698e43", -0.015);
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = shadowCanvas.height = 64;
    const brush = shadowCanvas.getContext("2d");
    let shadowTexture = null,
      ground = null;
    if (brush) {
      const gradient = brush.createRadialGradient(32, 32, 3, 32, 32, 32);
      gradient.addColorStop(0, "rgba(44,61,35,.22)");
      gradient.addColorStop(0.55, "rgba(44,61,35,.12)");
      gradient.addColorStop(1, "rgba(44,61,35,0)");
      brush.fillStyle = gradient;
      brush.fillRect(0, 0, 64, 64);
      shadowTexture = new T.CanvasTexture(shadowCanvas);
      ground = new T.Mesh(
        new T.PlaneGeometry(5.1, 5.1),
        new T.MeshBasicMaterial({
          map: shadowTexture,
          transparent: true,
          depthWrite: false,
        }),
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.08;
      scene.add(ground);
    }
    dish.rotation.y = -0.18;
    // Batch repeated vegetables into a handful of draws. Transforms remain relative to the dish.
    dish.updateMatrixWorld(true);
    const inverseDish = new T.Matrix4().copy(dish.matrixWorld).invert(),
      batches = new Map();
    dish.traverse((object) => {
      if (!object.isMesh) return;
      const key = object.geometry.uuid + ":" + object.material.uuid;
      if (!batches.has(key)) batches.set(key, []);
      batches.get(key).push(object);
    });
    const matrix = new T.Matrix4();
    for (const objects of batches.values()) {
      if (objects.length < 2) continue;
      const instanced = new T.InstancedMesh(
        objects[0].geometry,
        objects[0].material,
        objects.length,
      );
      objects.forEach((object, i) => {
        matrix.multiplyMatrices(inverseDish, object.matrixWorld);
        instanced.setMatrixAt(i, matrix);
        object.parent.remove(object);
      });
      instanced.instanceMatrix.needsUpdate = true;
      dish.add(instanced);
    }
    let inView = true,
      disposed = false,
      frame = 0,
      targetX = 0,
      targetY = -0.18;
    function render() {
      if (!disposed && !document.hidden && inView)
        renderer.render(scene, camera);
    }
    function resize() {
      if (disposed) return;
      const rect = host.getBoundingClientRect(),
        width = Math.max(1, rect.width),
        height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      const aspect = width / height,
        size = aspect < 1 ? 2.75 / aspect : 2.75;
      camera.left = -size * aspect;
      camera.right = size * aspect;
      camera.top = size;
      camera.bottom = -size;
      camera.updateProjectionMatrix();
      render();
    }
    function stop() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    }
    function ease() {
      frame = 0;
      if (disposed || !inView || document.hidden || motion.matches) return;
      const dx = targetX - dish.rotation.x,
        dy = targetY - dish.rotation.y;
      dish.rotation.x += dx * 0.18;
      dish.rotation.y += dy * 0.18;
      render();
      if (Math.abs(dx) + Math.abs(dy) > 0.0005)
        frame = requestAnimationFrame(ease);
      else {
        dish.rotation.x = targetX;
        dish.rotation.y = targetY;
        render();
      }
    }
    function requestEase() {
      if (!frame && !disposed && inView && !document.hidden && !motion.matches)
        frame = requestAnimationFrame(ease);
    }
    function resume() {
      stop();
      render();
      if (
        Math.abs(targetX - dish.rotation.x) +
          Math.abs(targetY - dish.rotation.y) >
        0.0005
      )
        requestEase();
    }
    function pointer(event) {
      if (motion.matches || event.pointerType === "touch") return;
      const rect = host.getBoundingClientRect();
      targetX =
        ((event.clientY - rect.top - rect.height / 2) / rect.height) * 0.075;
      targetY =
        -0.18 +
        ((event.clientX - rect.left - rect.width / 2) / rect.width) * 0.12;
      requestEase();
    }
    function resetPointer() {
      targetX = 0;
      targetY = -0.18;
      requestEase();
    }
    function motionChange() {
      stop();
      targetX = 0;
      targetY = -0.18;
      dish.rotation.x = 0;
      dish.rotation.y = -0.18;
      render();
    }
    host.appendChild(canvas);
    resize();
    host.classList.add("scene-ready");
    const resizeObserver =
      typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
    if (resizeObserver) resizeObserver.observe(host);
    else window.addEventListener("resize", resize);
    const observer =
      typeof IntersectionObserver === "function"
        ? new IntersectionObserver(
            (entries) => {
              inView = entries[0].isIntersecting;
              resume();
            },
            { rootMargin: "80px" },
          )
        : null;
    if (observer) observer.observe(host);
    host.addEventListener("pointermove", pointer, { passive: true });
    host.addEventListener("pointerleave", resetPointer, { passive: true });
    document.addEventListener("visibilitychange", resume);
    if (motion.addEventListener)
      motion.addEventListener("change", motionChange);
    function contextLost(event) {
      event.preventDefault();
      cleanup();
    }
    canvas.addEventListener("webglcontextlost", contextLost);
    function cleanup(event) {
      if (event && event.persisted) return;
      if (disposed) return;
      disposed = true;
      stop();
      if (observer) observer.disconnect();
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pagehide", cleanup);
      document.removeEventListener("visibilitychange", resume);
      if (motion.removeEventListener)
        motion.removeEventListener("change", motionChange);
      host.removeEventListener("pointermove", pointer);
      host.removeEventListener("pointerleave", resetPointer);
      canvas.removeEventListener("webglcontextlost", contextLost);
      const geometries = new Set();
      scene.traverse((o) => {
        if (o.geometry) geometries.add(o.geometry);
      });
      geometries.forEach((g) => g.dispose());
      Object.values(materials).forEach((m) => m.dispose());
      if (ground) ground.material.dispose();
      if (shadowTexture) shadowTexture.dispose();
      renderer.dispose();
      if (typeof renderer.forceContextLoss === "function")
        renderer.forceContextLoss();
      canvas.remove();
      host.classList.remove("scene-ready");
      delete host.dataset.sceneInitialized;
      currentDestroy = null;
    }
    currentDestroy = cleanup;
    window.addEventListener("pagehide", cleanup);
    // One initial render. Further frames only follow pointer input, resizing, or visibility changes.
    render();
    return true;
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
