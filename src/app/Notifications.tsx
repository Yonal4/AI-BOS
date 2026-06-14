import { useState } from 'react'
import { C, AGENTS } from '../design'
import { Card, Btn, Badge } from '../components/ui'

const ALL_NOTIFS = [
  { id:1,  type:'approval', agent:'aria',   emoji:'📊', color:'#7c6dfa', title:'Approval needed: Enterprise outreach',      body:'Aria wants to send a 5-step sequence to 12 enterprise leads from Stripe. $23,880 potential pipeline.', time:'5m ago',  unread:true  },
  { id:2,  type:'success',  agent:'aria',   emoji:'📊', color:'#7c6dfa', title:'Meeting booked — Jordan Blake, TechFlow',    body:'Aria booked a discovery call for Thursday 2pm. Opportunity: $1,999/mo Team plan.', time:'20m ago', unread:true  },
  { id:3,  type:'alert',    agent:'marcus', emoji:'🎧', color:'#22d3b0', title:'Churn risk detected — FlowStack',            body:'Marcus flagged usage drop 40% over 14 days. Proactive outreach recommended within 24h.', time:'1h ago',  unread:true  },
  { id:4,  type:'info',     agent:'lexi',   emoji:'📣', color:'#f06a40', title:'LinkedIn post live — 1,200 impressions',     body:'\'Why AI employees beat hiring\' post is performing well. Click-through rate 4.2%.', time:'2h ago',  unread:true  },
  { id:5,  type:'approval', agent:'felix',  emoji:'💰', color:'#facc4b', title:'Refund approval required — TechCorp',        body:'Felix flagged refund request for $1,200. 3-month customer, 1 support ticket. Recommends approve.', time:'3h ago',  unread:true  },
  { id:6,  type:'success',  agent:'felix',  emoji:'💰', color:'#facc4b', title:'Revenue milestone: $47K MRR',                body:'You hit $47,200 MRR — up 24% from last month. Felix projects $100K MRR by October.', time:'4h ago',  unread:false },
  { id:7,  type:'alert',    agent:'nova',   emoji:'⚙️', color:'#63c8c8', title:'API costs up 18% this week',                 body:'Nova detected elevated Anthropic usage. Felix recommends volume pricing negotiation.', time:'5h ago',  unread:false },
  { id:8,  type:'approval', agent:'lexi',   emoji:'📣', color:'#f06a40', title:'Approval needed: $4,500 LinkedIn ad spend',  body:'Lexi wants to launch a Q3 LinkedIn campaign. Projected 8-12 new leads. 2x estimated ROI.', time:'6h ago',  unread:false },
  { id:9,  type:'info',     agent:'marcus', emoji:'🎧', color:'#22d3b0', title:'Support: 29 tickets resolved today',         body:'Marcus auto-resolved 29 tickets. 4 escalated to human. CSAT: 4.8/5. New KB article created.', time:'8h ago',  unread:false },
  { id:10, type:'success',  agent:'aria',   emoji:'📊', color:'#7c6dfa', title:'Deal closed — Nexus AI, $1,999/mo',          body:'Aria closed Sarah Chen at Nexus AI on the Team plan. Onboarding sequence triggered automatically.', time:'1d ago',  unread:false },
]

const TYPES = ['all','approval','alert','success','info']

export default function Notifications() {
  const [notifs, setNotifs] = useState(ALL_NOTIFS)
  const [filter, setFilter] = useState('all')
  const [agentFilter, setAgentFilter] = useState('all')

  const filtered = notifs.filter(n =>
    (filter==='all' || n.type===filter) &&
    (agentFilter==='all' || n.agent===agentFilter)
  )

  const unreadCount = notifs.filter(n => n.unread).length
  const markAll = () => setNotifs(p => p.map(n => ({ ...n, unread:false })))
  const dismiss = (id: number) => setNotifs(p => p.filter(n => n.id!==id))
  const approve = (id: number) => setNotifs(p => p.filter(n => n.id!==id))

  const typeIcon = (t: string) => ({ approval:'⏳', alert:'🚨', success:'✅', info:'ℹ️' }[t] || '🔔')
  const typeBg = (t: string, color: string) => t==='approval'?'rgba(250,204,75,0.08)':t==='alert'?'rgba(240,106,64,0.08)':t==='success'?'rgba(74,222,128,0.05)':'rgba(255,255,255,0.03)'
  const typeBorder = (t: string, color: string) => t==='approval'?'rgba(250,204,75,0.25)':t==='alert'?'rgba(240,106,64,0.25)':t==='success'?'rgba(74,222,128,0.2)':C.border

  return (
    <div style={{ flex:1, overflow:'auto', padding:'20px', background:C.bg }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <div style={{ fontSize:18, fontWeight:800, letterSpacing:-.5, display:'flex', alignItems:'center', gap:10 }}>
            🔔 Notifications
            {unreadCount>0 && <span style={{ background:C.coral, color:'#fff', fontSize:11, fontWeight:700, padding:'2px 7px', borderRadius:20 }}>{unreadCount}</span>}
          </div>
          <div style={{ fontSize:12, color:C.text3, marginTop:2 }}>Agent activity, approvals, and alerts</div>
        </div>
        {unreadCount>0 && <Btn variant="ghost" onClick={markAll} style={{ fontSize:12 }}>✓ Mark all read</Btn>}
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:16, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:4 }}>
          {TYPES.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{ padding:'5px 12px', borderRadius:20, border:`0.5px solid ${filter===t?C.purple:C.border}`, background:filter===t?'rgba(124,109,250,0.12)':'transparent', color:filter===t?C.purple2:C.text3, fontSize:11, cursor:'pointer', textTransform:'capitalize' }}>
              {typeIcon(t)} {t}
            </button>
          ))}
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:4 }}>
          <button onClick={() => setAgentFilter('all')} style={{ padding:'4px 10px', borderRadius:20, border:`0.5px solid ${agentFilter==='all'?C.teal:C.border}`, background:agentFilter==='all'?'rgba(34,211,176,0.12)':'transparent', color:agentFilter==='all'?C.teal:C.text3, fontSize:10, cursor:'pointer' }}>All Agents</button>
          {AGENTS.map(a => (
            <button key={a.id} onClick={() => setAgentFilter(a.id)} title={a.name} style={{ width:28, height:28, borderRadius:'50%', border:`0.5px solid ${agentFilter===a.id?a.color:C.border}`, background:agentFilter===a.id?a.bg:'transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, cursor:'pointer' }}>{a.emoji}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <Card style={{ textAlign:'center', padding:'50px' }}>
          <div style={{ fontSize:36, marginBottom:12 }}>🎉</div>
          <div style={{ fontSize:16, fontWeight:600, marginBottom:6 }}>All caught up!</div>
          <div style={{ fontSize:13, color:C.text3 }}>No notifications matching this filter.</div>
        </Card>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {filtered.map(n => (
          <div key={n.id} style={{ background:n.unread?typeBg(n.type, n.color):C.bg2, border:`0.5px solid ${n.unread?typeBorder(n.type, n.color):C.border}`, borderRadius:10, padding:'14px 16px', position:'relative' }}>
            {n.unread && <div style={{ position:'absolute', top:16, left:8, width:6, height:6, borderRadius:'50%', background:n.color }}/>}
            <div style={{ display:'flex', gap:12, marginLeft:n.unread?6:0 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:`${n.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{n.emoji}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span style={{ fontSize:13, fontWeight:n.unread?700:500 }}>{n.title}</span>
                    <span style={{ fontSize:11 }}>{typeIcon(n.type)}</span>
                  </div>
                  <span style={{ fontSize:11, color:C.text3, flexShrink:0, marginLeft:12 }}>{n.time}</span>
                </div>
                <div style={{ fontSize:12, color:C.text2, lineHeight:1.6, marginBottom:n.type==='approval'?10:0 }}>{n.body}</div>
                {n.type==='approval' && (
                  <div style={{ display:'flex', gap:8, marginTop:6 }}>
                    <Btn variant="teal" onClick={() => approve(n.id)} style={{ fontSize:11, padding:'5px 14px' }}>✓ Approve</Btn>
                    <Btn variant="danger" onClick={() => dismiss(n.id)} style={{ fontSize:11, padding:'5px 14px' }}>✕ Reject</Btn>
                  </div>
                )}
              </div>
              <button onClick={() => dismiss(n.id)} style={{ background:'none', border:'none', color:C.text3, cursor:'pointer', fontSize:14, padding:'0 2px', alignSelf:'flex-start', flexShrink:0 }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
