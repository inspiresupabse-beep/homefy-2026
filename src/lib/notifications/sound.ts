export function playReminderSound() {
  if (typeof window === "undefined") return;

  try {
    const ctx = new AudioContext();
    const playBeep = (freq: number, start: number, duration = 0.25) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.value = 0.12;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };
    playBeep(880, 0);
    playBeep(1100, 0.35);
    setTimeout(() => void ctx.close(), 900);
  } catch {
    // Audio blocked until user interaction — ignore
  }
}
