import { useState } from 'react'
import { C } from '../design'
import { Card, Btn, Badge, Spin, KpiGrid } from '../components/ui'
import { callAI } from '../utils/ai'

const LEADS_DATA = [
  { id:1, name:'Jordan Blake',  company:'TechFlow',    title:'VP Engineering',  email:'jordan@techflow.io',   score:94, stage:'Meeting',   value:1999, source:'LinkedIn',   last:'2h ago' },
  { id:2, name:'Sarah Chen',    company:'Nexus AI',    title:'CEO',              email:'sarah@nexusai.co',     score:87, stage:'Proposal',  value:1999, source:'Outbound',   last:'1d ago' },
  { id:3, name:'Marcus Reid',   company:'FlowStack',   title:'COO',              email:'m.reid@flowstack.com', score:82, stage:'Contacted', value:799,  source:'Website',    last:'3h ago' },
  { id:4, name:'Priya Sharma',  company:'Orbis Labs',  title:'Head of Ops',      email:'priya@orbis.io',       score:91, stage:'Discovery', value:1999, source:'Referral',   last:'5h ago' },
  { id:5, name:'Alex Kovacs',   company:'Clearpath',   title:'Founder',          email:'alex@clearpath.ai',    score:76, stage:'New',       value:299,  source:'Cold Email', last:'2d ago' },
  { id:6, name:'Mei Lin',       company:'Vantage',     title:'CTO',              email:'mei@vantage.io',       score:88, stage:'Closed',    value:799,  source:'LinkedIn',   last:'1w ago' },
]
const STAGES = ['New','Contacted','Discovery','Meeting','Proposal','Closed']

const ARIA_SYS = `You are Aria, elite AI Sales SDR for AI BOS (AI Business Operating System, $299-$1,999/mo). Write a sharp, personalized cold email under 120 words. No fluff. Focus on their specific pain. Sign as Aria, AI Sales Rep at AI BOS.`

export default function SalesHub() {
  const [view, setView] = useState('pipeline')
  const [leads, setLeads] = useState(LEADS_DATA)
  const [selected, setSelected] = useState<any>(null)
  const [drafting, setDrafting] = useState(false)
  const [draft, setDraft] = useState('')

  const scoreColor = (s: number) => s>=90?C.teal:s>=75?C.gold:C.coral
  const stageColor = (s: string) => ({New:C.text3,Contacted:C.purple2,Discovery:C.gold,Meeting:C.teal,Proposal:C.coral,Closed:C.green}[s] || C.text3)

  const draftEmail = async (lead: typeof LEADS_DATA[0]) => {
    setDrafting(true); setDraft('')
    try {
      const text = await callAI(ARIA_SYS, `Draft a personalized cold email to ${lead.name}, ${lead.title} at ${lead.company}. Lead score: ${lead.score}/100. Source: ${lead.source}. Plan value: $${lead.value}/mo.`, 400)
      setDraft(text)
    } catch(e: any) { setDraft(`Error: ${e.message}`) }
    setDrafting(false)
  }

  const pipeline = STAGES.map(s => ({ stage:s, leads:leads.filter(l => l.stage===s) }))
  const totalPipeline = leads.filter(l => l.stage!=='Closed').reduce((s,l) => s+l.value, 0)

  return (
    <div style={{ flex:1, overflow:'auto', padding:'20px', background:C.bg }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div><div style={{ fontSize:18, fontWeight:800, letterSpacing:-.5 }}>📊 Sales Hub</div><div style={{ fontSize:12, color:C.text3, marginTop:2 }}>Aria manages your entire pipeline 24/7</div></div>
        <div style={{ display:'flex', gap:8 }}>
          {['pipeline','leads','outreach','proposals'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding:'6px 14px', borderRadius:8, border:`0.5px solid ${view===v?C.purple:C.border}`, background:view===v?'rgba(124,109,250,0.12)':'transparent', color:view===v?C.purple2:C.text3, fontSize:12, cursor:'pointer', textTransform:'capitalize' }}>{v}</button>
          ))}
        </div>
      </div>

      <KpiGrid items={[
        { label:'Pipeline Value', value:`$${totalPipeline.toLocaleString()}`, color:C.teal },
        { label:'Active Leads', value:leads.filter(l=>l.stage!=='Closed'&&l.stage!=='New').length, color:C.purple2 },
        { label:'Meetings Set', value:leads.filter(l=>l.stage==='Meeting').length, color:C.gold },
        { label:'Closed Won', value:leads.filter(l=>l.stage==='Closed').length, color:C.green },
      ]}/>

      {view==='pipeline' && (
        <div style={{ overflowX:'auto' }}>
          <div style={{ display:'flex', gap:10, minWidth:900 }}>
            {pipeline.map(col => (
              <div key={col.stage} style={{ flex:1, minWidth:140 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <span style={{ fontSize:12, fontWeight:600, color:stageColor(col.stage) }}>{col.stage}</span>
                  <span style={{ fontSize:10, color:C.text3 }}>{col.leads.length}</span>
                </div>
                {col.leads.map(l => (
                  <div key={l.id} onClick={() => setSelected(l)} style={{ background:C.bg2, border:`0.5px solid ${C.border}`, borderRadius:8, padding:'10px 12px', marginBottom:8, cursor:'pointer' }}>
                    <div style={{ fontSize:12, fontWeight:600, marginBottom:2 }}>{l.name}</div>
                    <div style={{ fontSize:10, color:C.text3, marginBottom:6 }}>{l.company}</div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:10, color:C.gold }}>${l.value}/mo</span>
                      <span style={{ fontSize:10, fontWeight:700, color:scoreColor(l.score) }}>{l.score}</span>
                    </div>
                  </div>
                ))}
                {col.leads.length===0 && <div style={{ border:`0.5px dashed ${C.border}`, borderRadius:8, padding:'20px', textAlign:'center', fontSize:10, color:C.text3 }}>Empty</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {view==='leads' && (
        <Card>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>{['Name','Company','Title','Score','Stage','Value','Last Activity',''].map(h => <th key={h} style={{ textAlign:'left', fontSize:10, color:C.text3, padding:'6px 10px', borderBottom:`0.5px solid ${C.border}`, letterSpacing:.5 }}>{h}</th>)}</tr></thead>
            <tbody>
              {leads.map(l => (
                <tr key={l.id} style={{ borderBottom:`0.5px solid ${C.border}` }}>
                  <td style={{ padding:'10px', fontSize:13, fontWeight:600 }}>{l.name}</td>
                  <td style={{ padding:'10px', fontSize:12, color:C.text2 }}>{l.company}</td>
                  <td style={{ padding:'10px', fontSize:12, color:C.text3 }}>{l.title}</td>
                  <td style={{ padding:'10px' }}><span style={{ fontSize:12, fontWeight:700, color:scoreColor(l.score) }}>{l.score}</span></td>
                  <td style={{ padding:'10px' }}><Badge type={l.stage==='Closed'?'success':l.stage==='Proposal'?'warning':'info'}>{l.stage}</Badge></td>
                  <td style={{ padding:'10px', fontSize:12, color:C.gold }}>${l.value}/mo</td>
                  <td style={{ padding:'10px', fontSize:11, color:C.text3 }}>{l.last}</td>
                  <td style={{ padding:'10px' }}><button onClick={() => setSelected(l)} style={{ fontSize:11, padding:'4px 10px', background:'rgba(124,109,250,0.1)', border:`0.5px solid rgba(124,109,250,0.3)`, borderRadius:6, color:C.purple2, cursor:'pointer' }}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {view==='outreach' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div>
            <div style={{ fontSize:12, color:C.text3, marginBottom:10 }}>Select a lead to draft outreach:</div>
            {leads.filter(l => l.stage==='New'||l.stage==='Contacted').map(l => (
              <div key={l.id} onClick={() => setSelected(l)} style={{ background:C.bg2, border:`0.5px solid ${selected?.id===l.id?C.purple:C.border}`, borderRadius:8, padding:'10px 12px', marginBottom:6, cursor:'pointer' }}>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontSize:13, fontWeight:600 }}>{l.name}</span>
                  <span style={{ fontSize:10, color:scoreColor(l.score), fontWeight:700 }}>{l.score}</span>
                </div>
                <div style={{ fontSize:11, color:C.text3 }}>{l.title} · {l.company}</div>
              </div>
            ))}
          </div>
          <div>
            {selected ? (
              <Card>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:10, color:C.purple2 }}>Draft for {selected.name}</div>
                <Btn onClick={() => draftEmail(selected)} disabled={drafting} style={{ marginBottom:12, width:'100%', display:'flex', alignItems:'center', gap:6, justifyContent:'center' }}>
                  {drafting?<><Spin/>Aria is writing…</>:'📊 Generate Personalized Email'}
                </Btn>
                {draft && (
                  <div>
                    <textarea value={draft} onChange={e => setDraft(e.target.value)} style={{ width:'100%', minHeight:160, padding:'10px 12px', background:'rgba(255,255,255,0.04)', border:`0.5px solid ${C.border2}`, borderRadius:8, color:C.text, fontSize:12, lineHeight:1.7, resize:'vertical', outline:'none', fontFamily:'inherit' }}/>
                    <div style={{ display:'flex', gap:8, marginTop:8 }}>
                      <Btn variant="teal" style={{ flex:1, fontSize:11 }}>✓ Approve & Send</Btn>
                      <Btn variant="ghost" style={{ flex:1, fontSize:11 }}>✎ Edit</Btn>
                    </div>
                  </div>
                )}
              </Card>
            ) : <Card style={{ textAlign:'center', padding:'40px' }}><div style={{ fontSize:12, color:C.text3 }}>Select a lead to generate outreach</div></Card>}
          </div>
        </div>
      )}

      {view==='proposals' && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {leads.filter(l => l.stage==='Proposal'||l.stage==='Meeting').map(l => (
            <Card key={l.id}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(124,109,250,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:C.purple2 }}>{l.name[0]}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600 }}>{l.name} · {l.company}</div>
                    <div style={{ fontSize:11, color:C.text3 }}>{l.title} · Score: <span style={{ color:scoreColor(l.score) }}>{l.score}</span></div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <Badge type={l.stage==='Proposal'?'warning':'info'}>{l.stage}</Badge>
                  <span style={{ fontSize:14, fontWeight:700, color:C.gold }}>${l.value}/mo</span>
                  <Btn style={{ fontSize:11, padding:'5px 12px' }}>Send Proposal</Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:20 }} onClick={() => setSelected(null)}>
          <div style={{ background:C.bg2, border:`0.5px solid rgba(124,109,250,0.4)`, borderRadius:14, padding:24, maxWidth:480, width:'100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', gap:12, marginBottom:16 }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:'rgba(124,109,250,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:C.purple2 }}>{selected.name[0]}</div>
              <div>
                <div style={{ fontSize:16, fontWeight:700 }}>{selected.name}</div>
                <div style={{ fontSize:12, color:C.text3 }}>{selected.title} · {selected.company}</div>
                <div style={{ fontSize:11, color:C.text3, marginTop:2 }}>{selected.email}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ marginLeft:'auto', background:'none', border:'none', color:C.text3, cursor:'pointer', fontSize:18 }}>✕</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
              {[{l:'Score',v:selected.score,c:scoreColor(selected.score)},{l:'Stage',v:selected.stage,c:stageColor(selected.stage)},{l:'Value',v:`$${selected.value}/mo`,c:C.gold}].map(k => (
                <div key={k.l} style={{ background:C.bg3, borderRadius:8, padding:'10px', textAlign:'center' }}>
                  <div style={{ fontSize:10, color:C.text3, marginBottom:4 }}>{k.l}</div>
                  <div style={{ fontSize:14, fontWeight:700, color:k.c }}>{k.v}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <Btn onClick={() => { draftEmail(selected); setSelected(null); setView('outreach'); }} style={{ flex:1, fontSize:12 }}>📊 Draft Email</Btn>
              <Btn variant="teal" style={{ flex:1, fontSize:12 }}>+ Move Stage</Btn>
              <Btn variant="ghost" onClick={() => setSelected(null)} style={{ fontSize:12 }}>Close</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
