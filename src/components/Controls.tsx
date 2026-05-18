import { motion } from 'motion/react';
import { VisualSettings, VisualMode, PALETTES } from '../types';
import { Play, Square, Layers, Disc, Zap, Activity } from 'lucide-react';

interface ControlsProps {
  settings: VisualSettings;
  setSettings: (s: VisualSettings) => void;
  isActive: boolean;
  onStart: () => void;
  onStop: () => void;
  intensity: number;
}

export default function Controls({ settings, setSettings, isActive, onStart, onStop, intensity }: ControlsProps) {
  const modes: { id: VisualMode; label: string; icon: any }[] = [
    { id: 'orbital', label: 'Orbital Resonance', icon: Disc },
    { id: 'spectral', label: 'Spectral Flux', icon: Layers },
    { id: 'glitch', label: 'Glitch Synthesis', icon: Zap },
    { id: 'nebula', label: 'Nebula Emission', icon: Activity },
    { id: 'vortex', label: 'Vortex Tunnel', icon: Disc },
    { id: 'matrix', label: 'Data Matrix', icon: Activity },
    { id: 'kinetic', label: 'Kinetic Extension', icon: Zap },
    { id: 'acid_flow', label: 'Acidic Flow', icon: Activity },
  ];

  return (
    <>
      {/* Sidebar Controls */}
      <aside 
        className="w-80 border-r border-white/10 p-8 flex flex-col gap-8 bg-black/20 backdrop-blur-md z-20 overflow-y-auto custom-scrollbar shadow-2xl"
        style={{ fontSize: `${settings.uiFontSize}px` }}
      >
        <section>
          <label className="text-[9px] uppercase tracking-[0.3em] text-white/30 mb-4 block font-bold">01. Engine Mode</label>
          <div className="grid grid-cols-1 gap-2">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => setSettings({ ...settings, mode: m.id })}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
                  settings.mode === m.id 
                  ? 'bg-white/10 border-white/20 text-white' 
                  : 'bg-transparent border-white/5 text-white/30 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <m.icon className={`w-3.5 h-3.5 ${settings.mode === m.id ? 'text-neon-pink' : 'text-white/20'}`} />
                  <span className="font-display text-[11px] font-medium tracking-tight uppercase">{m.label}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <label className="text-[9px] uppercase tracking-[0.3em] text-white/30 mb-4 block font-bold">选定字体 (FONT SELECTION)</label>
          <div className="space-y-4">
            <div className="relative group">
              <select 
                value={settings.textFont}
                onChange={(e) => setSettings({ ...settings, textFont: e.target.value as any })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-3 font-mono text-[11px] text-white focus:outline-none focus:border-neon-pink appearance-none cursor-pointer tracking-widest uppercase"
              >
                <option value="display" className="bg-[#121212]">Outfit Normal 变体</option>
                <option value="sans" className="bg-[#121212]">Inter 变体</option>
                <option value="serif" className="bg-[#121212]">Cormorant 变体</option>
                <option value="mono" className="bg-[#121212]">JetBrains Mono 变体</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">▼</div>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[9px] text-white/40 uppercase tracking-widest">文字颜色 (TEXT COLOR)</label>
                <div className="flex items-center gap-2">
                   <input 
                     type="color"
                     value={settings.customTextColor}
                     onChange={(e) => {
                       setSettings({ ...settings, customTextColor: e.target.value, colorPalette: 'custom' });
                     }}
                     className="w-10 h-10 bg-transparent border-none cursor-pointer rounded overflow-hidden"
                   />
                   <div className="w-10 h-10 rounded shadow-inner" style={{ backgroundColor: settings.customTextColor }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-[9px] text-white/40 uppercase tracking-widest">背景颜色 (BG COLOR)</label>
                <div className="flex items-center gap-2">
                   <input 
                     type="color"
                     value={settings.customBgColor}
                     onChange={(e) => {
                       setSettings({ ...settings, customBgColor: e.target.value, colorPalette: 'custom' });
                     }}
                     className="w-10 h-10 bg-transparent border-none cursor-pointer rounded overflow-hidden"
                   />
                   <div className="w-10 h-10 rounded shadow-inner" style={{ backgroundColor: settings.customBgColor }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <label className="text-[9px] uppercase tracking-[0.3em] text-white/30 mb-4 block font-bold">02. Geometry & Motion</label>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2 items-center">
                 <label className="font-mono text-[8px] text-white/40 uppercase tracking-widest">灵敏度 (GAIN)</label>
                 <span className="font-mono text-[10px] text-white/60">{Math.round(settings.sensitivity * 100)}%</span>
              </div>
              <input 
                type="range" min="0.1" max="4.0" step="0.1"
                value={settings.sensitivity}
                onChange={(e) => setSettings({ ...settings, sensitivity: parseFloat(e.target.value) })}
                className="w-full h-px bg-white/10 appearance-none accent-white"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2 items-center">
                 <label className="font-mono text-[8px] text-white/40 uppercase tracking-widest">线宽 (WEIGHT)</label>
                 <span className="font-mono text-[10px] text-white/60">{settings.lineWeight}</span>
              </div>
              <input 
                type="range" min="0.1" max="8.0" step="0.1"
                value={settings.lineWeight}
                onChange={(e) => setSettings({ ...settings, lineWeight: parseFloat(e.target.value) })}
                className="w-full h-px bg-white/10 appearance-none accent-white"
              />
            </div>
          </div>
        </section>

        <section>
          <label className="text-[9px] uppercase tracking-[0.3em] text-white/30 mb-4 block font-bold">03. Shader Protocols</label>
          <div className="grid grid-cols-3 gap-2">
            {(['none', 'bloom', 'vhs', 'pixel', 'liquid', 'crt'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSettings({ ...settings, shaderMode: s })}
                className={`px-2 py-2 rounded-lg border text-[9px] font-mono uppercase transition-all ${
                  settings.shaderMode === s ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/5 text-white/20 hover:bg-white/5'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        <section>
          <label className="text-[9px] uppercase tracking-[0.3em] text-white/30 mb-4 block font-bold">04. Layer Overlays</label>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setSettings({ ...settings, mirrorMode: !settings.mirrorMode })}
              className={`px-3 py-2 rounded-lg border text-[9px] font-mono uppercase transition-all ${
                settings.mirrorMode ? 'bg-white/10 border-white' : 'bg-transparent border-white/5 text-white/20'
              }`}
            >Mirror</button>
            <button 
              onClick={() => setSettings({ ...settings, gridOverlay: !settings.gridOverlay })}
              className={`px-3 py-2 rounded-lg border text-[9px] font-mono uppercase transition-all ${
                settings.gridOverlay ? 'bg-white/10 border-white' : 'bg-transparent border-white/5 text-white/20'
              }`}
            >Grid</button>
            <button 
              onClick={() => setSettings({ ...settings, textGlitch: !settings.textGlitch })}
              className={`px-3 py-2 rounded-lg border text-[9px] font-mono uppercase transition-all ${
                settings.textGlitch ? 'bg-white/10 border-white' : 'bg-transparent border-white/5 text-white/20'
              }`}
            >Glitch</button>
          </div>
        </section>

        <section>
          <label className="text-[9px] uppercase tracking-[0.3em] text-white/30 mb-4 block font-bold">05. Chromatic Matrix</label>
          <div className="grid grid-cols-5 gap-2">
            {(Object.keys(PALETTES) as Array<VisualSettings['colorPalette']>).filter(p => p !== 'custom').map((p) => (
              <button
                key={p}
                onClick={() => setSettings({ ...settings, colorPalette: p })}
                className={`h-8 rounded border transition-all ${
                  settings.colorPalette === p ? 'border-white ring-1 ring-white/20' : 'border-white/10 hover:border-white/30'
                }`}
                style={{ backgroundColor: PALETTES[p].primary }}
                title={p.toUpperCase()}
              />
            ))}
          </div>
        </section>

        <section>
          <label className="text-[9px] uppercase tracking-[0.3em] text-white/30 mb-4 block font-bold">06. Post-Processing Matrix</label>
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[8px] text-white/20 uppercase tracking-widest block mb-1">Persistence</label>
                  <input 
                    type="range" min="0" max="1" step="0.01"
                    value={settings.trailAmount}
                    onChange={(e) => setSettings({ ...settings, trailAmount: parseFloat(e.target.value) })}
                    className="w-full h-px bg-white/10 appearance-none accent-white"
                  />
                </div>
                <div>
                  <label className="font-mono text-[8px] text-white/20 uppercase tracking-widest block mb-1">Pulse</label>
                  <input 
                    type="range" min="0" max="2" step="0.1"
                    value={settings.pulseStrength}
                    onChange={(e) => setSettings({ ...settings, pulseStrength: parseFloat(e.target.value) })}
                    className="w-full h-px bg-white/10 appearance-none accent-white"
                  />
                </div>
             </div>
             
             <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-mono text-[7px] text-white/20 uppercase block mb-1">Hue</label>
                  <input 
                    type="range" min="0" max="360" step="1"
                    value={settings.hueShift}
                    onChange={(e) => setSettings({ ...settings, hueShift: parseFloat(e.target.value) })}
                    className="w-full h-px bg-white/10 appearance-none accent-white"
                  />
                </div>
                <div>
                  <label className="font-mono text-[7px] text-white/20 uppercase block mb-1">Sat</label>
                  <input 
                    type="range" min="0" max="2" step="0.1"
                    value={settings.saturation}
                    onChange={(e) => setSettings({ ...settings, saturation: parseFloat(e.target.value) })}
                    className="w-full h-px bg-white/10 appearance-none accent-white"
                  />
                </div>
                <div>
                  <label className="font-mono text-[7px] text-white/20 uppercase block mb-1">Con</label>
                  <input 
                    type="range" min="0.5" max="1.5" step="0.05"
                    value={settings.contrast}
                    onChange={(e) => setSettings({ ...settings, contrast: parseFloat(e.target.value) })}
                    className="w-full h-px bg-white/10 appearance-none accent-white"
                  />
                </div>
             </div>
          </div>
        </section>

        <section>
          <label className="text-[9px] uppercase tracking-[0.3em] text-white/30 mb-4 block font-bold">视觉修改器 (MODIFIERS)</label>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2 text-[8px]">
                 <label className="font-mono text-white/20 uppercase tracking-widest">强度 (STRENGTH)</label>
                 <span className="font-mono text-white/60">{Math.round(settings.effectStrength * 100)}</span>
              </div>
              <input 
                type="range" min="0" max="2.0" step="0.01"
                value={settings.effectStrength}
                onChange={(e) => setSettings({ ...settings, effectStrength: parseFloat(e.target.value) })}
                className="w-full h-px bg-white/10 appearance-none accent-white"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2 text-[8px]">
                 <label className="font-mono text-white/20 uppercase tracking-widest">速度 (SPEED)</label>
                 <span className="font-mono text-white/60">{Math.round(settings.rotationSpeed * 50)}</span>
              </div>
              <input 
                type="range" min="0" max="4.0" step="0.1"
                value={settings.rotationSpeed}
                onChange={(e) => setSettings({ ...settings, rotationSpeed: parseFloat(e.target.value) })}
                className="w-full h-px bg-white/10 appearance-none accent-white"
              />
            </div>
          </div>
        </section>

        <section>
          <label className="text-[9px] uppercase tracking-[0.3em] text-white/30 mb-4 block font-bold">可变轴混合器 (WEIGHTS)</label>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2 text-[8px]">
                 <label className="font-mono text-white/20 uppercase tracking-widest">字重 (TEXT WEIGHT)</label>
                 <span className="font-mono text-white/60">{settings.textWeight}</span>
              </div>
              <input 
                type="range" min="100" max="900" step="50"
                value={settings.textWeight}
                onChange={(e) => setSettings({ ...settings, textWeight: parseInt(e.target.value) })}
                className="w-full h-px bg-white/10 appearance-none accent-white"
              />
            </div>
          </div>
        </section>

        <section>
          <label className="text-[9px] uppercase tracking-[0.3em] text-white/30 mb-4 block font-bold">系统设置 (SYSTEMS)</label>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2 items-center">
                 <label className="font-mono text-[8px] text-white/40 uppercase tracking-widest">UI 字体大小</label>
                 <span className="font-mono text-[10px] text-white/60">{settings.uiFontSize}</span>
              </div>
              <input 
                type="range" min="8" max="16" step="1"
                value={settings.uiFontSize}
                onChange={(e) => setSettings({ ...settings, uiFontSize: parseInt(e.target.value) })}
                className="w-full h-px bg-white/10 appearance-none accent-white"
              />
            </div>
            <div className="flex items-center justify-between py-2">
               <label className="text-[9px] text-white/40 uppercase tracking-widest">自适应大小</label>
               <button 
                 onClick={() => setSettings({ ...settings, autoSize: !settings.autoSize })}
                 className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${settings.autoSize ? 'bg-white' : 'bg-white/10'}`}
               >
                  <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${settings.autoSize ? 'right-1 bg-black' : 'left-1 bg-white/40'}`} />
               </button>
            </div>
          </div>
        </section>

        <section className="mt-auto pt-4 border-t border-white/5">
          <div className={`p-4 border rounded-xl transition-all duration-300 ${intensity > 150 ? 'bg-neon-pink/10 border-neon-pink/30 shadow-[0_0_20px_rgba(255,34,102,0.1)]' : 'bg-white/5 border-white/10'}`}>
            <div className={`text-[9px] font-bold mb-1 uppercase tracking-widest transition-colors ${intensity > 150 ? 'text-neon-pink' : 'text-white/40'}`}>Reactive State</div>
            <div className={`font-display tracking-tight transition-colors ${intensity > 150 ? 'text-white' : 'text-white/60'}`} style={{ fontSize: `${settings.uiFontSize + 2}px` }}>
              {intensity > 150 ? 'Hyper-Dynamic (Peak)' : 'Stable Baseline'}
            </div>
          </div>
        </section>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Footer HUD */}
        <footer className="mt-auto h-40 border-t border-white/10 bg-black/40 backdrop-blur-md flex items-center px-12 gap-12 z-20">
          <div className="flex flex-col gap-4">
            <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">Master Output</div>
            <div className="flex items-end gap-1.5 h-20">
              {Array.from({ length: 24 }).map((_, i) => {
                const active = (intensity / 255) * 24 > i;
                const isPeak = i > 18;
                return (
                  <motion.div 
                    key={i} 
                    initial={false}
                    animate={{ 
                      height: active ? `${Math.max(10, Math.random() * 100)}%` : '10%',
                      backgroundColor: active ? (isPeak ? '#ff2266' : '#ffffff') : '#ffffff1a'
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="w-1.5 rounded-t-sm"
                  />
                );
              })}
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="flex justify-between items-end">
              <div className="font-mono text-3xl tracking-tighter flex items-baseline gap-2">
                {Math.round(intensity * 0.6 + 60)} 
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Estimated BPM</span>
              </div>
              <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                 Signal Stream Active
              </div>
            </div>
            
            <div className="space-y-4">
               <div>
                 <input 
                   type="text"
                   placeholder="IDENTIFIER_TAG..."
                   value={settings.textOverlay}
                   onChange={(e) => setSettings({ ...settings, textOverlay: e.target.value.toUpperCase() })}
                   className="w-full bg-transparent border-b border-white/10 px-0 py-2 font-mono text-xs text-white focus:outline-none focus:border-neon-pink transition-colors placeholder:text-white/10 uppercase tracking-widest"
                 />
               </div>
               <div className="h-[2px] w-full bg-white/5 overflow-hidden rounded-full relative">
                 <motion.div 
                   className="h-full bg-white"
                   animate={{ width: `${(intensity/255) * 100}%` }}
                 />
               </div>
            </div>
          </div>

          <div className="w-48 h-full border-l border-white/10 flex flex-col justify-center pl-12 gap-4">
             <button 
               onClick={onStop}
               className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all hover:scale-110 active:scale-95 group"
             >
                <Square className="w-5 h-5 fill-current" />
             </button>
             <div className="text-[9px] text-white/20 font-mono uppercase tracking-widest">System Stop</div>
          </div>
        </footer>
      </div>
    </>
  );
}
