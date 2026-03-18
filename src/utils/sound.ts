// sound.ts
// 簡易的 8-bit 復古音效合成器 (使用 Web Audio API)

let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

// 播放短促的 8-bit "滴" 聲 (轉動時)
export const playTickSound = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'square'; // 8-bit 常見波形
    osc.frequency.setValueAtTime(400 + Math.random() * 200, ctx.currentTime); // 頻率稍微隨機，有拉霸感
    
    gainNode.gain.setValueAtTime(0.05, ctx.currentTime); // 音量放小
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

// 播放升級/成功的 8-bit 音效 (結果出爐時)
export const playSuccessSound = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    // 播放一小段阿爾貝提琶音 (Arpeggio)
    const notes = [440, 554, 659, 880]; // A4, C#5, E5, A5 (A Major chord)
    
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime + index * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.1 + 0.1);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(ctx.currentTime + index * 0.1);
      osc.stop(ctx.currentTime + index * 0.1 + 0.15);
    });
  } catch (e) {
    console.error("Audio play failed", e);
  }
};
