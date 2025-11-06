import { useRef, useEffect } from 'react';
import { Renderer, Program, Mesh, Triangle, Vec2 } from 'ogl';

const vertex = `
attribute vec2 position;
void main(){gl_Position=vec4(position,0.0,1.0);}
`;

const fragment = `
#ifdef GL_ES
precision highp float;
#endif
uniform vec2 uResolution;
uniform float uTime;
uniform float uSpeed;

float noise(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = noise(i);
    float b = noise(i + vec2(1.0, 0.0));
    float c = noise(i + vec2(0.0, 1.0));
    float d = noise(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for(int i = 0; i < 6; i++) {
        value += amplitude * smoothNoise(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 p = uv * 3.0;
    
    float t = uTime * uSpeed;
    
    // Create flowing patterns
    vec2 q = vec2(fbm(p + t * 0.1), fbm(p + vec2(1.0)));
    vec2 r = vec2(fbm(p + q + t * 0.15), fbm(p + q + vec2(1.7, 9.2)));
    
    float f = fbm(p + r);
    
    // Define colors - use bright, vibrant green for visibility
    vec3 patternGreen = vec3(0.3, 0.75, 0.45);  // Bright green for patterns
    
    // Create pattern mask - only the pattern areas will be visible
    float patternStrength = smoothstep(0.45, 0.55, f);
    
    // Add more detailed swirls
    float detailPattern = smoothstep(0.48, 0.52, r.x);
    
    // Calculate final pattern visibility (inverted so pattern is visible, background is transparent)
    float alpha = (1.0 - patternStrength) * mix(1.0, 0.7, detailPattern);
    
    // Output only the green pattern with transparency
    // Where alpha is high = green pattern visible
    // Where alpha is low = transparent (shows white background through)
    gl_FragColor = vec4(patternGreen, alpha);
}
`;

type Props = {
  speed?: number;
};

export default function DarkVeil2({ speed = 0.3 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = ref.current as HTMLCanvasElement;
    const parent = canvas.parentElement as HTMLElement;

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio, 2),
      canvas,
      alpha: true,
      premultipliedAlpha: false
    });

    const gl = renderer.gl;
    const geometry = new Triangle(gl);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vec2() },
        uSpeed: { value: speed }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      renderer.setSize(w, h);
      program.uniforms.uResolution.value.set(w, h);
    };

    window.addEventListener('resize', resize);
    resize();

    const start = performance.now();
    let frame = 0;

    const loop = () => {
      program.uniforms.uTime.value = (performance.now() - start) / 1000;
      program.uniforms.uSpeed.value = speed;
      renderer.render({ scene: mesh });
      frame = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, [speed]);
  
  return <canvas ref={ref} className="w-full h-full block" style={{ opacity: 0.75 }} />;
}
