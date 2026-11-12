// Original synthesized cues: no audio downloads and no dependency on connectivity.
// Create/resume from a gesture so Web Audio works in the installed iPhone PWA.
export function createSoundPlayer() {
  let context;
  let generation = 0;
  const active = new Set();
  function unlock() {
    try {
      const AudioContext = globalThis.AudioContext ?? globalThis.webkitAudioContext;
      if (!AudioContext) return Promise.resolve(false);
      context ??= new AudioContext();
      return (context.state !== 'running' ? context.resume() : Promise.resolve())
        .then(() => context.state === 'running')
        .catch(() => false);
    } catch {
      return Promise.resolve(false);
    }
  }
  function stop() {
    generation++;
    for (const note of active) {
      try {
        note.stop();
      } catch {
        /* A finished note is already silent. */
      }
    }
    active.clear();
  }
  function play(correct) {
    stop();
    const token = generation;
    // unlock() executes synchronously until resume() has been called.
    void unlock().then((ready) => {
      if (!ready || token !== generation) return;
      const notes = correct ? [523.25, 659.25, 783.99, 1046.5] : [392, 329.63];
      try {
        notes.forEach((frequency, index) => {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          const at = context.currentTime + index * (correct ? 0.085 : 0.13);
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(frequency, at);
          gain.gain.setValueAtTime(0, at);
          gain.gain.linearRampToValueAtTime(0.12, at + 0.012);
          gain.gain.exponentialRampToValueAtTime(0.001, at + 0.27);
          oscillator.connect(gain);
          gain.connect(context.destination);
          active.add(oscillator);
          oscillator.onended = () => {
            active.delete(oscillator);
            oscillator.disconnect();
            gain.disconnect();
          };
          oscillator.start(at);
          oscillator.stop(at + 0.3);
        });
      } catch {
        stop();
      } // An unavailable audio device must never block the game.
    });
  }
  return { unlock, play, stop };
}
