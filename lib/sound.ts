// lib/sound.ts

/**
 * دالة لتشغيل نغمة نجاح ناعمة ومريحة للأذن عند حفظ التغييرات
 */
export function playSaveSuccessSound() {
  if (typeof window === "undefined") return

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()

    // التأكد من أن السياق جاهز للعمل
    if (ctx.state === "suspended") {
      ctx.resume()
    }

    const now = ctx.currentTime

    // 1. النغمة الأولى (نغمة هادئة - 523.25Hz / C5)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = "sine"
    osc1.frequency.setValueAtTime(523.25, now)
    
    // التلاشي الناعم
    gain1.gain.setValueAtTime(0.06, now)
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)

    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.18)

    // 2. النغمة الثانية (نغمة تأكيد مرتفعة قليلاً - 659.25Hz / E5)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = "sine"
    osc2.frequency.setValueAtTime(659.25, now + 0.07)

    // التلاشي الناعم
    gain2.gain.setValueAtTime(0.08, now + 0.07)
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.32)

    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.07)
    osc2.stop(now + 0.32)
  } catch (error) {
    // حماية النظام في حال تقييد الصوت من المتصفح
  }
}

/**
 * دالة اختيارية لصوت نقرة خفيفة جداً للضغط السريع على الأزرار
 */
export function playClickSound() {
  if (typeof window === "undefined") return

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()
    if (ctx.state === "suspended") ctx.resume()

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = "sine"
    osc.frequency.setValueAtTime(800, now)
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.03)

    gain.gain.setValueAtTime(0.03, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.03)
  } catch (error) {}
}