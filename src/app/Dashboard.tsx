import { useEffect, useState } from 'react'
import { C, AGENTS } from '../design'
import { Card, Btn, Badge, Pill, SparkLine } from '../components/ui'
import { AgentEvent, getRecentEvents } from '../utils/collaboration'
import { useOrgId } from '../context/OrgContext'

const MRR_DATA = [18,22,27,31,38,47]

const LIVE_PULSE = [
  { agent:'aria',   emoji:'📊', color:'#7c6dfa', text:'Booked meeting with Jordan Blake, VP Eng at TechFlow', time:'just now' },
  { agent:'marcus', emoji:'🎧', color:'#22d3b0', text:'Resolved 4 tickets — 1 escalated with churn risk flag',   time:'3 min ago' },
  { agent:'lexi',   emoji:'📣', color:'#f06a40', text:'LinkedIn post live — 1,200 impressions in 8 min',          time:'9 min ago' },
  { agent:'nova',   emoji:'⚙️', color:'#63c8c8', text:'Deal handoff coordinated: Nexus AI → onboarding',          time:'22 min ago' },
  { agent:'felix',  emoji:'💰', color:'#facc4b', text:'API cost spike detected — up 18%, report generated',       time:'1 hr ago' },
]

const APPROVALS = [
  { id:1, agent:'aria',  emoji:'📊', color:'#7c6dfa', text:'Send cold sequence to 12 enterprise leads from Stripe\'s team', confidence:68, value:'$23,880 potential' },
  { id:2, agent:'lexi',  emoji:'📣', color:'#f06a40', text:'Launch $4,500 LinkedIn ad campaign for Q3 push',                  confidence:71, value:'$4,500 spend' },
  { id:3, agent:'felix', emoji:'💰', color:'#facc4b', text:'Issue refund to customer TechCorp ($1,200)',                       confidence:55, value:'$1,200 outflow' },
]

export default function Dashboard({ onNavigate, ownerMode = false }: { onNavigate: (v:string)=>void, ownerMode?: boolean }) {
  const orgId = useOrgId()
  const [approvals, setApprovals] = useState(APPROVALS)
  const [events, setEvents] = useState<AgentEvent[]>([])
  const approve = (id: number) => setApprovals(a => a.filter(x => x.id !== id))
  const reject  = (id: number) => setApprovals(a => a.filter(x => x.id !== id))

  useEffect(() => {
    getRecentEvents(orgId).then(setEvents).catch(() => setEvents([]))
  }, [orgId])

  const AGENT_PERF: Record<string,any> = {
    aria:  { tasks:47, wins:'14 meetings',  rate:92 },
    marcus:{ tasks:43, wins:'29 resolved',  rate:87 },
    lexi:  { tasks:12, wins:'2 campaigns',  rate:95 },
    felix: { tasks:8,  wins:'3 reports',    rate:100 },
    nova:  { tasks:23, wins:'6 handoffs',   rate:89 },
  }

  const eventLabel = (event: AgentEvent) => ({
    'marketing.campaign.created': 'created a campaign',
    'marketing.lead.created': 'created a lead',
    'sales.lead.received': 'received a lead',
    'sales.outreach.generated': 'generated outreach',
    'lead.status.updated': 'updated lead status',
    'support.context.received': 'received context',
    'task.delegated': 'delegated a task',
  }[event.event_type] || event.event_type.replace(/\./g, ' '))

  const ago = (iso: string) => {
    const seconds = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div style={{ flex:1, overflow:'auto', padding:'20px', background:C.bg }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:800, letterSpacing:-.5 }}>{ownerMode ? '📱 Owner Dashboard' : '⬛ Dashboard'}</div>
          <div style={{ fontSize:12, color:C.text3, marginTop:2 }}>Sun Jun 14 2026 · All agents online</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(34,211,176,0.1)', border:`0.5px solid rgba(34,211,176,0.3)`, borderRadius:20, padding:'6px 14px' }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:C.teal, boxShadow:`0 0 8px ${C.teal}` }}/>
          <span style={{ fontSize:12, color:C.teal, fontWeight:600 }}>5/5 agents active</span>
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20 }}>
        {[
          { label:'MRR', val:'$47.2K', sub:'↑ $8.1K', color:C.teal, spark:MRR_DATA },
          { label:'Meetings', val:'14', sub:'↑ 3 today', color:C.purple2, spark:[8,11,9,13,12,14] },
          { label:'Tickets', val:'43', sub:'67% auto', color:C.coral, spark:[30,35,28,40,38,43] },
          { label:'Autonomy', val:'74%', sub:'↑ 6% MoM', color:C.gold, spark:[60,63,67,69,71,74] },
        ].map(k => (
          <Card key={k.label} style={{ padding:'14px 16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontSize:10, color:C.text3, letterSpacing:.5, marginBottom:4 }}>{k.label.toUpperCase()}</div>
                <div style={{ fontSize:22, fontWeight:800, letterSpacing:-1, color:k.color }}>{k.val}</div>
                <div style={{ fontSize:11, color:C.teal, marginTop:2 }}>{k.sub}</div>
              </div>
              <SparkLine data={k.spark} color={k.color}/>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:16 }}>
        {/* LEFT */}
        <div>
          {/* Approvals */}
          {approvals.length > 0 && (
            <Card style={{ marginBottom:16, border:`0.5px solid rgba(250,204,75,0.3)`, background:'rgba(250,204,75,0.03)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                <span style={{ fontSize:14 }}>⏳</span>
                <span style={{ fontSize:13, fontWeight:700, color:C.gold }}>Pending Approvals ({approvals.length})</span>
                <span style={{ fontSize:11, color:C.text3, marginLeft:'auto' }}>Agents waiting on you</span>
              </div>
              {approvals.map(ap => (
                <div key={ap.id} style={{ background:'rgba(250,204,75,0.06)', border:`0.5px solid rgba(250,204,75,0.2)`, borderRadius:10, padding:14, marginBottom:10 }}>
                  <div style={{ display:'flex', gap:10, marginBottom:10 }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:`${ap.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{ap.emoji}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:ap.color, marginBottom:2 }}>{ap.agent.charAt(0).toUpperCase()+ap.agent.slice(1)} wants to:</div>
                      <div style={{ fontSize:13, color:C.text, lineHeight:1.5 }}>{ap.text}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', gap:12 }}>
                      <span style={{ fontSize:11, color:C.text3 }}>Confidence: <span style={{ color:C.gold, fontWeight:700 }}>{ap.confidence}%</span></span>
                      <span style={{ fontSize:11, color:C.coral, fontWeight:600 }}>{ap.value}</span>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={() => reject(ap.id)} style={{ padding:'6px 14px', background:'rgba(240,106,64,0.12)', border:`0.5px solid rgba(240,106,64,0.3)`, borderRadius:6, color:C.coral, fontSize:12, fontWeight:600, cursor:'pointer' }}>✕ Reject</button>
                      <button onClick={() => approve(ap.id)} style={{ padding:'6px 14px', background:'rgba(34,211,176,0.15)', border:`0.5px solid rgba(34,211,176,0.35)`, borderRadius:6, color:C.teal, fontSize:12, fontWeight:600, cursor:'pointer' }}>✓ Approve</button>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {/* Agent Performance */}
          <Card style={{ marginBottom:16, display:'none' }}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>Agent Performance Today</div>
            {AGENTS.map(a => {
              const stats = AGENT_PERF[a.id]
              return (
                <div key={a.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:`0.5px solid ${C.border}` }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:a.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{a.emoji}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:a.color }}>{a.name}</span>
                      <span style={{ fontSize:11, color:C.text3 }}>{stats.tasks} tasks · {stats.wins}</span>
                    </div>
                    <div style={{ height:3, background:'rgba(255,255,255,0.06)', borderRadius:3 }}>
                      <div style={{ height:'100%', width:`${stats.rate}%`, background:a.color, borderRadius:3, opacity:.8 }}/>
                    </div>
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color:a.color, minWidth:36, textAlign:'right' }}>{stats.rate}%</span>
                </div>
              )
            })}
          </Card>

          {/* Quick Command */}
          <Card style={{ background:'rgba(124,109,250,0.06)', border:`0.5px solid rgba(124,109,250,0.25)` }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.purple2, marginBottom:10 }}>⚡ Quick Command</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {['Boost pipeline this week','Prepare board report','Handle churn risks','Launch product update campaign'].map(cmd => (
                <button key={cmd} onClick={() => onNavigate('command')} style={{ padding:'7px 12px', background:'rgba(124,109,250,0.1)', border:`0.5px solid rgba(124,109,250,0.25)`, borderRadius:20, color:C.purple2, fontSize:12, cursor:'pointer' }}>{cmd}</button>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT */}
        <div>
          <Card style={{ marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:700 }}>Live Agent Pulse</div>
              <button onClick={() => onNavigate('notifications')} style={{ background:'transparent', border:`0.5px solid ${C.border}`, borderRadius:6, color:C.text3, fontSize:10, padding:'4px 8px', cursor:'pointer' }}>Timeline</button>
            </div>
            {events.length === 0 && (
              <div style={{ fontSize:12, color:C.text3, lineHeight:1.6 }}>No stored agent events yet. Start a collaborative campaign to create the first timeline.</div>
            )}
            {events.slice(0,5).map((item) => {
              const agent = AGENTS.find(a => a.id === item.agent_id)
              return (
                <div key={item.id} style={{ display:'flex', gap:10, padding:'10px 0', borderBottom:`0.5px solid ${C.border}` }}>
                  <div style={{ width:30, height:30, borderRadius:'50%', background:`${agent?.color || C.text3}20`, color:agent?.color || C.text3, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, flexShrink:0 }}>{(agent?.name || item.agent_id).slice(0,1)}</div>
                  <div>
                    <div style={{ fontSize:12, color:C.text2, lineHeight:1.5 }}><span style={{ fontWeight:600, color:agent?.color || C.text2 }}>{agent?.name || item.agent_id}</span> {eventLabel(item)}</div>
                    <div style={{ fontSize:10, color:C.text3, marginTop:2 }}>{ago(item.created_at)}</div>
                  </div>
                </div>
              )
            })}
          </Card>
          <Card style={{ marginBottom:16, display:'none' }}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>🔴 Live Agent Pulse</div>
            {LIVE_PULSE.map((item, i) => (
              <div key={i} style={{ display:'flex', gap:10, padding:'10px 0', borderBottom:`0.5px solid ${C.border}` }}>
                <div style={{ width:30, height:30, borderRadius:'50%', background:`${item.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0 }}>{item.emoji}</div>
                <div>
                  <div style={{ fontSize:12, color:C.text2, lineHeight:1.5 }}><span style={{ fontWeight:600, color:item.color }}>{item.agent}</span> {item.text}</div>
                  <div style={{ fontSize:10, color:C.text3, marginTop:2 }}>{item.time}</div>
                </div>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>📊 Revenue Breakdown</div>
            {[{label:'New MRR',val:'$8,100',color:C.teal},{label:'Expansion MRR',val:'$3,200',color:C.purple2},{label:'Churned MRR',val:'-$2,400',color:C.coral},{label:'Net New MRR',val:'$8,900',color:C.gold}].map(r => (
              <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`0.5px solid ${C.border}` }}>
                <span style={{ fontSize:13, color:C.text2 }}>{r.label}</span>
                <span style={{ fontSize:14, fontWeight:700, color:r.color }}>{r.val}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}
