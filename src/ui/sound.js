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
  function sequence(
    notes,
    { spacing = 0.085, duration = 0.27, type = 'sine', volume = 0.12, glide = false } = {},
  ) {
    stop();
    const token = generation;
    // unlock() executes synchronously until resume() has been called.
    void unlock().then((ready) => {
      if (!ready || token !== generation) return;
      try {
        notes.forEach((frequency, index) => {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          const at = context.currentTime + index * spacing;
          oscillator.type = type;
          oscillator.frequency.setValueAtTime(frequency, at);
          gain.gain.setValueAtTime(0, at);
          if (glide)
            oscillator.frequency.exponentialRampToValueAtTime(frequency * 2.5, at + duration * 0.7);
          gain.gain.linearRampToValueAtTime(volume, at + 0.012);
          gain.gain.exponentialRampToValueAtTime(0.001, at + duration);
          oscillator.connect(gain);
          gain.connect(context.destination);
          active.add(oscillator);
          oscillator.onended = () => {
            active.delete(oscillator);
            oscillator.disconnect();
            gain.disconnect();
          };
          oscillator.start(at);
          oscillator.stop(at + duration + 0.03);
        });
      } catch {
        stop();
      } // An unavailable audio device must never block the game.
    });
  }
  const play = (correct) =>
    sequence(correct ? [523.25, 659.25, 783.99, 1046.5] : [392, 329.63], {
      spacing: correct ? 0.085 : 0.13,
    });
  function cue(kind, count = 5) {
    if (kind === 'tick')
      sequence([220 + (5 - count) * 65], { type: 'triangle', volume: 0.08, duration: 0.11 });
    else if (kind === 'go')
      sequence([440, 660, 880], { type: 'triangle', duration: 0.22, volume: 0.1 });
    else if (kind === 'cast')
      sequence([180, 360, 720], {
        type: 'triangle',
        duration: 0.36,
        spacing: 0.07,
        glide: true,
        volume: 0.09,
      });
    else if (kind === 'enemy-cast')
      sequence([360, 240, 160], { type: 'triangle', duration: 0.36, spacing: 0.08, volume: 0.09 });
    else if (kind === 'enemy-impact')
      sequence([130, 95, 392], { duration: 0.28, spacing: 0.06, volume: 0.1 });
    else if (kind === 'impact')
      sequence([95, 190, 760, 1046.5], {
        type: 'triangle',
        duration: 0.28,
        spacing: 0.045,
        volume: 0.11,
      });
    else play(false);
  }
  return { unlock, play, cue, stop };
}
