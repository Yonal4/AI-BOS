import { useState } from 'react'
import { C, AGENTS } from '../design'
import { Pill } from '../components/ui'
import Dashboard from './Dashboard'
import CommandCenter from './CommandCenter'
import CompanyBrain from './CompanyBrain'
import SalesHub from './SalesHub'
import MarketingHub from './MarketingHub'
import SupportHub from './SupportHub'
import FinanceHub from './FinanceHub'
import OperationsHub from './OperationsHub'
import Marketplace from './Marketplace'
import Integrations from './Integrations'
import Notifications from './Notifications'
import Billing from './Billing'
import Developer from './Developer'
import Settings from './Settings'

const NAV_SECTIONS = [
  { label:'MAIN', items:[
    { id:'command',     icon:'⚡', label:'Command Center', badge:null },
    { id:'dashboard',   icon:'⬛', label:'Dashboard',      badge:null },
    { id:'owner',       icon:'📱', label:'Owner View',     badge:null },
  ]},
  { label:'AI WORKFORCE', items:[
    { id:'sales',       icon:'📊', label:'Sales Hub',      badge:null },
    { id:'marketing',   icon:'📣', label:'Marketing Hub',  badge:null },
    { id:'support',     icon:'🎧', label:'Support Hub',    badge:null },
    { id:'finance',     icon:'💰', label:'Finance Hub',    badge:null },
    { id:'operations',  icon:'⚙️', label:'Operations Hub', badge:null },
  ]},
  { label:'PLATFORM', items:[
    { id:'brain',       icon:'🧠', label:'Company Brain',  badge:null },
    { id:'marketplace', icon:'🏪', label:'Marketplace',    badge:null },
    { id:'integrations',icon:'🔌', label:'Integrations',   badge:null },
    { id:'notifications',icon:'🔔',label:'Notifications',  badge:7    },
  ]},
  { label:'ACCOUNT', items:[
    { id:'billing',     icon:'💳', label:'Billing',        badge:null },
    { id:'developer',   icon:'🛠️', label:'Developer',      badge:null },
    { id:'settings',    icon:'⚙️', label:'Settings',       badge:null },
  ]},
]

export default function AppShell({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [view, setView] = useState('command')

  const VIEWS: Record<string, JSX.Element> = {
    command:      <CommandCenter />,
    dashboard:    <Dashboard onNavigate={setView} />,
    owner:        <Dashboard onNavigate={setView} ownerMode={true} />,
    sales:        <SalesHub />,
    marketing:    <MarketingHub />,
    support:      <SupportHub />,
    finance:      <FinanceHub />,
    operations:   <OperationsHub />,
    brain:        <CompanyBrain />,
    marketplace:  <Marketplace />,
    integrations: <Integrations />,
    notifications:<Notifications />,
    billing:      <Billing />,
    developer:    <Developer />,
    settings:     <Settings />,
  }

  return (
    <div style={{ display:'flex', height:'100vh', background:C.bg, fontFamily:"'Inter',system-ui,sans-serif", color:C.text, overflow:'hidden' }}>
      {/* SIDEBAR */}
      <div style={{ width:214, background:C.bg2, borderRight:`0.5px solid ${C.border}`, display:'flex', flexDirection:'column', flexShrink:0, overflow:'hidden' }}>
        {/* Logo */}
        <div style={{ padding:'14px 14px 12px', display:'flex', alignItems:'center', gap:8, borderBottom:`0.5px solid ${C.border}` }}>
          <div style={{ width:28, height:28, background:C.grad, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff', flexShrink:0 }}>B</div>
          <span style={{ fontWeight:700, fontSize:14, letterSpacing:-.3 }}>AI BOS</span>
          <Pill color={C.teal} bg="rgba(34,211,176,0.12)" style={{ fontSize:10, marginLeft:'auto' }}>v2</Pill>
        </div>

        {/* Agent status strip */}
        <div style={{ padding:'8px 12px', borderBottom:`0.5px solid ${C.border}`, display:'flex', gap:6, flexWrap:'wrap' }}>
          {AGENTS.map(a => (
            <div key={a.id} title={`${a.name} — ${a.role}`} style={{ width:22, height:22, borderRadius:'50%', background:a.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, cursor:'default' }}>
              {a.emoji}
            </div>
          ))}
          <span style={{ fontSize:10, color:C.teal, marginLeft:4, alignSelf:'center' }}>5 active</span>
        </div>

        {/* Nav */}
        <div style={{ flex:1, overflowY:'auto', padding:'4px 8px' }}>
          {NAV_SECTIONS.map(sec => (
            <div key={sec.label}>
              <div style={{ fontSize:9, color:C.text3, letterSpacing:.8, textTransform:'uppercase', padding:'10px 8px 4px' }}>{sec.label}</div>
              {sec.items.map(n => (
                <div key={n.id} onClick={() => setView(n.id)}
                  style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:8, cursor:'pointer', marginBottom:1,
                    background:view===n.id?'rgba(124,109,250,0.12)':'transparent',
                    color:view===n.id?C.purple2:C.text3,
                    fontSize:12, fontWeight:view===n.id?600:400,
                    border:view===n.id?`0.5px solid rgba(124,109,250,0.25)`:'0.5px solid transparent',
                    transition:'.1s'
                  }}>
                  <span style={{ fontSize:13 }}>{n.icon}</span>
                  <span style={{ flex:1 }}>{n.label}</span>
                  {n.badge && <span style={{ background:C.coral, color:'#fff', fontSize:9, fontWeight:700, padding:'1px 5px', borderRadius:10 }}>{n.badge}</span>}
                  {view===n.id && <div style={{ width:5, height:5, borderRadius:'50%', background:C.teal }}/>}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Brain health + logout */}
        <div style={{ padding:'10px 12px', borderTop:`0.5px solid ${C.border}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
            <span style={{ fontSize:10, color:C.text3 }}>Brain Health</span>
            <span style={{ fontSize:10, color:C.teal, fontWeight:600 }}>74%</span>
          </div>
          <div style={{ height:3, background:'rgba(255,255,255,0.07)', borderRadius:3, marginBottom:10 }}>
            <div style={{ height:'100%', width:'74%', background:C.grad, borderRadius:3 }}/>
          </div>
          <button onClick={onLogout} style={{ width:'100%', padding:'6px', background:'rgba(240,106,64,0.08)', border:`0.5px solid rgba(240,106,64,0.2)`, borderRadius:6, color:C.coral, fontSize:11, cursor:'pointer' }}>
            → Back to Home
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        {/* Top bar */}
        <div style={{ height:48, borderBottom:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', padding:'0 20px', gap:12, flexShrink:0, background:C.bg2 }}>
          <div style={{ flex:1, fontSize:13, color:C.text3 }}>
            <span style={{ color:C.text2 }}>AI BOS</span>
            <span style={{ margin:'0 6px' }}>›</span>
            <span style={{ color:C.purple2 }}>{NAV_SECTIONS.flatMap(s=>s.items).find(i=>i.id===view)?.label}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(34,211,176,0.08)', border:`0.5px solid rgba(34,211,176,0.25)`, borderRadius:20, padding:'4px 12px' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:C.teal, animation:'pulse 2s infinite' }}/>
            <span style={{ fontSize:11, color:C.teal, fontWeight:600 }}>5 agents active</span>
          </div>
          <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(124,109,250,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:C.purple2, cursor:'pointer' }}>
            U
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex:1, overflow:'hidden' }}>
          {VIEWS[view] || VIEWS['dashboard']}
        </div>
      </div>
    </div>
  )
}
