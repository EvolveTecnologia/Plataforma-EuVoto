/**
 * Sintetizador de áudio da Urna Eletrônica Brasileira usando Web Audio API nativo.
 * Reproduz o som das teclas e o icônico som de confirmação "Pililiiiii" do TSE.
 */

class UrnaAudio {
  private ctx: AudioContext | null = null;

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Beep curto e firme ao pressionar teclas numéricas ou corrigir
   */
  public tocarBeepTecla() {
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1050, ctx.currentTime);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  /**
   * Som de alerta para número inexistente (voto nulo) ou repetição
   */
  public tocarAlertaInexistente() {
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(320, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }

  /**
   * Som oficial e inconfundível de finalização da Urna Eletrônica ("Pililiiiiii")
   * Frequências harmonizadas conforme especificações técnicas do TSE:
   * Onda com transição ascendente característica seguida de sustentação em tom agudo.
   */
  public tocarSomConfirmacaoUrna() {
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';

      // Padrão TSE: início em ~950 Hz subindo rapidamente para ~1850 Hz e sustentando
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.linearRampToValueAtTime(1850, now + 0.18);
      osc.frequency.setValueAtTime(1850, now + 1.25);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
      gain.gain.setValueAtTime(0.3, now + 1.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.36);
    } catch {}
  }
}

export const urnaAudio = new UrnaAudio();
