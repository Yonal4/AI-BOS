import { useState } from 'react'
import { C } from '../design'

export default function Landing({ onLogin, onSignup }: { onLogin: () => void; onSignup: () => void }) {
  const [authView, setAuthView] = useState<null|'login'|'signup'>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [company, setCompany] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuth = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    authView === 'signup' ? onSignup() : onLogin()
  }

  const s: Record<string,any> = {
    nav: { position:'fixed',top:0,left:0,right:0,zIndex:100,padding:'0 40px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(10,10,15,0.9)',backdropFilter:'blur(20px)',borderBottom:`0.5px solid ${C.border}` },
    logo: { display:'flex',alignItems:'center',gap:10 },
    logoIcon: { width:32,height:32,background:C.grad,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:'#fff' },
    navLinks: { display:'flex',gap:32,fontSize:14,color:C.text2 },
    hero: { minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'120px 24px 80px',position:'relative',overflow:'hidden' },
    glow1: { position:'absolute',width:800,height:800,borderRadius:'50%',background:'radial-gradient(circle,rgba(124,109,250,0.12) 0%,transparent 70%)',top:'50%',left:'50%',transform:'translate(-50%,-60%)',pointerEvents:'none' },
    glow2: { position:'absolute',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(34,211,176,0.08) 0%,transparent 70%)',top:'40%',right:'10%',pointerEvents:'none' },
    badge: { display:'inline-flex',alignItems:'center',gap:8,padding:'6px 14px',background:'rgba(124,109,250,0.12)',border:'0.5px solid rgba(124,109,250,0.3)',borderRadius:100,fontSize:13,fontWeight:500,color:C.purple2,marginBottom:32 },
    dot: { width:6,height:6,background:C.teal,borderRadius:'50%',animation:'pulse 2s infinite' },
    h1: { fontSize:'clamp(40px,7vw,80px)',fontWeight:800,lineHeight:1.05,letterSpacing:-2,marginBottom:24,maxWidth:900 },
    grad: { background:C.grad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' },
    sub: { fontSize:'clamp(16px,2vw,20px)',color:C.text2,maxWidth:600,marginBottom:48,lineHeight:1.7,fontWeight:400 },
    ctas: { display:'flex',gap:16,alignItems:'center',flexWrap:'wrap',justifyContent:'center',marginBottom:64 },
    btnPrimary: { padding:'14px 32px',background:C.purple,borderRadius:10,fontSize:16,fontWeight:600,color:'#fff',cursor:'pointer',border:'none',display:'flex',alignItems:'center',gap:8 },
    btnOutline: { padding:'14px 32px',border:`0.5px solid ${C.border2}`,borderRadius:10,fontSize:16,fontWeight:500,color:C.text2,cursor:'pointer',background:'transparent' },
    statsRow: { display:'flex',gap:48,justifyContent:'center',flexWrap:'wrap' },
    statItem: { textAlign:'center' as 'center' },
    statNum: { fontSize:28,fontWeight:700,letterSpacing:-1,background:C.grad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' },
    statLabel: { fontSize:13,color:C.text3,marginTop:2 },
  }

  const FEATURES = [
    { icon:'📊', title:'AI Sales SDR — Aria', desc:'Aria works your entire pipeline 24/7. Scores leads, drafts personalized emails, books meetings, and closes deals — all autonomously.' },
    { icon:'🎧', title:'AI Support — Marcus', desc:'Marcus handles tickets, live chat, and churn prevention. Auto-resolves 70%+ of issues. Creates KB articles from every resolved case.' },
    { icon:'📣', title:'AI Marketing — Lexi', desc:'Lexi runs campaigns, writes content, manages social media, and optimizes SEO. Campaigns launched in minutes, not weeks.' },
    { icon:'💰', title:'AI Finance — Felix', desc:'Felix tracks revenue, flags risks, builds forecasts, and generates reports. CFO-level intelligence without the CFO price tag.' },
    { icon:'⚙️', title:'AI Operations — Nova', desc:'Nova coordinates all agents, manages workflows, handles handoffs, and ensures nothing falls through the cracks.' },
    { icon:'🧠', title:'Company Brain', desc:'All your documents, SOPs, customer data, and brand voice in one shared AI memory — every agent gets smarter as you add more.' },
  ]

  const INTEGRATIONS = ['Gmail','Google Drive','Slack','WhatsApp','Stripe','HubSpot','Salesforce','Shopify','Notion','Zapier','LinkedIn','Google Calendar']

  const PLANS = [
    { name:'Starter', price:'$299', period:'/mo', agents:'1 AI Employee', features:['Aria (Sales)', 'Company Brain (Basic)', '5K AI Actions/mo', 'Email support'], highlight:false },
    { name:'Growth', price:'$799', period:'/mo', agents:'3 AI Employees', features:['Aria + Marcus + Lexi', 'Company Brain (Full)', 'Unlimited AI Actions', 'Priority support', 'All integrations'], highlight:true },
    { name:'Team', price:'$1,999', period:'/mo', agents:'All 5 AI Employees', features:['Full AI Workforce', 'Command Center', 'Agent Marketplace', 'Custom agents', 'Dedicated success manager'], highlight:false },
  ]

  return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif", background:C.bg, color:C.text, lineHeight:1.6 }}>
      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.logo}>
          <div style={s.logoIcon}>B</div>
          <span style={{ fontWeight:700, fontSize:16, letterSpacing:-.3 }}>AI BOS</span>
          <span style={{ padding:'2px 8px', background:'rgba(34,211,176,0.12)', color:C.teal, borderRadius:20, fontSize:11, fontWeight:600 }}>Beta</span>
        </div>
        <div style={s.navLinks}>
          {['Product','Solutions','Pricing','Marketplace','Docs'].map(l => (
            <a key={l} href="#" style={{ cursor:'pointer', transition:'.2s' }}>{l}</a>
          ))}
        </div>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <button onClick={() => setAuthView('login')} style={{ padding:'8px 16px', border:`0.5px solid ${C.border2}`, borderRadius:8, fontSize:14, fontWeight:500, color:C.text2, cursor:'pointer', background:'transparent' }}>Log in</button>
          <button onClick={() => setAuthView('signup')} style={{ padding:'9px 20px', background:C.purple, borderRadius:8, fontSize:14, fontWeight:600, color:'#fff', cursor:'pointer', border:'none' }}>Start Free Trial</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={s.hero}>
        <div style={s.glow1}/>
        <div style={s.glow2}/>
        <div style={s.badge}>
          <div style={s.dot}/>
          AI Workforce — Now Available
        </div>
        <h1 style={s.h1}>
          Run Your Entire Business<br/>
          <span style={s.grad}>With AI Employees</span>
        </h1>
        <p style={s.sub}>
          Hire an AI CEO, Sales Rep, Marketer, Support Agent, and Finance Manager.<br/>
          They work 24/7, never call in sick, and get smarter every day.
        </p>
        <div style={s.ctas}>
          <button onClick={() => setAuthView('signup')} style={s.btnPrimary}>
            🚀 Start Free Trial
          </button>
          <button onClick={onLogin} style={s.btnOutline}>
            Watch Demo →
          </button>
        </div>
        <div style={s.statsRow}>
          {[{num:'200+',label:'Businesses running on AI BOS'},{num:'$47K',label:'Avg MRR increase in 90 days'},{num:'74%',label:'Tasks automated on average'},{num:'24/7',label:'AI employees always working'}].map(stat => (
            <div key={stat.num} style={s.statItem}>
              <div style={s.statNum}>{stat.num}</div>
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DASHBOARD MOCKUP */}
      <div style={{ padding:'0 24px 100px', display:'flex', justifyContent:'center' }}>
        <div style={{ width:'100%', maxWidth:900, background:C.bg3, border:`0.5px solid ${C.border2}`, borderRadius:16, overflow:'hidden', boxShadow:'0 40px 100px rgba(0,0,0,0.5), 0 0 60px rgba(124,109,250,0.15)' }}>
          <div style={{ height:40, background:C.bg2, borderBottom:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', padding:'0 16px', gap:8 }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:'#ff5f57' }}/>
            <div style={{ width:10, height:10, borderRadius:'50%', background:'#febc2e' }}/>
            <div style={{ width:10, height:10, borderRadius:'50%', background:'#28c840' }}/>
            <span style={{ flex:1, textAlign:'center', fontSize:12, color:C.text3 }}>app.aibos.com — Command Center</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', minHeight:360 }}>
            <div style={{ background:C.bg2, borderRight:`0.5px solid ${C.border}`, padding:16 }}>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:22, height:22, background:C.grad, borderRadius:5, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:'#fff' }}>B</span>
                AI BOS
              </div>
              {['⚡ Command Center','⬛ Dashboard','📊 Sales Hub','📣 Marketing Hub','🎧 Support Hub','💰 Finance Hub'].map((item, i) => (
                <div key={item} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:6, fontSize:12, color:i===0?C.purple2:C.text3, background:i===0?'rgba(124,109,250,0.15)':'transparent', marginBottom:2 }}>
                  {item}
                </div>
              ))}
            </div>
            <div style={{ padding:20 }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:16 }}>⚡ Command Intelligence — Enter a business goal</div>
              <div style={{ background:'rgba(124,109,250,0.06)', border:`0.5px solid rgba(124,109,250,0.3)`, borderRadius:10, padding:'12px 14px', marginBottom:16, fontSize:12, color:C.text3 }}>
                "Increase revenue by 20% this quarter…"
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
                {[{l:'AI Tasks Created',v:'5',c:C.teal},{l:'Agents Deployed',v:'5/5',c:C.purple2},{l:'Est. Impact',v:'+$18K MRR',c:C.gold}].map(k => (
                  <div key={k.l} style={{ background:C.bg2, border:`0.5px solid ${C.border}`, borderRadius:8, padding:12 }}>
                    <div style={{ fontSize:10, color:C.text3, marginBottom:4 }}>{k.l}</div>
                    <div style={{ fontSize:16, fontWeight:700, color:k.c }}>{k.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[{e:'📊',n:'Aria',t:'Launch 5-step outreach sequence to 40 warm leads',c:'#7c6dfa'},{e:'📣',n:'Lexi',t:'Create revenue-focused content campaign for Q3',c:'#f06a40'},{e:'🎧',n:'Marcus',t:'Proactively reach out to 3 at-risk accounts',c:'#22d3b0'}].map(item => (
                  <div key={item.n} style={{ display:'flex', gap:10, padding:'10px 12px', background:C.bg2, border:`0.5px solid ${C.border}`, borderRadius:8, alignItems:'center' }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', background:`${item.c}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0 }}>{item.e}</div>
                    <div style={{ flex:1, fontSize:11, color:C.text2 }}><span style={{ fontWeight:600, color:item.c }}>{item.n}</span> — {item.t}</div>
                    <span style={{ fontSize:10, color:C.teal, fontWeight:600 }}>→ Running</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI WORKFORCE SECTION */}
      <section style={{ padding:'80px 24px', background:C.bg2, borderTop:`0.5px solid ${C.border}` }}>
        <div style={{ maxWidth:1100, margin:'0 auto', textAlign:'center' }}>
          <div style={{ display:'inline-block', padding:'4px 12px', background:'rgba(124,109,250,0.1)', border:`0.5px solid rgba(124,109,250,0.25)`, borderRadius:100, fontSize:12, fontWeight:500, color:C.purple2, marginBottom:16, letterSpacing:.5 }}>AI WORKFORCE</div>
          <h2 style={{ fontSize:'clamp(28px,4vw,48px)', fontWeight:800, letterSpacing:-1.5, lineHeight:1.1, marginBottom:16 }}>Your AI Employees.<br/>Ready On Day One.</h2>
          <p style={{ fontSize:16, color:C.text2, maxWidth:560, margin:'0 auto 60px', lineHeight:1.7 }}>No hiring. No training. No salary. Just results. Each AI employee is a specialist that works across your entire company, coordinated by the Company Brain.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background:C.bg3, border:`0.5px solid ${C.border}`, borderRadius:14, padding:'24px', textAlign:'left' }}>
                <div style={{ fontSize:28, marginBottom:12 }}>{f.icon}</div>
                <div style={{ fontSize:15, fontWeight:700, marginBottom:8 }}>{f.title}</div>
                <div style={{ fontSize:13, color:C.text2, lineHeight:1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTEGRATIONS */}
      <section style={{ padding:'80px 24px', textAlign:'center' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'inline-block', padding:'4px 12px', background:'rgba(34,211,176,0.1)', border:`0.5px solid rgba(34,211,176,0.25)`, borderRadius:100, fontSize:12, fontWeight:500, color:C.teal, marginBottom:16, letterSpacing:.5 }}>INTEGRATIONS</div>
          <h2 style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:800, letterSpacing:-1.5, marginBottom:16 }}>Works With Your Existing Stack</h2>
          <p style={{ fontSize:16, color:C.text2, maxWidth:500, margin:'0 auto 48px', lineHeight:1.7 }}>Connect your tools in one click. AI agents start taking actions immediately.</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:12, justifyContent:'center' }}>
            {INTEGRATIONS.map(int => (
              <div key={int} style={{ padding:'10px 20px', background:C.bg2, border:`0.5px solid ${C.border}`, borderRadius:30, fontSize:14, fontWeight:500 }}>{int}</div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding:'80px 24px', background:C.bg2, borderTop:`0.5px solid ${C.border}` }}>
        <div style={{ maxWidth:1100, margin:'0 auto', textAlign:'center' }}>
          <div style={{ display:'inline-block', padding:'4px 12px', background:'rgba(124,109,250,0.1)', border:`0.5px solid rgba(124,109,250,0.25)`, borderRadius:100, fontSize:12, fontWeight:500, color:C.purple2, marginBottom:16, letterSpacing:.5 }}>PRICING</div>
          <h2 style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:800, letterSpacing:-1.5, marginBottom:16 }}>One Team. AI Workforce Price.</h2>
          <p style={{ fontSize:16, color:C.text2, maxWidth:500, margin:'0 auto 48px', lineHeight:1.7 }}>Start with one AI employee. Scale to a full workforce as your business grows.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20, maxWidth:900, margin:'0 auto' }}>
            {PLANS.map(plan => (
              <div key={plan.name} style={{ background:plan.highlight?`rgba(124,109,250,0.08)`:C.bg3, border:`0.5px solid ${plan.highlight?'rgba(124,109,250,0.5)':C.border}`, borderRadius:16, padding:'28px 24px', position:'relative' }}>
                {plan.highlight && <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', padding:'4px 16px', background:C.purple, borderRadius:20, fontSize:11, fontWeight:700, color:'#fff', whiteSpace:'nowrap' }}>Most Popular</div>}
                <div style={{ fontSize:15, fontWeight:700, color:plan.highlight?C.purple2:C.text, marginBottom:8 }}>{plan.name}</div>
                <div style={{ fontSize:36, fontWeight:800, letterSpacing:-1, marginBottom:4 }}>{plan.price}<span style={{ fontSize:16, fontWeight:500, color:C.text3 }}>{plan.period}</span></div>
                <div style={{ fontSize:13, color:C.teal, marginBottom:20 }}>{plan.agents}</div>
                <div style={{ marginBottom:24 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display:'flex', gap:8, fontSize:13, color:C.text2, marginBottom:8 }}>
                      <span style={{ color:C.teal }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <button onClick={() => setAuthView('signup')} style={{ width:'100%', padding:'12px', background:plan.highlight?C.purple:'rgba(255,255,255,0.05)', border:`0.5px solid ${plan.highlight?'transparent':C.border2}`, borderRadius:9, fontSize:14, fontWeight:600, color:'#fff', cursor:'pointer' }}>
                  Get Started →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{ padding:'100px 24px', textAlign:'center' }}>
        <div style={{ maxWidth:700, margin:'0 auto' }}>
          <h2 style={{ fontSize:'clamp(32px,5vw,56px)', fontWeight:800, letterSpacing:-2, marginBottom:24, lineHeight:1.05 }}>Your competitors are already<br/><span style={s.grad}>hiring AI employees.</span></h2>
          <p style={{ fontSize:16, color:C.text2, marginBottom:48, lineHeight:1.7 }}>Every day you wait is a day your AI-powered competitors get further ahead. Start your free trial — no credit card required.</p>
          <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => setAuthView('signup')} style={{ ...s.btnPrimary, fontSize:18, padding:'16px 40px' }}>
              🚀 Start Free Trial — No Card Needed
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:`0.5px solid ${C.border}`, padding:'40px 24px', background:C.bg2 }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:28, height:28, background:C.grad, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff' }}>B</div>
            <span style={{ fontWeight:700, fontSize:15 }}>AI BOS</span>
            <span style={{ fontSize:12, color:C.text3, marginLeft:8 }}>© 2026 AI BOS Inc.</span>
          </div>
          <div style={{ display:'flex', gap:32, fontSize:13, color:C.text3 }}>
            {['Product','Pricing','Blog','Docs','Privacy','Terms'].map(l => <a key={l} href="#" style={{ cursor:'pointer' }}>{l}</a>)}
          </div>
        </div>
      </footer>

      {/* AUTH MODAL */}
      {authView && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:20 }} onClick={() => setAuthView(null)}>
          <div style={{ background:C.bg2, border:`0.5px solid rgba(124,109,250,0.4)`, borderRadius:16, padding:32, maxWidth:400, width:'100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <div style={{ fontSize:20, fontWeight:800 }}>{authView === 'signup' ? '🚀 Start Free Trial' : '👋 Welcome back'}</div>
              <button onClick={() => setAuthView(null)} style={{ background:'none', border:'none', color:C.text3, cursor:'pointer', fontSize:20 }}>✕</button>
            </div>
            <div style={{ display:'flex', gap:4, marginBottom:24, background:C.bg3, borderRadius:10, padding:4 }}>
              {(['login','signup'] as const).map(t => (
                <button key={t} onClick={() => setAuthView(t)} style={{ flex:1, padding:'8px', borderRadius:7, border:'none', background:authView===t?C.bg2:'transparent', color:authView===t?C.text:C.text3, fontSize:13, fontWeight:authView===t?600:400, cursor:'pointer' }}>
                  {t === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>
            {authView === 'signup' && (
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:12, color:C.text2, marginBottom:6 }}>Company name</div>
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Inc." style={{ width:'100%', padding:'10px 14px', background:'rgba(255,255,255,0.05)', border:`0.5px solid ${C.border2}`, borderRadius:8, color:C.text, fontSize:14, outline:'none' }}/>
              </div>
            )}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:12, color:C.text2, marginBottom:6 }}>Work email</div>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" type="email" style={{ width:'100%', padding:'10px 14px', background:'rgba(255,255,255,0.05)', border:`0.5px solid ${C.border2}`, borderRadius:8, color:C.text, fontSize:14, outline:'none' }}/>
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:12, color:C.text2, marginBottom:6 }}>Password</div>
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type="password" style={{ width:'100%', padding:'10px 14px', background:'rgba(255,255,255,0.05)', border:`0.5px solid ${C.border2}`, borderRadius:8, color:C.text, fontSize:14, outline:'none' }}/>
            </div>
            <button onClick={handleAuth} disabled={loading} style={{ width:'100%', padding:'12px', background:C.purple, border:'none', borderRadius:9, fontSize:15, fontWeight:600, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {loading ? <><span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.2)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .7s linear infinite', display:'inline-block' }}/> Setting up…</> : authView === 'signup' ? '🚀 Start Free Trial' : '→ Sign In'}
            </button>
            {authView === 'signup' && <p style={{ fontSize:11, color:C.text3, textAlign:'center', marginTop:12 }}>Free 14-day trial · No credit card required</p>}
          </div>
        </div>
      )}
    </div>
  )
}
