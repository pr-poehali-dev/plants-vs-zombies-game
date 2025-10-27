const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

export const playSound = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
  if (!audioContext) return;
  
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (e) {
    console.warn('Sound playback failed:', e);
  }
};

export const sounds = {
  plant: () => playSound(800, 0.1, 'sine'),
  shoot: () => playSound(400, 0.05, 'square'),
  zombieHit: () => playSound(200, 0.1, 'sawtooth'),
  sunCollect: () => playSound(1000, 0.15, 'sine'),
  zombieEat: () => playSound(150, 0.2, 'sawtooth'),
  win: () => {
    playSound(523, 0.15, 'sine');
    setTimeout(() => playSound(659, 0.15, 'sine'), 150);
    setTimeout(() => playSound(784, 0.3, 'sine'), 300);
  },
  lose: () => {
    playSound(400, 0.2, 'sawtooth');
    setTimeout(() => playSound(300, 0.2, 'sawtooth'), 200);
    setTimeout(() => playSound(200, 0.4, 'sawtooth'), 400);
  },
  shovel: () => playSound(300, 0.1, 'square'),
  buttonClick: () => playSound(600, 0.05, 'square'),
};

export default sounds;
