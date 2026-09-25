// lib/sound.ts

export function playSaveSuccessSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return

    const ctx = new AudioContext()

    // إنتاج نغمتين ناعمتين متتابعتين (Soft Dual-Tone Chime)
    const now = ctx.currentTime

    // النغمة الأولى
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = "sine"
    osc1.frequency.setValueAtTime(523.25, now) // نغمة C5
    gain1.gain.setValueAtTime(0.08, now) // مستوى صوت هادئ
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.15)

    // النغمة الثانية (أعلى قليلاً لإعطاء شعور بالنجاح)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = "sine"
    osc2.frequency.setValueAtTime(659.25, now + 0.08) // نغمة E5
    gain2.gain.setValueAtTime(0.1, now + 0.08)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.08)
    osc2.stop(now + 0.3)
  } catch (e) {
    // تجاهل أخطاء تشغيل الصوت في حال تقييد المتصفح
  }
}