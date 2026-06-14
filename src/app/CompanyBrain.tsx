import { useState } from 'react'
import { C } from '../design'
import { Card, Btn, Pill, Spin } from '../components/ui'
import { callAI } from '../utils/ai'

const BRAIN_SYS = `You are the AI BOS Company Brain — a RAG-powered knowledge system. When asked a question, answer using the company knowledge provided. Be specific, cite relevant sections, and provide actionable insights. Format your response clearly with bullet points where appropriate.

Company context: AI BOS is an AI Business Operating System. Plans: Starter $299/mo, Growth $799/mo, Team $1,999/mo. ICP: funded startups 5-200 employees. Agents: Aria (Sales), Marcus (Support), Lexi (Marketing), Felix (Finance), Nova (Operations). Current MRR: $47,200. Top customers: TechFlow, Nexus AI, Orbis Labs, FlowStack.`

const DOC_TYPES = [
  { id:'playbook',  label:'Sales Playbook',    emoji:'📋', example:'Objection handling, ICP, discovery questions' },
  { id:'brand',     label:'Brand Voice Guide', emoji:'🎨', example:'Tone, messaging, do\'s and don\'ts' },
  { id:'sop',       label:'SOPs & Processes',  emoji:'📝', example:'How we onboard customers, escalation paths' },
  { id:'product',   label:'Product Docs',      emoji:'📦', example:'Features, pricing, roadmap' },
  { id:'customer',  label:'Customer Stories',  emoji:'⭐', example:'Case studies, testimonials' },
  { id:'policy',    label:'Policies',          emoji:'⚖️', example:'Refund policy, SLAs, terms' },
  { id:'faq',       label:'FAQ',               emoji:'❓', example:'Common questions and answers' },
  { id:'team',      label:'Team Info',         emoji:'👥', example:'Org chart, responsibilities, contacts' },
]

const SEED_DOCS = [
  { id:'1', type:'playbook', label:'Sales Playbook Q2 2026', chunks:18, size:'12KB', addedAt:'Jun 10' },
  { id:'2', type:'brand',    label:'Brand Voice & Messaging', chunks:9,  size:'6KB',  addedAt:'Jun 8'  },
  { id:'3', type:'product',  label:'Product Features & Pricing', chunks:24, size:'18KB', addedAt:'Jun 12' },
]

export default function CompanyBrain() {
  const [tab, setTab] = useState<'docs'|'search'|'missing'|'add'>('docs')
  const [docs, setDocs] = useState(SEED_DOCS)
  const [query, setQuery] = useState('')
  const [queryResult, setQueryResult] = useState('')
  const [querying, setQuerying] = useState(false)
  const [uploading, setUploading] = useState<string|null>(null)
  const [addType, setAddType] = useState('playbook')
  const [addTitle, setAddTitle] = useState('')
  const [addText, setAddText] = useState('')

  const typeEmoji = (t: string) => DOC_TYPES.find(d => d.id===t)?.emoji || '📄'
  const missing = DOC_TYPES.filter(dt => !docs.some(d => d.type===dt.id))
  const totalChunks = docs.reduce((s,d) => s+d.chunks, 0)
  const health = Math.round((docs.length / DOC_TYPES.length) * 100)

  const searchBrain = async () => {
    if (!query.trim() || querying) return
    setQuerying(true); setQueryResult('')
    try {
      const docContext = docs.map(d => `[${d.label}]`).join(', ')
      const text = await callAI(BRAIN_SYS, `Available documents: ${docContext}\n\nQuestion: ${query}`, 600)
      setQueryResult(text)
    } catch(e: any) {
      setQueryResult(`Error: ${e.message}`)
    }
    setQuerying(false)
  }

  const uploadDoc = async (dt: typeof DOC_TYPES[0]) => {
    setUploading(dt.id)
    await new Promise(r => setTimeout(r, 1800))
    const chunks = Math.floor(Math.random()*15)+5
    setDocs(p => [...p, { id:Date.now().toString(), type:dt.id, label:dt.label, chunks, size:`${chunks*0.8|0}KB`, addedAt:'just now' }])
    setUploading(null)
  }

  const addManual = async () => {
    if (!addText.trim() || !addTitle.trim()) return
    setUploading('manual')
    await new Promise(r => setTimeout(r, 1200))
    const words = addText.split(/\s+/).length
    const chunks = Math.max(1, Math.floor(words/80))
    setDocs(p => [...p, { id:Date.now().toString(), type:addType, label:addTitle, chunks, size:`${(words*5/1000).toFixed(1)}KB`, addedAt:'just now' }])
    setAddTitle(''); setAddText(''); setUploading(null)
  }

  return (
    <div style={{ flex:1, overflow:'auto', padding:'20px', background:C.bg }}>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:18, fontWeight:800, letterSpacing:-.5 }}>🧠 Company Brain</div>
        <div style={{ fontSize:12, color:C.text3, marginTop:2 }}>Shared AI memory — documents, knowledge, and context for all agents</div>
      </div>

      {/* Health */}
      <Card style={{ marginBottom:16, background:'rgba(124,109,250,0.04)', border:`0.5px solid rgba(124,109,250,0.25)` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <span style={{ fontSize:12, fontWeight:600, color:C.purple2 }}>Brain Health</span>
          <span style={{ fontSize:13, fontWeight:700, color:health>70?C.teal:health>40?C.gold:C.coral }}>{health}%</span>
        </div>
        <div style={{ height:8, background:'rgba(255,255,255,0.07)', borderRadius:8, marginBottom:12 }}>
          <div style={{ height:'100%', width:`${health}%`, background:health>70?C.teal:health>40?'linear-gradient(90deg,#facc4b,#22d3b0)':C.coral, borderRadius:8, transition:'.5s' }}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {[{label:'Documents',val:docs.length,tot:DOC_TYPES.length,color:C.purple2},{label:'Chunks indexed',val:totalChunks,tot:'∞',color:C.teal},{label:'Missing docs',val:missing.length,tot:DOC_TYPES.length,color:C.coral},{label:'Coverage',val:`${health}%`,tot:'100%',color:C.gold}].map(m => (
            <div key={m.label}>
              <div style={{ fontSize:10, color:C.text3, marginBottom:2 }}>{m.label.toUpperCase()}</div>
              <div style={{ fontSize:18, fontWeight:700, color:m.color }}>{m.val} <span style={{ fontSize:12, color:C.text3 }}>/ {m.tot}</span></div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:16 }}>
        {[{id:'docs',label:'📂 Documents'},{id:'search',label:'🔍 Memory Search'},{id:'missing',label:`⚠️ Missing (${missing.length})`},{id:'add',label:'+ Add Content'}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} style={{ padding:'8px 16px', borderRadius:8, border:`0.5px solid ${tab===t.id?C.purple:'rgba(255,255,255,0.1)'}`, background:tab===t.id?'rgba(124,109,250,0.12)':'transparent', color:tab===t.id?C.purple2:C.text3, fontSize:12, fontWeight:tab===t.id?600:400, cursor:'pointer' }}>{t.label}</button>
        ))}
      </div>

      {tab==='docs' && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {docs.map(d => (
            <div key={d.id} style={{ background:C.bg2, border:`0.5px solid ${C.border}`, borderRadius:10, padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:22, flexShrink:0 }}>{typeEmoji(d.type)}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600 }}>{d.label}</div>
                <div style={{ fontSize:11, color:C.text3, marginTop:2 }}>{d.type} · {d.chunks} chunks · {d.size} · added {d.addedAt}</div>
              </div>
              <Pill color={C.teal} bg="rgba(34,211,176,0.1)">✓ Synced</Pill>
              <button onClick={() => setDocs(p => p.filter(x => x.id!==d.id))} style={{ background:'none', border:'none', color:C.text3, cursor:'pointer', fontSize:16, padding:'0 4px' }}>✕</button>
            </div>
          ))}
          {docs.length === 0 && <Card style={{ textAlign:'center', padding:'40px' }}><div style={{ fontSize:36, marginBottom:12 }}>🧠</div><div style={{ color:C.text2 }}>No documents yet. Add content to train your agents.</div></Card>}
        </div>
      )}

      {tab==='search' && (
        <div>
          <Card style={{ marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:10, color:C.purple2 }}>🔍 Query Company Brain</div>
            <div style={{ display:'flex', gap:8, marginBottom:10 }}>
              <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key==='Enter'&&searchBrain()}
                placeholder="e.g. What's our ICP? How do we handle pricing objections?"
                style={{ flex:1, padding:'10px 14px', background:'rgba(255,255,255,0.04)', border:`0.5px solid ${C.border2}`, borderRadius:8, color:C.text, fontSize:13, outline:'none' }}/>
              <Btn onClick={searchBrain} disabled={querying}>{querying?<><Spin size={12}/>Searching…</>:'Search →'}</Btn>
            </div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {["What's our ICP?","How to handle pricing objections?","What are our top use cases?","Who are our biggest customers?"].map(q => (
                <button key={q} onClick={() => setQuery(q)} style={{ padding:'4px 10px', background:'rgba(255,255,255,0.04)', border:`0.5px solid ${C.border}`, borderRadius:20, fontSize:11, color:C.text3, cursor:'pointer' }}>{q}</button>
              ))}
            </div>
          </Card>
          {queryResult && (
            <Card style={{ background:'rgba(34,211,176,0.04)', border:`0.5px solid rgba(34,211,176,0.25)` }}>
              <div style={{ fontSize:11, color:C.teal, fontWeight:600, marginBottom:8, textTransform:'uppercase', letterSpacing:.5 }}>🧠 Brain Response</div>
              <div style={{ fontSize:14, lineHeight:1.8, color:C.text, whiteSpace:'pre-wrap' }}>{queryResult}</div>
            </Card>
          )}
        </div>
      )}

      {tab==='missing' && (
        <div>
          <div style={{ background:'rgba(250,204,75,0.06)', border:`0.5px solid rgba(250,204,75,0.25)`, borderRadius:12, padding:'14px 16px', marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:600, color:C.gold, marginBottom:4 }}>⚠️ {missing.length} documents missing — AI quality is reduced</div>
            <div style={{ fontSize:12, color:C.text2 }}>Upload these docs to improve your agents' accuracy and confidence scores.</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:10 }}>
            {missing.map(dt => (
              <div key={dt.id} style={{ background:C.bg2, border:`0.5px solid ${C.border}`, borderRadius:10, padding:'14px 16px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <span style={{ fontSize:20 }}>{dt.emoji}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600 }}>{dt.label}</div>
                    <div style={{ fontSize:11, color:C.text3 }}>{dt.example}</div>
                  </div>
                </div>
                <button onClick={() => uploadDoc(dt)} disabled={uploading===dt.id}
                  style={{ width:'100%', padding:'8px', background:'rgba(124,109,250,0.1)', border:`0.5px solid rgba(124,109,250,0.3)`, borderRadius:8, color:C.purple2, fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  {uploading===dt.id?<><Spin size={11} color={C.purple}/>Uploading & indexing…</>:'+ Upload this document'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='add' && (
        <Card>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>Add Content to Company Brain</div>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:12, color:C.text2, marginBottom:6 }}>Document type</div>
            <select value={addType} onChange={e => setAddType(e.target.value)} style={{ width:'100%', padding:'9px 12px', background:C.bg3, border:`0.5px solid ${C.border2}`, borderRadius:8, color:C.text, fontSize:13, outline:'none' }}>
              {DOC_TYPES.map(dt => <option key={dt.id} value={dt.id}>{dt.emoji} {dt.label}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:12, color:C.text2, marginBottom:6 }}>Document title</div>
            <input value={addTitle} onChange={e => setAddTitle(e.target.value)} placeholder="e.g. Sales Playbook Q3 2026"
              style={{ width:'100%', padding:'9px 12px', background:'rgba(255,255,255,0.04)', border:`0.5px solid ${C.border2}`, borderRadius:8, color:C.text, fontSize:13, outline:'none' }}/>
          </div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12, color:C.text2, marginBottom:6 }}>Paste your content</div>
            <textarea value={addText} onChange={e => setAddText(e.target.value)}
              placeholder="Paste your document content here. The longer and more detailed, the smarter your agents become…"
              style={{ width:'100%', minHeight:180, padding:'12px 14px', background:'rgba(255,255,255,0.04)', border:`0.5px solid ${C.border2}`, borderRadius:8, color:C.text, fontSize:13, outline:'none', lineHeight:1.6, resize:'vertical', fontFamily:'inherit' }}/>
            <div style={{ fontSize:11, color:C.text3, marginTop:4 }}>{addText.split(/\s+/).filter(Boolean).length} words · ~{Math.max(1,Math.floor(addText.split(/\s+/).length/80))} chunks</div>
          </div>
          <Btn onClick={addManual} disabled={uploading==='manual'||!addText.trim()||!addTitle.trim()} style={{ display:'flex', alignItems:'center', gap:8 }}>
            {uploading==='manual'?<><Spin size={12}/>Indexing…</>:'🧠 Add to Company Brain'}
          </Btn>
        </Card>
      )}
    </div>
  )
}
