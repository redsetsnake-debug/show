import { useEffect, useRef, useState, useCallback } from 'react';

export function useAudioAnalyzer() {
  const [isActive, setIsActive] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number>(0);

  const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array(0));
  const [averageIntensity, setAverageIntensity] = useState(0);

  const startAnalyzer = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      setIsActive(true);

      const update = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        
        // Calculate average intensity for global reactions
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          sum += dataArrayRef.current[i];
        }
        const avg = sum / dataArrayRef.current.length;
        
        // Use a ref for the high-frequency tick but state for general UI markers if needed
        // However, for high-perf canvas, we usually pass the ref directly
        setAverageIntensity(avg);
        
        animationFrameRef.current = requestAnimationFrame(update);
      };

      update();
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  }, []);

  const stopAnalyzer = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsActive(false);
  }, []);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    isActive,
    startAnalyzer,
    stopAnalyzer,
    analyser: analyserRef.current,
    dataArray: dataArrayRef.current,
    averageIntensity,
  };
}
