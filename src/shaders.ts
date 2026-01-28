export const vertShader = `
precision mediump float;
attribute vec2 a_position;
varying vec2 vUv;
void main() {
  vUv = 0.5 * (a_position + 1.0);
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const fragShader = `
precision mediump float;

varying vec2 vUv;
uniform float u_time;                 // ms, масштабируется u_speed
uniform float u_ratio;                // width / height
uniform vec2 u_pointer_position;      // нормализованные координаты курсора
uniform float u_scroll_progress;      // нормализованный скролл
uniform vec3 u_base_color;            // базовый цвет
uniform float u_speed;                // множитель скорости времени
uniform float u_scale;                // множитель масштаба UV

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float neuro_shape(vec2 uv, float t, float p) {
  vec2 sine_acc = vec2(0.0);
  vec2 res = vec2(0.0);
  float scale = 8.0;

  for (int j = 0; j < 15; j++) {
    uv = rotate(uv, 1.0);
    sine_acc = rotate(sine_acc, 1.0);
    vec2 layer = uv * scale + float(j) + sine_acc - t;
    sine_acc += sin(layer) + 2.4 * p;
    res += (0.5 + 0.5 * cos(layer)) / scale;
    scale *= 1.2;
  }
  return res.x + res.y;
}

void main() {
  vec2 uv = 0.5 * vUv;
  uv.x *= u_ratio;
  uv *= u_scale;

  vec2 pointer = vUv - u_pointer_position;
  pointer.x *= u_ratio;
  float p = clamp(length(pointer), 0.0, 1.0);
  p = 0.5 * pow(1.0 - p, 2.0);

  float t = 0.001 * u_time * u_speed;
  float noise = neuro_shape(uv, t, p);

  noise = 1.2 * pow(noise, 3.0);
  noise += pow(noise, 10.0);
  noise = max(0.0, noise - 0.5);
  noise *= (1.0 - length(vUv - 0.5));

  // Используем чистый базовый цвет без смешивания
  vec3 color = u_base_color * noise;

  gl_FragColor = vec4(color, noise);
}
`;
