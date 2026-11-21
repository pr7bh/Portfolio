'use client';

import { useEffect, useRef } from 'react';
import { Renderer, Camera, Geometry, Program, Mesh } from 'ogl';
import { getMusicLevel } from './ambientAudio';
import { onInterfaceClick } from './uiSounds';
import { onWarp } from './fx';

const defaultColors = ['#ffffff', '#ffffff', '#ffffff'];

const hexToRgb = hex => {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(c => c + c)
      .join('');
  }
  const int = parseInt(hex.slice(0, 6), 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  return [r, g, b];
};

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;
  
  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;
  uniform float uPulse;
  
  varying vec4 vRandom;
  varying float vPulse;
  varying vec3 vColor;
  
  void main() {
    vRandom = random;
    vColor = color;
    // Music / click energy: some particles swell more than others.
    vPulse = uPulse * smoothstep(0.25, 1.0, random.y);
    
    vec3 pos = position * uSpread;
    pos.z *= 10.0;
    
    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    float t = uTime;
    mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
    mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
    mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);
    
    vec4 mvPos = viewMatrix * mPos;

    if (uSizeRandomness == 0.0) {
      gl_PointSize = uBaseSize;
    } else {
      gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
    }

    gl_PointSize *= 1.0 + vPulse * 1.4;
    gl_Position = projectionMatrix * mvPos;
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  
  uniform float uTime;
  uniform float uAlphaParticles;
  varying vec4 vRandom;
  varying vec3 vColor;
  varying float vPulse;
  
  void main() {
    vec2 uv = gl_PointCoord.xy;
    float d = length(uv - vec2(0.5));
    
    if(uAlphaParticles < 0.5) {
      if(d > 0.5) {
        discard;
      }
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
    } else {
      float circle = smoothstep(0.5, 0.4, d) * 0.8;
      // Pulsing particles glow toward the site's cool/warm signal colours.
      vec3 tint = mix(vec3(0.58, 0.95, 1.0), vec3(1.0, 0.64, 0.3), vRandom.z);
      vec3 col = mix(vColor, tint, clamp(vPulse * 0.9, 0.0, 0.85));
      gl_FragColor = vec4(col + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle * (1.0 + vPulse * 0.6));
    }
  }
`;

const Particles = ({
  particleCount = 200,
  particleSpread = 10,
  speed = 0.1,
  particleColors,
  moveParticlesOnHover = false,
  particleHoverFactor = 1,
  alphaParticles = false,
  particleBaseSize = 100,
  sizeRandomness = 1,
  cameraDistance = 20,
  disableRotation = false,
  pixelRatio = 1,
  reactive = false,
  className
}) => {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({
      dpr: pixelRatio,
      depth: false,
      alpha: true
    });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 0);

    const camera = new Camera(gl, { fov: 15 });
    camera.position.set(0, 0, cameraDistance);

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    };
    window.addEventListener('resize', resize, false);
    resize();

    const handleMouseMove = e => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current = { x, y };
    };

    if (moveParticlesOnHover) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    const count = particleCount;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);
    const palette = particleColors && particleColors.length > 0 ? particleColors : defaultColors;

    for (let i = 0; i < count; i++) {
      let x, y, z, len;
      do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
        len = x * x + y * y + z * z;
      } while (len > 1 || len === 0);
      const r = Math.cbrt(Math.random());
      positions.set([x * r, y * r, z * r], i * 3);
      randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
      const col = hexToRgb(palette[Math.floor(Math.random() * palette.length)]);
      colors.set(col, i * 3);
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors }
    });

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: particleSpread },
        uBaseSize: { value: particleBaseSize * pixelRatio },
        uSizeRandomness: { value: sizeRandomness },
        uAlphaParticles: { value: alphaParticles ? 1 : 0 },
        uPulse: { value: 0 }
      },
      transparent: true,
      depthTest: false
    });

    const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationFrameId = 0;
    let lastTime = performance.now();
    let elapsed = 0;
    let lastScrollY = window.scrollY;
    let scrollKick = 0;
    let boost = 0;
    let pulse = 0;
    let burst = 0;
    const offClick = reactive ? onInterfaceClick(() => {
      burst = 1;
    }) : null;
    // Warp jumps and hyperdrive: the field rushes past.
    let warp = 0;
    const offWarp = reactive ? onWarp(({ intensity }) => {
      warp = Math.max(warp, intensity);
    }) : null;

    const onScroll = () => {
      const y = window.scrollY;
      scrollKick = Math.min(1, Math.abs(y - lastScrollY) / 60);
      lastScrollY = y;
    };

    const update = t => {
      animationFrameId = document.hidden || reduceMotion ? 0 : requestAnimationFrame(update);
      const delta = Math.min(50, t - lastTime);
      lastTime = t;
      boost += (scrollKick - boost) * 0.08;
      scrollKick *= 0.9;
      if (reactive) {
        const level = Math.min(1, getMusicLevel() * 2.6);
        pulse += (level - pulse) * 0.12;
        burst *= 0.93;
        warp *= 0.965;
      }
      elapsed += delta * speed * (1 + boost * 5 + pulse * 1.5 + burst * 8 + warp * 60);

      program.uniforms.uTime.value = elapsed * 0.001;
      program.uniforms.uPulse.value = Math.min(1.4, pulse + burst * 0.9 + warp * 0.8);

      if (moveParticlesOnHover) {
        particles.position.x = -mouseRef.current.x * particleHoverFactor;
        particles.position.y = -mouseRef.current.y * particleHoverFactor;
      } else {
        particles.position.x = 0;
        particles.position.y = 0;
      }

      if (!disableRotation) {
        particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
        particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
        particles.rotation.z += 0.01 * speed;
      }

      renderer.render({ scene: particles, camera });
    };

    const onVisibility = () => {
      if (!document.hidden && !animationFrameId && !reduceMotion) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    animationFrameId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      offClick?.();
      offWarp?.();
      if (moveParticlesOnHover) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      cancelAnimationFrame(animationFrameId);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    particleCount,
    particleSpread,
    speed,
    moveParticlesOnHover,
    particleHoverFactor,
    alphaParticles,
    particleBaseSize,
    sizeRandomness,
    cameraDistance,
    disableRotation,
    pixelRatio,
    reactive
  ]);

  return <div ref={containerRef} className={`relative w-full h-full ${className}`} />;
};

export default Particles;
