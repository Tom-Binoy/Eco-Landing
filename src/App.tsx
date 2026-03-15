import { useState, useEffect, useRef } from 'react'
import './index.css'

// ── Fonts ──────────────────────────────────────────────────────────────────
const FontLoader = () => (
  <link
    href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap"
    rel="stylesheet"
  />
)

// ── Design tokens (mirrors the app exactly) ────────────────────────────────
const T = {
  bg:          '#0f0e0b',
  bgCard:      '#1a1917',
  bgCardHover: '#201f1c',
  bgMid:       '#161512',
  text:        '#eeeeee',
  textMuted:   '#9a9893',
  textFaint:   '#5a5855',
  border:      'rgba(255,255,255,0.07)',
  borderHover: 'rgba(255,255,255,0.13)',
  green:       '#22c55e',
  greenDark:   '#16a34a',
  greenGlow:   'rgba(34,197,94,0.18)',
  greenGlowBig:'rgba(34,197,94,0.10)',
  userBubble:  '#393937',
  subBg:       '#252420',
  accent:      '#22c55e',
}

// ── Chat demo simulation ───────────────────────────────────────────────────
type ChatMsg = { role: 'user' | 'eco'; text: string; delay: number }

const DEMO_CONVERSATION: ChatMsg[] = [
  { role: 'user', text: 'Did 4 sets of bench press, 80kg', delay: 0    },
  { role: 'eco',  text: 'Nice — same weight as last Tuesday. Logged. ✓', delay: 1400 },
  { role: 'user', text: 'Then 3 sets of cable rows, felt heavy', delay: 2800 },
  { role: 'eco',  text: "Heavy is good. That's 15% more volume than last week.", delay: 4200 },
  { role: 'user', text: 'Also 20 pushups at the end, bodyweight', delay: 5600 },
  { role: 'eco',  text: "Logged. Session saved — chest + back day done. 💪", delay: 7000 },
]

// ── Chat Demo Component ────────────────────────────────────────────────────
function ChatDemo() {
  const [visibleCount, setVisibleCount] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const [_inputIdx, setInputIdx] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    const schedule = () => {
      DEMO_CONVERSATION.forEach((msg, idx) => {
        const showAt = msg.delay
        const isEco = msg.role === 'eco'

        if (isEco) {
          // Show typing dots first, then reveal
          setTimeout(() => setIsTyping(true), showAt - 800)
          setTimeout(() => {
            setIsTyping(false)
            setVisibleCount(idx + 1)
          }, showAt)
        } else {
          // Animate typing the user message
          setTimeout(() => {
            setInputIdx(idx)
            let charIdx = 0
            const interval = setInterval(() => {
              charIdx++
              setInputVal(msg.text.slice(0, charIdx))
              if (charIdx >= msg.text.length) {
                clearInterval(interval)
                setTimeout(() => {
                  setVisibleCount(idx + 1)
                  setInputVal('')
                }, 600)
              }
            }, 28)
          }, showAt - msg.text.length * 28 - 700)
        }
      })

      // Restart after full cycle
      const totalDuration = DEMO_CONVERSATION[DEMO_CONVERSATION.length - 1].delay + 3000
      setTimeout(() => {
        setVisibleCount(0)
        setInputVal('')
        setInputIdx(0)
        started.current = false
        setTimeout(schedule, 400)
      }, totalDuration)
    }

    schedule()
  }, [])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  }, [visibleCount, isTyping])

  const visibleMsgs = DEMO_CONVERSATION.slice(0, visibleCount)

  return (
    <div style={{
      background: T.bgCard,
      border: `1px solid ${T.border}`,
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
      width: '100%',
      maxWidth: '380px',
      fontFamily: 'Georgia, serif',
    }}>
      {/* Header bar */}
      <div style={{
        background: T.bgMid,
        borderBottom: `1px solid ${T.border}`,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: `linear-gradient(135deg, ${T.greenDark}, ${T.green})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.04em',
          color: '#fff', flexShrink: 0,
          boxShadow: `0 0 0 2px ${T.greenGlow}`,
        }}>E</div>
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.text }}>Eco</p>
          <p style={{ margin: 0, fontSize: 11, color: T.green }}>● Active</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} style={{ padding: '16px', minHeight: 280, maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {visibleMsgs.map((msg, i) => (
          <div
            key={i}
            className="chat-bubble-in"
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div style={{
              maxWidth: '82%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user' ? T.userBubble : T.subBg,
              border: msg.role === 'eco' ? `1px solid ${T.border}` : 'none',
              fontSize: 13,
              lineHeight: 1.6,
              color: T.text,
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', gap: 5, alignItems: 'center', height: 24, paddingLeft: 4 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%',
                background: T.green,
                animation: `typingDot 1.2s infinite`,
                animationDelay: `${i * 0.2}s`,
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <div style={{
        borderTop: `1px solid ${T.border}`,
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: T.bgMid,
      }}>
        <div style={{
          flex: 1,
          background: T.bgCard,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: '8px 12px',
          fontSize: 13,
          color: inputVal ? T.text : T.textFaint,
          minHeight: 36,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'Georgia, serif',
        }}>
          {inputVal || 'What did you train today?'}
        </div>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: inputVal ? T.green : T.bgCard,
          border: `1px solid ${inputVal ? T.green : T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: inputVal ? '#fff' : T.textFaint,
          fontSize: 15, flexShrink: 0,
          transition: 'all 0.2s ease',
          boxShadow: inputVal ? `0 2px 12px ${T.greenGlow}` : 'none',
        }}>↑</div>
      </div>
    </div>
  )
}

// ── Problem card ────────────────────────────────────────────────────────────
function ProblemCard({ icon, pain, fix }: { icon: string; pain: string; fix: string }) {
  return (
    <div style={{
      background: T.bgCard,
      border: `1px solid ${T.border}`,
      borderRadius: 16,
      padding: '24px',
      transition: 'all 0.25s ease',
    }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.borderColor = T.borderHover
        el.style.background = T.bgCardHover
        el.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.borderColor = T.border
        el.style.background = T.bgCard
        el.style.transform = ''
      }}
    >
      <p style={{ margin: '0 0 12px', fontSize: 28 }}>{icon}</p>
      <p style={{
        margin: '0 0 8px',
        fontFamily: "'DM Serif Display', Georgia, serif",
        fontSize: 15,
        color: T.textMuted,
        textDecoration: 'line-through',
        fontStyle: 'italic',
      }}>{pain}</p>
      <p style={{
        margin: 0,
        fontFamily: 'Georgia, serif',
        fontSize: 15,
        color: T.text,
        lineHeight: 1.6,
      }}>{fix}</p>
    </div>
  )
}

// ── Step row ────────────────────────────────────────────────────────────────
function StepRow({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        border: `1px solid ${T.border}`,
        background: T.bgCard,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 20, letterSpacing: '0.04em',
        color: T.green, flexShrink: 0,
        boxShadow: `0 0 0 6px ${T.greenGlowBig}`,
      }}>{num}</div>
      <div>
        <p style={{ margin: '0 0 4px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: '0.04em', color: T.text }}>{title}</p>
        <p style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: 14, color: T.textMuted, lineHeight: 1.65 }}>{body}</p>
      </div>
    </div>
  )
}

// ── Pricing card ────────────────────────────────────────────────────────────
function PricingCard({
  tier, price, period, features, cta, highlight,
  onCta,
}: {
  tier: string; price: string; period: string; features: string[];
  cta: string; highlight: boolean; onCta: () => void;
}) {
  return (
    <div style={{
      background: highlight ? `linear-gradient(160deg, #1a2e1d 0%, #131a14 100%)` : T.bgCard,
      border: `1px solid ${highlight ? T.green : T.border}`,
      borderRadius: 20,
      padding: '32px 28px',
      position: 'relative',
      boxShadow: highlight ? `0 0 40px ${T.greenGlowBig}` : 'none',
      flex: 1,
      minWidth: 260,
    }}>
      {highlight && (
        <div style={{
          position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
          background: T.green, color: '#0f0e0b',
          fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          padding: '4px 14px', borderRadius: 20,
        }}>
          Coming Soon
        </div>
      )}
      <p style={{ margin: '0 0 4px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: '0.15em', color: highlight ? T.green : T.textFaint, textTransform: 'uppercase' }}>{tier}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '0 0 6px' }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: '0.02em', color: T.text, lineHeight: 1 }}>{price}</span>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 13, color: T.textMuted }}>{period}</span>
      </div>
      <div style={{ width: 40, height: 1, background: highlight ? T.green : T.border, margin: '0 0 24px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ color: highlight ? T.green : T.textFaint, fontSize: 13, marginTop: 1, flexShrink: 0 }}>✓</span>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: 14, color: highlight ? T.text : T.textMuted, lineHeight: 1.5 }}>{f}</span>
          </div>
        ))}
      </div>
      <button
        onClick={onCta}
        style={{
          width: '100%', padding: '14px', borderRadius: 12,
          border: highlight ? 'none' : `1px solid ${T.border}`,
          background: highlight ? T.green : 'transparent',
          color: highlight ? '#0f0e0b' : T.textMuted,
          fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: highlight ? `0 4px 20px ${T.greenGlow}` : 'none',
        }}
        onMouseEnter={e => {
          if (highlight) {
            e.currentTarget.style.background = '#16a34a'
            e.currentTarget.style.transform = 'translateY(-1px)'
          } else {
            e.currentTarget.style.borderColor = T.borderHover
            e.currentTarget.style.color = T.text
          }
        }}
        onMouseLeave={e => {
          if (highlight) {
            e.currentTarget.style.background = T.green
            e.currentTarget.style.transform = ''
          } else {
            e.currentTarget.style.borderColor = T.border
            e.currentTarget.style.color = T.textMuted
          }
        }}
      >
        {cta}
      </button>
    </div>
  )
}

// ── Waitlist Modal ──────────────────────────────────────────────────────────
function WaitlistModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    // In a real build: POST to your backend or Formspree/Resend etc.
    // For now, just show success state.
    setSubmitted(true)
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(15,14,11,0.85)',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div style={{
        background: T.bgCard,
        border: `1px solid ${T.border}`,
        borderRadius: 20,
        padding: '36px 32px',
        width: '100%', maxWidth: 420,
        boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        animation: 'fadeUp 0.3s ease',
        position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 32, height: 32, borderRadius: '50%',
            border: `1px solid ${T.border}`, background: 'transparent',
            color: T.textFaint, cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>

        {!submitted ? (
          <>
            <p style={{ margin: '0 0 4px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 11, letterSpacing: '0.15em', color: T.green, textTransform: 'uppercase' }}>Early Access</p>
            <p style={{ margin: '0 0 8px', fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 26, color: T.text, lineHeight: 1.2 }}>
              Be the first to try Eco Track.
            </p>
            <p style={{ margin: '0 0 24px', fontFamily: 'Georgia, serif', fontSize: 14, color: T.textMuted, lineHeight: 1.65 }}>
              We're onboarding users slowly. Drop your email and we'll reach out when a spot opens.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
                style={{
                  width: '100%', padding: '14px 16px',
                  borderRadius: 12, border: `1px solid ${error ? '#ef4444' : T.border}`,
                  background: T.bg, color: T.text,
                  fontFamily: 'Georgia, serif', fontSize: 15,
                  outline: 'none',
                }}
              />
              {error && <p style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: 12, color: '#ef4444' }}>{error}</p>}
              <button
                onClick={handleSubmit}
                style={{
                  width: '100%', padding: '14px',
                  borderRadius: 12, border: 'none',
                  background: T.green, color: '#0f0e0b',
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15,
                  cursor: 'pointer',
                  boxShadow: `0 4px 20px ${T.greenGlow}`,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#16a34a'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = T.green; e.currentTarget.style.transform = '' }}
              >
                Join Waitlist →
              </button>
            </div>
            <p style={{ margin: '16px 0 0', fontFamily: 'Georgia, serif', fontSize: 12, color: T.textFaint, textAlign: 'center' }}>
              No spam. No newsletters. Just a heads-up when you're in.
            </p>
          </>
        ) : (
          <div style={{ textAlign: 'center', animation: 'fadeUp 0.3s ease' }}>
            <p style={{ margin: '0 0 12px', fontSize: 40 }}>🎉</p>
            <p style={{ margin: '0 0 8px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: '0.05em', color: T.green }}>You're in.</p>
            <p style={{ margin: '0 0 24px', fontFamily: 'Georgia, serif', fontSize: 15, color: T.textMuted, lineHeight: 1.65 }}>
              We'll reach out to <strong style={{ color: T.text }}>{email}</strong> when your spot is ready.
            </p>
            <button
              onClick={onClose}
              style={{
                padding: '12px 32px', borderRadius: 12, border: 'none',
                background: T.green, color: '#0f0e0b',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14,
                cursor: 'pointer', boxShadow: `0 4px 20px ${T.greenGlow}`,
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [showModal, setShowModal] = useState(false)

  const openModal = () => setShowModal(true)
  const closeModal = () => setShowModal(false)

  return (
    <>
      <FontLoader />
      <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, overflowX: 'hidden' }}>

        {/* ── Ambient glow backdrop ────────────────────────────── */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: `radial-gradient(ellipse 80% 60% at 50% -10%, rgba(34,197,94,0.07) 0%, transparent 70%)`,
        }} />

        {/* ── Nav ─────────────────────────────────────────────── */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 100,
          borderBottom: `1px solid ${T.border}`,
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          background: 'rgba(15,14,11,0.85)',
          padding: '0 24px', height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          maxWidth: 1100, margin: '0 auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: `linear-gradient(135deg, ${T.greenDark}, ${T.green})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, color: '#fff',
              boxShadow: `0 0 12px ${T.greenGlow}`,
            }}>E</div>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: '0.06em', color: T.text }}>ECO TRACK</span>
          </div>
          <button
            onClick={openModal}
            style={{
              padding: '8px 20px', borderRadius: 10,
              border: `1px solid ${T.green}`, background: 'transparent',
              color: T.green, fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = T.green; e.currentTarget.style.color = '#0f0e0b' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.green }}
          >
            Get Early Access
          </button>
        </nav>

        {/* ── Hero ────────────────────────────────────────────── */}
        <section style={{
          position: 'relative', zIndex: 1,
          maxWidth: 1100, margin: '0 auto',
          padding: '80px 24px 100px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
          gap: 60,
          alignItems: 'center',
        }}
          className="hero-section"
        >
          {/* Left: copy */}
          <div>
            <div
              className="animate-fade-up"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 14px', borderRadius: 20,
                border: `1px solid rgba(34,197,94,0.25)`,
                background: 'rgba(34,197,94,0.06)',
                marginBottom: 24,
              }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, display: 'block' }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: T.green, fontWeight: 500 }}>
                Currently in private beta
              </span>
            </div>

            <h1
              className="animate-fade-up delay-100"
              style={{
                margin: '0 0 20px',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 'clamp(52px, 6vw, 82px)',
                letterSpacing: '0.03em',
                lineHeight: 0.95,
                color: T.text,
              }}
            >
              Log Workouts<br />
              <span style={{ color: T.green }}>By Talking.</span>
            </h1>

            <p
              className="animate-fade-up delay-200"
              style={{
                margin: '0 0 32px',
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontStyle: 'italic',
                fontSize: 'clamp(16px, 2vw, 19px)',
                color: T.textMuted,
                lineHeight: 1.6,
                maxWidth: 420,
              }}
            >
              No forms. No menus. No friction.<br />
              Just tell Eco what you did — and it handles everything.
            </p>

            <div className="animate-fade-up delay-300" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={openModal}
                style={{
                  padding: '15px 32px', borderRadius: 14,
                  border: 'none', background: T.green,
                  color: '#0f0e0b',
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15,
                  cursor: 'pointer',
                  boxShadow: `0 4px 24px ${T.greenGlow}`,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#16a34a'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 32px ${T.greenGlow}` }}
                onMouseLeave={e => { e.currentTarget.style.background = T.green; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 4px 24px ${T.greenGlow}` }}
              >
                Join the Waitlist →
              </button>
              <a
                href="#how-it-works"
                style={{
                  padding: '15px 28px', borderRadius: 14,
                  border: `1px solid ${T.border}`, background: 'transparent',
                  color: T.textMuted,
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 15,
                  cursor: 'pointer', textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  display: 'inline-block',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHover; e.currentTarget.style.color = T.text }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted }}
              >
                See how it works
              </a>
            </div>

            <div className="animate-fade-up delay-400" style={{ marginTop: 40, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {[
                { stat: '1', label: 'sentence to log' },
                { stat: '0', label: 'forms to fill' },
                { stat: '∞', label: 'memory' },
              ].map(({ stat, label }) => (
                <div key={label}>
                  <p style={{ margin: '0 0 2px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: '0.04em', color: T.green }}>{stat}</p>
                  <p style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: 12, color: T.textFaint }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: live chat demo */}
          <div className="animate-fade-up delay-300 animate-float" style={{ display: 'flex', justifyContent: 'center' }}>
            <ChatDemo />
          </div>
        </section>

        {/* ── Problem ─────────────────────────────────────────── */}
        <section style={{
          position: 'relative', zIndex: 1,
          borderTop: `1px solid ${T.border}`,
          borderBottom: `1px solid ${T.border}`,
          background: T.bgMid,
          padding: '80px 24px',
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <p style={{ margin: '0 0 8px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 11, letterSpacing: '0.2em', color: T.green, textTransform: 'uppercase', textAlign: 'center' }}>
              The Problem
            </p>
            <h2 style={{
              margin: '0 0 48px',
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 'clamp(28px, 4vw, 40px)',
              color: T.text, textAlign: 'center', lineHeight: 1.2,
            }}>
              Every workout app has the same flaw.<br />
              <em style={{ color: T.textMuted }}>You have to adapt to it.</em>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <ProblemCard
                icon="🧭"
                pain="Too much setup"
                fix="No setup. Open the app, start talking. Eco figures out the rest."
              />
              <ProblemCard
                icon="📋"
                pain="Endless forms"
                fix={`Type "did 5x5 squats 100kg" and you're done. One sentence.`}
              />
              <ProblemCard
                icon="🎯"
                pain="Rigid goals that guilt-trip"
                fix="Eco understands context — tired, sick, busy. No streaks, no red warnings."
              />
              <ProblemCard
                icon="🧠"
                pain="Generic advice"
                fix="Eco remembers your history, learns your patterns, and adapts to you."
              />
            </div>
          </div>
        </section>

        {/* ── How it works ────────────────────────────────────── */}
        <section
          id="how-it-works"
          style={{
            position: 'relative', zIndex: 1,
            padding: '80px 24px',
          }}
        >
          <div className="how-it-works-grid" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 80, alignItems: 'center' }}>
            {/* Steps */}
            <div>
              <p style={{ margin: '0 0 8px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 11, letterSpacing: '0.2em', color: T.green, textTransform: 'uppercase' }}>
                How it works
              </p>
              <h2 style={{ margin: '0 0 40px', fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 'clamp(26px, 3.5vw, 36px)', color: T.text, lineHeight: 1.25 }}>
                Log a full session<br /><em style={{ color: T.textMuted }}>in under 30 seconds.</em>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                <StepRow
                  num="1"
                  title="Open Eco Track"
                  body="No login friction. You land straight in the chat."
                />
                <StepRow
                  num="2"
                  title="Tell Eco what you did"
                  body="Natural language — just like texting a friend. Sets, reps, weight, duration. Whatever you trained."
                />
                <StepRow
                  num="3"
                  title="Review & confirm"
                  body="Eco parses it into a clean card. You tweak anything or just confirm."
                />
                <StepRow
                  num="4"
                  title="Eco remembers everything"
                  body='Next time: "same bench as last Tuesday" — and it knows exactly what that means.'
                />
              </div>
            </div>

            {/* Workout card preview */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                background: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: 20,
                padding: '24px',
                width: '100%', maxWidth: 340,
                boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
                fontFamily: 'Georgia, serif',
              }}>
                <p style={{ margin: '0 0 3px', fontSize: 9, fontWeight: 700, color: T.textFaint, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Exercise</p>
                <p style={{ margin: '0 0 18px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: '0.04em', color: T.text }}>Bench Press</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 18 }}>
                  {[
                    { label: 'SETS', val: '5' },
                    { label: 'REPS', val: '5' },
                    { label: 'WT · KG', val: '80' },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ background: T.subBg, borderRadius: 10, padding: '10px 12px' }}>
                      <p style={{ margin: '0 0 2px', fontSize: 8, fontWeight: 700, color: T.textFaint, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</p>
                      <p style={{ margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: '0.03em', color: T.text }}>{val}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{
                    padding: '12px 16px', borderRadius: 10,
                    border: `1px solid ${T.border}`, background: 'transparent',
                    color: T.textMuted, fontFamily: 'Georgia, serif', fontSize: 13,
                    cursor: 'pointer',
                  }}>Discard</button>
                  <button style={{
                    flex: 1, padding: '12px', borderRadius: 10,
                    border: 'none', background: T.green,
                    color: '#0f0e0b', fontFamily: 'Georgia, serif',
                    fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    boxShadow: `0 3px 14px ${T.greenGlow}`,
                  }}>Confirm ✓</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Social proof / quote ─────────────────────────────── */}
        <section style={{
          borderTop: `1px solid ${T.border}`,
          borderBottom: `1px solid ${T.border}`,
          background: T.bgMid,
          padding: '64px 24px',
          position: 'relative', zIndex: 1,
        }}>
          <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ margin: '0 0 8px', fontSize: 24 }}>💬</p>
            <p style={{
              margin: '0 0 20px',
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 'clamp(18px, 2.5vw, 24px)',
              color: T.text,
              lineHeight: 1.55,
            }}>
              "I downloaded MyFitnessPal and never even got past the setup screen.<br />
              Eco just... works."
            </p>
            <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: T.textFaint }}>
              — Beta tester, used it every day for 3 weeks
            </p>
          </div>
        </section>

        {/* ── Pricing ─────────────────────────────────────────── */}
        <section
          id="pricing"
          style={{
            position: 'relative', zIndex: 1,
            padding: '80px 24px',
          }}
        >
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <p style={{ margin: '0 0 8px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 11, letterSpacing: '0.2em', color: T.green, textTransform: 'uppercase', textAlign: 'center' }}>
              Pricing
            </p>
            <h2 style={{ margin: '0 0 12px', fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 'clamp(28px, 4vw, 40px)', color: T.text, textAlign: 'center', lineHeight: 1.2 }}>
              Start free. Upgrade when it clicks.
            </h2>
            <p style={{ margin: '0 0 48px', fontFamily: 'Georgia, serif', fontSize: 15, color: T.textMuted, textAlign: 'center', lineHeight: 1.6 }}>
              The free tier is genuinely useful — no hobbled features. Pro is for heavy users who want more.
            </p>
            <div className="pricing-row" style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <PricingCard
                tier="Free"
                price="£0"
                period="forever"
                features={[
                  'Conversational workout logging',
                  '7-day workout history',
                  'Basic analytics',
                  'Faster AI (GPT-3.5)',
                ]}
                cta="Start Free →"
                highlight={false}
                onCta={openModal}
              />
              <PricingCard
                tier="Pro"
                price="£4"
                period="/ month"
                features={[
                  'Everything in Free',
                  'Unlimited workout history',
                  'Smarter AI (GPT-4 level)',
                  'Workout planning & suggestions',
                  'Export data (CSV)',
                  'Priority support',
                ]}
                cta="Join Waitlist for Pro →"
                highlight={true}
                onCta={openModal}
              />
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────── */}
        <section style={{
          borderTop: `1px solid ${T.border}`,
          position: 'relative', zIndex: 1,
          padding: '100px 24px',
          textAlign: 'center',
          background: `radial-gradient(ellipse 60% 50% at 50% 100%, rgba(34,197,94,0.06) 0%, transparent 70%)`,
        }}>
          <p style={{ margin: '0 0 4px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 11, letterSpacing: '0.2em', color: T.green, textTransform: 'uppercase' }}>
            Ready?
          </p>
          <h2 style={{
            margin: '0 0 16px',
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(48px, 7vw, 88px)',
            letterSpacing: '0.03em',
            lineHeight: 0.95,
            color: T.text,
          }}>
            Stop logging.<br /><span style={{ color: T.green }}>Start talking.</span>
          </h2>
          <p style={{ margin: '0 0 36px', fontFamily: 'Georgia, serif', fontSize: 16, color: T.textMuted, lineHeight: 1.65 }}>
            Join the waitlist and we'll let you know when your spot is ready.
          </p>
          <button
            onClick={openModal}
            style={{
              padding: '17px 44px', borderRadius: 14,
              border: 'none', background: T.green,
              color: '#0f0e0b',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16,
              cursor: 'pointer',
              boxShadow: `0 4px 32px ${T.greenGlow}`,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#16a34a'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${T.greenGlow}` }}
            onMouseLeave={e => { e.currentTarget.style.background = T.green; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 4px 32px ${T.greenGlow}` }}
          >
            Join Waitlist — It's Free →
          </button>
          <p style={{ margin: '16px 0 0', fontFamily: 'Georgia, serif', fontSize: 12, color: T.textFaint }}>
            No card required. No spam. Just early access.
          </p>
        </section>

        {/* ── Footer ──────────────────────────────────────────── */}
        <footer style={{
          borderTop: `1px solid ${T.border}`,
          padding: '28px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          maxWidth: 1100, margin: '0 auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 6,
              background: `linear-gradient(135deg, ${T.greenDark}, ${T.green})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 11, color: '#fff',
            }}>E</div>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: '0.06em', color: T.textFaint }}>ECO TRACK</span>
          </div>
          <p style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: 12, color: T.textFaint }}>
            Built by a 16-year-old. Feedback welcome.
          </p>
        </footer>
      </div>

      {/* ── Responsive overrides via style tag ─────────────── */}
      <style>{`
        html { scroll-behavior: smooth; }

        @media (max-width: 768px) {
          .hero-section {
            grid-template-columns: 1fr !important;
            padding: 48px 20px 60px !important;
            gap: 40px !important;
          }
          .how-it-works-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .pricing-row {
            flex-direction: column !important;
          }
        }
      `}</style>

      {/* ── Waitlist modal ───────────────────────────────────── */}
      {showModal && <WaitlistModal onClose={closeModal} />}
    </>
  )
}
