precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec3 u_color;
uniform float u_light;
uniform float u_party;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  vec2 mouse = (u_mouse - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

  // Subtle interactive warp toward pointer/touch
  vec2 delta = uv - mouse * 0.4;
  float dist = length(delta);
  vec2 p = uv + delta * (0.08 / (dist + 0.35));

  // Orbiting particle cloud in the void
  float particles = 0.0;
  for (int i = 0; i < 36; i++) {
    float fi = float(i);
    float angle = fi * 0.523598 + u_time * (0.35 + 0.15 * sin(fi));
    float radius = 0.14 + 0.28 * fract(sin(fi * 19.31) * 4375.5);
    if (u_party > 0.5) {
      radius += 0.08 * sin(u_time * 2.2 + fi);
    }
    vec2 pos = vec2(cos(angle), sin(angle * 1.15)) * radius;
    float d = length(p - pos);
    particles += 0.0022 / (d * d + 0.00045);
  }

  // Luminous void halo
  float halo = 0.03 / (abs(length(p) - 0.34 - 0.03 * sin(u_time * 1.3)) + 0.035);
  float glow = clamp(particles * 0.42 + halo * 0.5, 0.0, 1.0);

  vec3 darkBg = vec3(0.024, 0.024, 0.032);
  vec3 lightBg = vec3(0.968, 0.968, 0.972);
  vec3 baseBg = mix(darkBg, lightBg, u_light);

  vec3 particleTint = mix(vec3(0.92), vec3(0.12), u_light);
  vec3 activeTint = mix(particleTint, u_color, u_party);

  vec3 finalColor = mix(baseBg, activeTint, glow * 0.85);
  gl_FragColor = vec4(finalColor, 1.0);
}
