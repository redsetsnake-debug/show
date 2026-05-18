/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';
import Visualizer from './components/Visualizer';
import Controls from './components/Controls';
import { VisualSettings } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { isActive, startAnalyzer, stopAnalyzer, analyser, dataArray, averageIntensity } = useAudioAnalyzer();
  
  const [settings, setSettings] = useState<VisualSettings>({
    mode: 'orbital',
    shaderMode: 'none',
    sensitivity: 1.0,
    colorPalette: 'neon',
    particleCount: 150,
    textOverlay: '',
    glowAmount: 1.0,
    rotationSpeed: 1.0,
    lineWeight: 1.0,
    textScale: 1.0,
    textFont: 'display',
    textWeight: 500,
    customTextColor: '#FF71CE',
    customBgColor: '#000000',
    uiFontSize: 10,
    autoSize: true,
    effectStrength: 1.0,
    mirrorMode: false,
    chromaticAberration: 0.5,
    noiseAmount: 0.2,
    gridOverlay: false,
    textGlitch: true,
    trailAmount: 0.15,
    hueShift: 0,
    saturation: 1.0,
    contrast: 1.0,
    pulseStrength: 0.5,
  });

  return (
    <div className="relative w-full h-screen bg-[#050505] text-white flex flex-col overflow-hidden font-sans select-none">
      {/* Background Atmospheric Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#3311ff] atmospheric-blur opacity-20" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[#ff2266] atmospheric-blur opacity-15" />
      </div>

      {/* Visualizer stays fixed or absolute background */}
      <div className="absolute inset-0 z-0">
        <Visualizer 
          settings={settings} 
          analyser={analyser} 
          dataArray={dataArray}
          averageIntensity={averageIntensity}
        />
      </div>

      {/* Global Overlays */}
      <div className="fixed inset-0 pointer-events-none z-10 shadow-[inset_0_0_150px_rgba(0,0,0,0.5)]" />
      <div className="fixed inset-0 pointer-events-none z-10 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      <AnimatePresence>
        {!isActive ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-[100]"
          >
            <div className="text-center max-w-md p-10 border border-white/10 rounded-3xl bg-[#0a0a0a]/50 shadow-2xl backdrop-blur-xl">
              <h2 className="font-display text-5xl font-black text-white mb-4 tracking-tighter">SYNTHESIA <span className="text-neon-pink italic">V.04</span></h2>
              <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.3em] leading-loose mb-10">
                Performative Audio Analysis Engine<br />
                Ready for data input stream
              </p>
              <button 
                onClick={startAnalyzer}
                className="group relative px-10 py-5 bg-white text-black font-mono text-xs font-bold uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all overflow-hidden"
                id="init-button"
              >
                <span className="relative z-10 transition-colors group-hover:text-neon-pink">Initialize System</span>
                <div className="absolute inset-0 bg-neon-pink opacity-0 group-hover:opacity-10 transition-opacity" />
              </button>
              <p className="mt-10 text-white/20 font-mono text-[9px] uppercase tracking-widest">
                Requires microphone access for real-time visualization
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-full z-20 relative"
          >
            <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 backdrop-blur-md bg-black/40">
              <div className="flex items-center gap-6">
                <div className="text-[10px] tracking-[0.3em] font-bold text-white/40 uppercase">Audio Engine</div>
                <div className="h-4 w-px bg-white/20" />
                <h1 className="text-xl font-light tracking-tight">SYNTHESIA <span className="font-black italic">V.04</span></h1>
              </div>
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">Signal Latency</span>
                  <span className="font-mono text-xs text-neon-green">2.4ms</span>
                </div>
                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-medium tracking-widest text-white/60">
                  LIVE PERFORMER MODE
                </div>
              </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
              <Controls 
                settings={settings} 
                setSettings={setSettings} 
                isActive={isActive}
                onStart={startAnalyzer}
                onStop={stopAnalyzer}
                intensity={averageIntensity}
              />
              
              {/* Right Floating Metadata Container - Controls will fill this too or I can put it here */}
              <div className="absolute right-8 top-12 z-30 flex flex-col items-end gap-6 pointer-events-none">
                <div className="text-right">
                  <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-1">Coordinate System</div>
                  <div className="text-[10px] font-mono text-white/60 leading-relaxed uppercase">
                    X: {(averageIntensity * 1.5).toFixed(3)}<br />
                    Y: {(averageIntensity * -2.1).toFixed(3)}<br />
                    Z: {(averageIntensity * 0.4).toFixed(3)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-1">Active Shader</div>
                  <div className="text-[10px] font-mono text-neon-green transition-colors duration-200">
                    {settings.mode === 'glitch' ? 'RAY_GLITCH_TRANS' : (settings.mode === 'nebula' ? 'PARTICLE_SOFT_EMIT' : 'FREQ_ORB_SYNTH')}
                  </div>
                </div>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
