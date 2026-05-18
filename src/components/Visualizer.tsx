import { useEffect, useRef } from 'react';
import { VisualSettings, PALETTES } from '../types';

interface VisualizerProps {
  settings: VisualSettings;
  analyser: AnalyserNode | null;
  dataArray: Uint8Array | null;
  averageIntensity: number;
}

export default function Visualizer({ settings, analyser, dataArray, averageIntensity }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number>(0);
  const particlesRef = useRef<any[]>([]);

  const colors = settings.colorPalette === 'custom' 
    ? { primary: settings.customTextColor, secondary: settings.customTextColor + '88', accent: settings.customTextColor + 'aa', bg: settings.customBgColor }
    : PALETTES[settings.colorPalette];

  // Initialize particles for Nebula mode
  useEffect(() => {
    particlesRef.current = Array.from({ length: 150 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2,
    }));
  }, []);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || !dataArray || !analyser) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const intensity = averageIntensity / 255;
    const sensitivityAdj = intensity * settings.sensitivity;

    // Pulse effect
    const isPulse = intensity > 0.7 && settings.pulseStrength > 0;
    if (isPulse) {
      ctx.save();
      const scale = 1 + (intensity - 0.7) * 0.08 * settings.pulseStrength;
      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);
      ctx.translate(-centerX, -centerY);
    }

    // Clear canvas with configurable trail
    const baseTrail = settings.mode === 'acid_flow' ? 0.05 : 0.08;
    const trailValue = Math.max(0.005, (1 - settings.trailAmount) * 0.3 + baseTrail);
    const r = parseInt(colors.bg.slice(1,3), 16);
    const g = parseInt(colors.bg.slice(3,5), 16);
    const b = parseInt(colors.bg.slice(5,7), 16);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${trailValue})`;
    ctx.fillRect(-width, -height, width * 3, height * 3);

    // Global filters
    let filters = '';
    if (settings.hueShift > 0) filters += `hue-rotate(${settings.hueShift}deg) `;
    if (settings.saturation !== 1) filters += `saturate(${settings.saturation * 100}%) `;
    if (settings.contrast !== 1) filters += `contrast(${settings.contrast * 100}%) `;

    // Shader Post-Processing (Pre-render setup)
    if (settings.shaderMode === 'bloom') {
      filters += `blur(${intensity * 5}px) brightness(${100 + intensity * 50}%) contrast(120%) `;
    } else if (settings.shaderMode === 'liquid') {
      const liquidScale = 2 + intensity * 15 * settings.effectStrength;
      filters += `blur(${liquidScale}px) contrast(${200 + intensity * 200}%) hue-rotate(${intensity * 90 + Date.now() * 0.01 * settings.rotationSpeed}deg) `;
    } else if (settings.shaderMode === 'vhs') {
      filters += `sepia(0.2) saturate(1.5) contrast(1.2) hue-rotate(-10deg) `;
    } else if (settings.shaderMode === 'crt') {
       filters += `brightness(${90 + intensity * 20}%) contrast(110%) `;
    }

    if (settings.mode === 'acid_flow') {
      filters += `blur(${intensity * 5}px) `;
      ctx.shadowBlur = 15 * intensity;
      ctx.shadowColor = colors.primary;
    }
    
    ctx.filter = filters.trim() || 'none';
    if (settings.shaderMode === 'pixel') ctx.imageSmoothingEnabled = false;

    // Grid Overlay
    if (settings.gridOverlay) {
      ctx.save();
      ctx.strokeStyle = colors.primary;
      ctx.globalAlpha = 0.05 + intensity * 0.05;
      ctx.lineWidth = 0.5;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Capture main render for post-processing if needed
    // However, for speed we just draw directly with context modifiers

    if (settings.mirrorMode) {
      // We will draw normally then mirror half if we want, 
      // but easier is just to draw mirrored in the main loops.
      // For simplicity, we'll translate the whole context for some modes.
    }

    const bassHit = intensity > 0.7;
    
    ctx.save();
    if (settings.chromaticAberration > 0 && bassHit) {
       ctx.translate((Math.random() - 0.5) * 15 * settings.chromaticAberration, (Math.random() - 0.5) * 15 * settings.chromaticAberration);
    }

    if (settings.mode === 'spectral' || settings.mode === 'orbital' || settings.mode === 'vortex' || settings.mode === 'acid_flow') {
      const bufferLength = analyser.frequencyBinCount;
      const angleStep = (Math.PI * 2) / bufferLength;

      ctx.save();
      ctx.translate(centerX, centerY);
      
      // Rotation based on setting + intensity
      const rotationBase = Date.now() * 0.0002 * settings.rotationSpeed;
      ctx.rotate(rotationBase + (settings.mode === 'vortex' ? intensity * 0.5 : intensity * 0.1));

      if (settings.mode === 'acid_flow') {
        ctx.beginPath();
        ctx.lineWidth = settings.lineWeight * 3;
        for (let i = 0; i < bufferLength; i++) {
          const value = dataArray[i];
          const percent = value / 255;
          const radiusBase = Math.min(width, height) * 0.2;
          const wobble = Math.sin(Date.now() * 0.005 + i * 0.2) * 15;
          const orbit = radiusBase + (wobble * settings.effectStrength) + (percent * 50 * settings.sensitivity);
          const angle = i * angleStep;

          const x = Math.cos(angle) * orbit;
          const y = Math.sin(angle) * orbit;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);

          if (percent > 0.8) {
            ctx.save();
            ctx.fillStyle = i % 2 === 0 ? colors.accent : 'white';
            ctx.globalAlpha = percent;
            ctx.beginPath();
            ctx.arc(x, y, 6 * percent * settings.sensitivity, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
        ctx.strokeStyle = colors.primary;
        ctx.stroke();
      } else {
        for (let i = 0; i < bufferLength; i++) {
          const value = dataArray[i];
          const percent = value / 255;
          const radiusBase = Math.min(width, height) * 0.15;
          const barHeight = percent * radiusBase * 2 * settings.sensitivity;
          const angle = i * angleStep;

          const x = Math.cos(angle) * radiusBase;
          const y = Math.sin(angle) * radiusBase;

          const gradient = ctx.createLinearGradient(x, y, Math.cos(angle) * (radiusBase + barHeight), Math.sin(angle) * (radiusBase + barHeight));
          gradient.addColorStop(0, colors.primary);
          gradient.addColorStop(0.5, colors.secondary);
          gradient.addColorStop(1, colors.accent);

          ctx.strokeStyle = gradient;
          ctx.lineWidth = (2 + percent * 8) * settings.lineWeight;
          ctx.lineCap = 'round';

          if (settings.mode === 'spectral') {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
              Math.cos(angle) * (radiusBase + barHeight),
              Math.sin(angle) * (radiusBase + barHeight)
            );
            if (settings.glowAmount > 0.5) {
              ctx.shadowBlur = settings.glowAmount * 10 * percent;
              ctx.shadowColor = colors.primary;
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
          } else if (settings.mode === 'orbital') {
            if (percent > 0.4) {
               ctx.beginPath();
               ctx.arc(Math.cos(angle) * (radiusBase + barHeight), Math.sin(angle) * (radiusBase + barHeight), percent * 12 * settings.effectStrength, 0, Math.PI * 2);
               ctx.fillStyle = i % 2 === 0 ? colors.accent : colors.primary;
               if (settings.glowAmount > 0.5) {
                 ctx.shadowBlur = settings.glowAmount * 20 * percent;
                 ctx.shadowColor = ctx.fillStyle;
               }
               ctx.fill();
               ctx.shadowBlur = 0;
               ctx.lineWidth = 0.5 * settings.lineWeight;
               ctx.globalAlpha = 0.1 + percent * 0.2;
               ctx.moveTo(0,0);
               ctx.lineTo(Math.cos(angle) * (radiusBase + barHeight), Math.sin(angle) * (radiusBase + barHeight));
               ctx.stroke();
               ctx.globalAlpha = 1.0;
            }
          } else if (settings.mode === 'vortex') {
            const vortexOffset = Math.sin(Date.now() * 0.002 + i * 0.1) * 30 * settings.effectStrength;
            ctx.beginPath();
            const vRadius = percent * 20 * settings.sensitivity;
            ctx.arc(x + vortexOffset, y + vortexOffset, vRadius, 0, Math.PI * 2);
            ctx.stroke();
            if (percent > 0.8) {
              ctx.fillStyle = 'white';
              ctx.beginPath();
              ctx.arc(x + vortexOffset, y + vortexOffset, 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }
      ctx.restore();
    } else if (settings.mode === 'nebula') {
      particlesRef.current.forEach((p, idx) => {
        const freqIndex = idx % dataArray.length;
        const freqValue = dataArray[freqIndex] / 255;
        
        p.x += p.speedX * (1 + freqValue * 8 * settings.rotationSpeed);
        p.y += p.speedY * (1 + freqValue * 8 * settings.rotationSpeed);

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        const pSize = p.size * (1 + freqValue * settings.sensitivity * 2) * settings.lineWeight;
        ctx.arc(p.x, p.y, pSize, 0, Math.PI * 2);
        
        const hue = (Date.now() * 0.05 + idx) % 360;
        ctx.fillStyle = settings.colorPalette === 'neon' ? `hsla(${hue}, 100%, 60%, ${0.5 + freqValue * 0.5})` : (idx % 3 === 0 ? colors.primary : (idx % 3 === 1 ? colors.secondary : colors.accent));
        
        if (settings.glowAmount > 0) {
          ctx.shadowBlur = settings.glowAmount * freqValue * 25;
          ctx.shadowColor = ctx.fillStyle;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    } else if (settings.mode === 'glitch') {
      if (intensity > 0.4 * settings.effectStrength) {
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = intensity * 30 * settings.lineWeight;
        for (let i = 0; i < 8; i++) {
          const x = Math.random() * width;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height / 2 + (Math.random() - 0.5) * 200);
          ctx.stroke();
        }
      }
      
      const bars = 64;
      const barWidth = width / bars;
      for (let i = 0; i < bars; i++) {
        const val = dataArray[i * 2] / 255;
        const h = val * height * 0.9 * settings.sensitivity;
        
        const grad = ctx.createLinearGradient(0, height - h, 0, height);
        grad.addColorStop(0, colors.primary);
        grad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = grad;
        ctx.fillRect(i * barWidth, height - h, barWidth - 1, h);
        
        if (val > 0.8) {
           ctx.fillStyle = 'white';
           ctx.fillRect(i * barWidth, height - h - 10, barWidth - 1, 4);
        }
      }
    } else if (settings.mode === 'matrix') {
       const charSize = 12 * settings.lineWeight;
       ctx.font = `${charSize}px monospace`;
       ctx.textAlign = 'center';
       const cols = 50;
       const colWidth = width / cols;
       for (let i = 0; i < cols; i++) {
         const freqVal = dataArray[i % dataArray.length] / 255;
         const char = String.fromCharCode(0x30A0 + Math.random() * 96);
         ctx.fillStyle = i % 2 === 0 ? colors.primary : colors.accent;
         ctx.globalAlpha = 0.2 + freqVal * 0.8;
         
         const speed = (0.05 + freqVal * 0.2) * settings.rotationSpeed;
         for (let j = 0; j < 15; j++) {
            const yPos = (Date.now() * speed * 10 + j * 45) % height;
            ctx.fillText(char, i * colWidth, yPos);
         }
       }
       ctx.globalAlpha = 1.0;
    } else if (settings.mode === 'kinetic') {
      const segments = 50;
      const step = width / segments;
      const t = Date.now() * 0.001 * settings.rotationSpeed;
      
      ctx.lineWidth = settings.lineWeight * 3;
      ctx.lineCap = 'round';
      
      for (let i = 0; i < segments; i++) {
        const freqIndex = Math.floor((i / segments) * dataArray.length);
        const freqVal = dataArray[freqIndex] / 255;
        const amplitude = freqVal * 250 * settings.sensitivity;
        
        const x = i * step;
        const baseY = centerY + Math.sin(t + i * 0.3) * 80;
        
        ctx.strokeStyle = i % 3 === 0 ? colors.primary : (i % 3 === 1 ? colors.secondary : colors.accent);
        if (freqVal > 0.15) {
          ctx.beginPath();
          ctx.moveTo(x, baseY - amplitude);
          ctx.lineTo(x + amplitude * 0.3 * Math.sin(t), baseY + amplitude); 
          
          if (settings.glowAmount > 0) {
            ctx.shadowBlur = settings.glowAmount * 20 * freqVal;
            ctx.shadowColor = ctx.strokeStyle as string;
          }
          
          ctx.stroke();
          ctx.shadowBlur = 0;
          
          if (freqVal > 0.7) {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(x, baseY + amplitude + 15, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      
      // Liquid path
      ctx.beginPath();
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1;
      for (let i = 0; i < segments; i++) {
        const freqVal = dataArray[Math.floor((i / segments) * dataArray.length)] / 255;
        const x = i * step;
        const y = centerY + Math.sin(t + i * 0.3) * 80 + (freqVal * 40 * Math.cos(t * 1.5));
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    // Restore chromatic aberration
    if (bassHit && settings.effectStrength > 0.5) {
      ctx.restore();
    }

    // Text Overlay Enhanced (Acidic / Ghosting)
    if (settings.textOverlay) {
      ctx.save();
      // Ensure we ignore global pulse/scale for text if we want it centered normally 
      // OR let it pulse with everything. Let's let it pulse for now as it looks cool.
      
      const fontMap = {
        serif: 'Cormorant Garamond',
        sans: 'Inter',
        display: 'Space Grotesk',
        mono: 'JetBrains Mono'
      };
      
      const stretch = 1 + (intensity * 2 * settings.effectStrength);
      const baseSize = 40 * settings.textScale;
      
      ctx.save();
      ctx.translate(centerX, centerY);
      
      // Mirror Text Option
      if (settings.mirrorMode) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.globalAlpha = 0.2;
        ctx.fillText(settings.textOverlay, 0, 0);
        ctx.restore();
      }

      // Glitch text bits
      if (settings.textGlitch && intensity > 0.6) {
        for (let i = 0; i < 3; i++) {
          ctx.save();
          ctx.fillStyle = i === 0 ? colors.primary : colors.accent;
          ctx.globalAlpha = 0.3 * intensity;
          ctx.translate((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 20);
          ctx.fillText(settings.textOverlay, 0, 0);
          ctx.restore();
        }
      }

      // Ghosting effect
      if (settings.effectStrength > 0.5 && intensity > 0.5) {
        for (let i = 1; i <= 3; i++) {
          ctx.save();
          ctx.globalAlpha = (0.2 / i) * intensity;
          ctx.scale(1 + i * 0.1 * intensity, 1);
          ctx.font = `${settings.textWeight} ${settings.textFont === 'serif' ? 'italic ' : ''}${baseSize + intensity * 60}px "${fontMap[settings.textFont]}", sans-serif`;
          ctx.strokeStyle = i === 1 ? colors.primary : colors.accent;
          ctx.lineWidth = 1;
          ctx.strokeText(settings.textOverlay, 0, (Math.random() - 0.5) * 10 * intensity);
          ctx.restore();
        }
      }

      // Main acidic / stretched text
      if (settings.mode === 'acid_flow') {
         const waveX = Math.sin(Date.now() * 0.005) * 20 * intensity;
         const waveY = Math.cos(Date.now() * 0.004) * 10 * intensity;
         ctx.translate(waveX, waveY);
         ctx.rotate(Math.sin(Date.now() * 0.001) * 0.05);
      }
      ctx.scale(1, stretch);
      ctx.font = `${settings.textWeight} ${settings.textFont === 'serif' ? 'italic ' : ''}${baseSize + intensity * 60}px "${fontMap[settings.textFont]}", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      if (settings.glowAmount > 0.5) {
        ctx.shadowBlur = settings.glowAmount * 40 * intensity;
        ctx.shadowColor = colors.primary;
      }

      // Liquid text effect
      const gradient = ctx.createLinearGradient(-200, 0, 200, 0);
      gradient.addColorStop(0, colors.primary);
      gradient.addColorStop(0.5, 'white');
      gradient.addColorStop(1, colors.accent);
      
      ctx.fillStyle = gradient;
      ctx.globalAlpha = (0.7 + intensity * 0.3);
      ctx.fillText(settings.textOverlay, 0, 0);
      
      ctx.restore();
      ctx.shadowBlur = 0;
    }

    // Global Noise / Grain
    if (settings.noiseAmount > 0) {
      ctx.save();
      ctx.globalAlpha = settings.noiseAmount * 0.1;
      for (let i = 0; i < 10; i++) {
        const nx = Math.random() * width;
        const ny = Math.random() * height;
        const nw = Math.random() * 100;
        const nh = 1;
        ctx.fillStyle = 'white';
        ctx.fillRect(nx, ny, nw, nh);
      }
      ctx.restore();
    }

    // Bass hit restore
    if (bassHit) {
      // If we used save for pulse, we might need to restore twice or handle carefully
    }
    
    if (intensity > 0.7 && settings.pulseStrength > 0) {
      ctx.restore();
    }

    // Post-Processing Shaders (Final Pass)
    if (settings.shaderMode === 'pixel') {
      if (!offscreenRef.current) offscreenRef.current = document.createElement('canvas');
      const os = offscreenRef.current;
      const pixelScale = 8;
      os.width = width / pixelScale;
      os.height = height / pixelScale;
      const osCtx = os.getContext('2d');
      if (osCtx) {
        osCtx.imageSmoothingEnabled = false;
        osCtx.drawImage(canvas, 0, 0, width, height, 0, 0, os.width, os.height);
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(os, 0, 0, os.width, os.height, 0, 0, width, height);
        ctx.restore();
      }
    }

    // CRT Scanlines Overlay
    if (settings.shaderMode === 'crt') {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.globalCompositeOperation = 'multiply';
      for (let i = 0; i < height; i += 4) {
        ctx.fillRect(0, i, width, 2);
      }
      ctx.restore();
    }

    // Reset Filter
    ctx.filter = 'none';

    requestRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    requestRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current);
    };
  }, [settings, dataArray]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ backgroundColor: colors.bg }}
      id="visualizer-canvas"
    />
  );
}
