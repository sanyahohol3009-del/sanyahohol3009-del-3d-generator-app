export type VoiceMode = 'QUIET' | 'IMPORTANT' | 'TEAM' | 'CHAOS_LAB' | 'DEBUG';
export type VoiceImportance = 'DEBUG' | 'TEAM' | 'IMPORTANT' | 'CRITICAL';
export type VoiceChannel = 'conversation' | 'event' | 'debug';

const MODES: VoiceMode[] = ['QUIET', 'IMPORTANT', 'TEAM', 'CHAOS_LAB', 'DEBUG'];
const rank: Record<VoiceImportance, number> = { DEBUG: 0, TEAM: 1, IMPORTANT: 2, CRITICAL: 3 };

class VoiceClient {
  private key = 'maksimar.golem.voice_mode';

  getMode(): VoiceMode {
    const value = localStorage.getItem(this.key) as VoiceMode | null;
    return MODES.includes(value as VoiceMode) ? (value as VoiceMode) : 'TEAM';
  }

  setMode(mode: VoiceMode): VoiceMode {
    localStorage.setItem(this.key, mode);
    return mode;
  }

  cycleMode(): VoiceMode {
    const current = this.getMode();
    return this.setMode(MODES[(MODES.indexOf(current) + 1) % MODES.length]);
  }

  description(mode = this.getMode()): string {
    switch (mode) {
      case 'QUIET': return 'automatic speech disabled';
      case 'IMPORTANT': return 'waiting-input, verified, warning and error';
      case 'TEAM': return 'normal GOLEM dialogue plus important events';
      case 'CHAOS_LAB': return 'verbose bounded organ dialogue, excluding raw debug narration';
      case 'DEBUG': return 'all dialogue plus technical/debug narration';
    }
  }

  supported(): boolean {
    return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  stop(): void {
    if (this.supported()) window.speechSynthesis.cancel();
  }

  private shouldSpeak(mode: VoiceMode, importance: VoiceImportance, channel: VoiceChannel, force: boolean): boolean {
    if (force) return true;
    if (mode === 'QUIET') return false;
    if (mode === 'IMPORTANT') return rank[importance] >= rank.IMPORTANT;
    if (mode === 'TEAM') return channel !== 'debug' && rank[importance] >= rank.TEAM;
    if (mode === 'CHAOS_LAB') return channel !== 'debug';
    return true;
  }

  async speak(
    text: string,
    importance: VoiceImportance = 'TEAM',
    force = false,
    channel: VoiceChannel = 'conversation',
  ): Promise<boolean> {
    const clean = String(text || '').trim();
    if (!clean || !this.supported()) return false;

    const mode = this.getMode();
    if (!this.shouldSpeak(mode, importance, channel, force)) return false;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(clean);
    const ru = /[\u0400-\u04ff]/.test(clean);
    utterance.lang = ru ? 'ru-RU' : 'en-US';
    utterance.rate = 0.92;
    utterance.pitch = 0.72;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const matching = voices.find((voice) => voice.lang.toLowerCase().startsWith(ru ? 'ru' : 'en'));
    if (matching) utterance.voice = matching;

    // TTS speaks exactly the text produced by GOLEM's response path.
    window.speechSynthesis.speak(utterance);
    return true;
  }
}

export const voiceClient = new VoiceClient();
