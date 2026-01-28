import { fragShader, vertShader } from "./shaders";
import type { NeuralController, NeuralOptions, RGB } from "./types";

const toRgb = (c: string | RGB): RGB => {
  if (typeof c === "string") {
    const hex = c.replace("#", "");
    const full = hex.length === 3 ? hex.split("").map(h => h + h).join("") : hex;
    const bigint = parseInt(full, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  }
  return c;
};

const norm = (rgb: RGB): [number, number, number] => [rgb.r / 255, rgb.g / 255, rgb.b / 255];

const defaultOptions: Required<NeuralOptions> = {
  baseColor: { r: 64, g: 128, b: 192 },
  speed: 1.0,
  scale: 1.0,
  pointer: true,
  scrollReactive: true,
};

type UniformMap = Record<string, WebGLUniformLocation | null>;

const compileShader = (gl: WebGLRenderingContext, source: string, type: number) => {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) || "Shader compile error";
    gl.deleteShader(shader);
    throw new Error(log);
  }
  return shader;
};

const linkProgram = (gl: WebGLRenderingContext, v: WebGLShader, f: WebGLShader) => {
  const program = gl.createProgram()!;
  gl.attachShader(program, v);
  gl.attachShader(program, f);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) || "Program link error";
    throw new Error(log);
  }
  return program;
};

export function createNeuralAnimation(
  canvasSelector: string,
  opts: NeuralOptions = {},
): NeuralController {
  const options: Required<NeuralOptions> = { ...defaultOptions, ...opts };
  const canvas = document.querySelector<HTMLCanvasElement>(canvasSelector);
  if (!canvas) throw new Error(`Canvas not found: ${canvasSelector}`);

  const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
  if (!gl) throw new Error("WebGL not supported");

  const v = compileShader(gl, vertShader, gl.VERTEX_SHADER);
  const f = compileShader(gl, fragShader, gl.FRAGMENT_SHADER);
  const program = linkProgram(gl, v, f);
  gl.useProgram(program);

  const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
  const vertexBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const uniforms: UniformMap = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
  for (let i = 0; i < count; i++) {
    const name = gl.getActiveUniform(program, i)!.name;
    uniforms[name] = gl.getUniformLocation(program, name);
  }

  const setBaseColor = (c: string | RGB) => {
    const [r, g, b] = norm(toRgb(c));
    gl.uniform3f(uniforms["u_base_color"], r, g, b);
  };

  let raf = 0;
  let running = false;
  const pointer = { x: 0, y: 0 };

  const updatePointer = (eX: number, eY: number) => {
    pointer.x = eX;
    pointer.y = eY;
  };

  const animate = () => {
    gl.uniform1f(uniforms["u_time"], performance.now());
    gl.uniform2f(uniforms["u_pointer_position"], pointer.x / innerWidth, 1 - pointer.y / innerHeight);
    gl.uniform1f(uniforms["u_scroll_progress"], options.scrollReactive ? pageYOffset / (2 * innerHeight) : 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    raf = requestAnimationFrame(animate);
  };

  const resize = () => {
    const w = canvas.clientWidth || innerWidth;
    const h = canvas.clientHeight || innerHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uniforms["u_ratio"], canvas.width / canvas.height);
    }
  };

  setBaseColor(options.baseColor);
  gl.uniform1f(uniforms["u_speed"], options.speed);
  gl.uniform1f(uniforms["u_scale"], options.scale);

  const onPointerMove = (e: PointerEvent) => updatePointer(e.clientX, e.clientY);
  const onTouchMove = (e: TouchEvent) => {
    if (e.targetTouches[0]) updatePointer(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
  };
  const onClick = (e: MouseEvent) => updatePointer(e.clientX, e.clientY);
  const onResize = () => resize();

  if (options.pointer) {
    addEventListener("pointermove", onPointerMove, { passive: true });
    addEventListener("touchmove", onTouchMove, { passive: true });
    addEventListener("click", onClick);
  }
  addEventListener("resize", onResize);

  resize();

  const start = () => {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(animate);
  };
  const stop = () => {
    if (!running) return;
    running = false;
    cancelAnimationFrame(raf);
  };

  const setSpeed = (speed: number) => {
    const s = Math.max(0, speed);
    gl.uniform1f(uniforms["u_speed"], s);
    options.speed = s;
  };

  const setScale = (scale: number) => {
    const sc = Math.max(0.01, scale);
    gl.uniform1f(uniforms["u_scale"], sc);
    options.scale = sc;
  };

  const destroy = () => {
    stop();
    removeEventListener("resize", onResize);
    if (options.pointer) {
      removeEventListener("pointermove", onPointerMove);
      removeEventListener("touchmove", onTouchMove);
      removeEventListener("click", onClick);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.deleteBuffer(vertexBuffer);
    gl.deleteProgram(program);
    gl.deleteShader(v);
    gl.deleteShader(f);
  };

  start();

  return {
    start,
    stop,
    resize,
    setColor: setBaseColor,
    setSpeed,
    setScale,
    destroy,
  };
}

export default createNeuralAnimation;
