import { useState, useEffect, useCallback, useRef } from 'react'
import { C } from '../design'
import { Card, Btn, Badge, Spin } from '../components/ui'
import { callAI } from '../utils/ai'
import { useOrgId } from '../context/OrgContext'

// ─── Types ────────────────────────────────────────────────────────────────────
const STAGES = ['New','Qualified','Contacted','Proposal Sent','Won','Lost'] as const
type Stage = typeof STAGES[number]

const SOURCES = ['Manual','LinkedIn','Website','Referral','Cold Email','Outbound','Event','Partner','Other']
const AGENTS  = ['aria','marcus','lexi','felix','nova']

interface Lead {
  id:             number
  org_id:         string
  name:           string
  email:          string | null
  company:        string | null
  source:         string
  status:         Stage
  notes:          string | null
  assigned_agent: string
  value:          number
  score:          number
  created_at:     string
  updated_at:     string
}

interface Stats {
  total:number; new_count:number; qualified:number; contacted:number
  proposal_sent:number; won:number; lost:number
  pipeline_value:number; won_value:number; avg_score:number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STAGE_META: Record<Stage,{color:string; bg:string; dot:string}> = {
  'New':          { color:C.text3,   bg:'rgba(107,107,136,0.12)', dot:C.text3   },
  'Qualified':    { color:C.purple2, bg:'rgba(124,109,250,0.12)', dot:C.purple  },
  'Contacted':    { color:C.gold,    bg:'rgba(250,204,75,0.12)',  dot:C.gold    },
  'Proposal Sent':{ color:C.coral,   bg:'rgba(240,106,64,0.12)',  dot:C.coral   },
  'Won':          { color:C.teal,    bg:'rgba(34,211,176,0.12)',  dot:C.teal    },
  'Lost':         { color:'#ff6b6b', bg:'rgba(255,107,107,0.10)', dot:'#ff6b6b' },
}

function stagePill(status: Stage) {
  const m = STAGE_META[status] || STAGE_META['New']
  return (
    <span style={{ padding:'3px 9px', borderRadius:20, fontSize:11, fontWeight:600,
      color:m.color, background:m.bg, whiteSpace:'nowrap' }}>
      {status}
    </span>
  )
}

function scoreBar(score: number) {
  const color = score>=90?C.teal : score>=70?C.gold : C.coral
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <div style={{ flex:1, height:4, background:'rgba(255,255,255,0.07)', borderRadius:4 }}>
        <div style={{ height:'100%', width:`${score}%`, background:color, borderRadius:4, transition:'.3s' }}/>
      </div>
      <span style={{ fontSize:11, fontWeight:700, color, minWidth:24 }}>{score}</span>
    </div>
  )
}

function fmt(n:number){ return n>=1000?`$${(n/1000).toFixed(1)}K`:`$${n}` }
function ago(iso:string){ const d=(Date.now()-new Date(iso).getTime())/1000; return d<3600?`${Math.floor(d/60)}m ago`:d<86400?`${Math.floor(d/3600)}h ago`:d<604800?`${Math.floor(d/86400)}d ago`:`${Math.floor(d/86400/7)}w ago` }

const ARIA_SYS = `You are Aria, elite AI Sales SDR for AI BOS (AI Business Operating System, $299–$1,999/mo). Write a sharp, personalized cold email under 130 words. No fluff. Focus on their specific pain. Sign as Aria, AI Sales Rep at AI BOS.`

// ─── Add / Edit Modal ──────────────────────────────────────────────────────────
function LeadModal({ lead, onSave, onClose }: {
  lead: Partial<Lead> | null
  onSave: (data: Partial<Lead>) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState<Partial<Lead>>({
    name:'', email:'', company:'', source:'Manual', status:'New',
    notes:'', assigned_agent:'aria', value:0, score:50,
    ...lead
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState('')

  const field = (k: keyof Lead, label: string, type='text', opts?: string[]) => (
    <div style={{ marginBottom:12 }}>
      <div style={{ fontSize:11, color:C.text3, marginBottom:4, fontWeight:500, textTransform:'uppercase', letterSpacing:.4 }}>{label}</div>
      {opts ? (
        <select value={String(form[k]??'')} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}
          style={{ width:'100%',padding:'8px 10px',background:'rgba(255,255,255,0.04)',border:`0.5px solid ${C.border2}`,borderRadius:7,color:C.text,fontSize:13,outline:'none' }}>
          {opts.map(o=><option key={o} value={o}>{o}</option>)}
        </select>
      ) : type==='textarea' ? (
        <textarea value={String(form[k]??'')} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}
          rows={3} style={{ width:'100%',padding:'8px 10px',background:'rgba(255,255,255,0.04)',border:`0.5px solid ${C.border2}`,borderRadius:7,color:C.text,fontSize:13,outline:'none',resize:'vertical',fontFamily:'inherit',lineHeight:1.5 }}/>
      ) : (
        <input type={type} value={String(form[k]??'')} onChange={e=>setForm(p=>({...p,[k]: type==='number'?+e.target.value:e.target.value}))}
          style={{ width:'100%',padding:'8px 10px',background:'rgba(255,255,255,0.04)',border:`0.5px solid ${C.border2}`,borderRadius:7,color:C.text,fontSize:13,outline:'none' }}/>
      )}
    </div>
  )

  const handleSave = async () => {
    if (!form.name?.trim()) { setErr('Name is required'); return }
    setSaving(true)
    try { await onSave(form) }
    catch(e:any) { setErr(e.message) }
    setSaving(false)
  }

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:24 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:C.bg2,border:`0.5px solid ${C.border2}`,borderRadius:14,width:'100%',maxWidth:520,maxHeight:'90vh',overflow:'auto',padding:24 }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
          <div style={{ fontSize:15,fontWeight:700 }}>{lead?.id ? '✏️ Edit Lead' : '➕ New Lead'}</div>
          <button onClick={onClose} style={{ background:'none',border:'none',color:C.text3,fontSize:18,cursor:'pointer',lineHeight:1 }}>✕</button>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 16px' }}>
          <div style={{ gridColumn:'1/-1' }}>{field('name','Name')}</div>
          <div>{field('email','Email','email')}</div>
          <div>{field('company','Company')}</div>
          <div>{field('source','Source','text',SOURCES)}</div>
          <div>{field('status','Stage','text',[...STAGES])}</div>
          <div>{field('value','Deal Value ($)','number')}</div>
          <div>{field('score','Lead Score (0–100)','number')}</div>
          <div>{field('assigned_agent','Assigned Agent','text',AGENTS)}</div>
        </div>
        <div>{field('notes','Notes','textarea')}</div>
        {err && <div style={{ color:C.coral,fontSize:12,marginBottom:10 }}>{err}</div>}
        <div style={{ display:'flex',gap:10,justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ padding:'8px 18px',background:'transparent',border:`0.5px solid ${C.border2}`,borderRadius:8,color:C.text3,fontSize:13,cursor:'pointer' }}>Cancel</button>
          <Btn onClick={handleSave} disabled={saving}>
            {saving ? <Spin size={12}/> : (lead?.id ? 'Save Changes' : 'Create Lead')}
          </Btn>
        </div>
      </div>
    </div>
  )
}

// ─── Lead Detail Panel ──────────────────────────────────────────────────────────
function LeadPanel({ lead, onClose, onUpdate, onDelete, orgHeaders }: {
  lead: Lead
  onClose: () => void
  onUpdate: (id:number, data:Partial<Lead>) => Promise<void>
  onDelete: (id:number) => Promise<void>
  orgHeaders: Record<string,string>
}) {
  const [editing, setEditing] = useState(false)
  const [drafting, setDrafting] = useState(false)
  const [draft, setDraft]       = useState('')
  const [statusChanging, setStatusChanging] = useState(false)

  const draftEmail = async () => {
    setDrafting(true); setDraft('')
    try {
      const txt = await callAI(ARIA_SYS,
        `Draft a personalized cold email to ${lead.name}${lead.company?` at ${lead.company}`:''}. Stage: ${lead.status}. Source: ${lead.source}. Deal value: $${lead.value}/mo. Score: ${lead.score}/100.${lead.notes?` Context: ${lead.notes}`:''}`, 450)
      setDraft(txt)
    } catch(e:any){ setDraft(`Error: ${e.message}`) }
    setDrafting(false)
  }

  const changeStatus = async (s: Stage) => {
    setStatusChanging(true)
    await onUpdate(lead.id, { status: s })
    setStatusChanging(false)
  }

  const agentEmoji: Record<string,string> = { aria:'📊',marcus:'🎧',lexi:'📣',felix:'💰',nova:'⚙️' }

  return (
    <>
      <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',zIndex:900 }} onClick={onClose}/>
      <div style={{ position:'fixed',top:0,right:0,bottom:0,width:480,background:C.bg2,borderLeft:`0.5px solid ${C.border2}`,zIndex:901,overflow:'auto',display:'flex',flexDirection:'column' }}>
        {/* Header */}
        <div style={{ padding:'20px 24px 16px',borderBottom:`0.5px solid ${C.border}`,display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
          <div>
            <div style={{ fontSize:17,fontWeight:800,letterSpacing:-.3,marginBottom:4 }}>{lead.name}</div>
            {lead.company && <div style={{ fontSize:13,color:C.text3 }}>{lead.company}</div>}
            {lead.email   && <div style={{ fontSize:12,color:C.purple2 }}>{lead.email}</div>}
          </div>
          <div style={{ display:'flex',gap:8,alignItems:'center' }}>
            <button onClick={() => setEditing(true)} style={{ padding:'6px 12px',background:'rgba(255,255,255,0.04)',border:`0.5px solid ${C.border2}`,borderRadius:7,color:C.text3,fontSize:12,cursor:'pointer' }}>✏️ Edit</button>
            <button onClick={onClose} style={{ background:'none',border:'none',color:C.text3,fontSize:18,cursor:'pointer' }}>✕</button>
          </div>
        </div>

        <div style={{ flex:1,padding:'20px 24px',overflowY:'auto' }}>
          {/* Score + Agent */}
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20 }}>
            <div style={{ padding:'12px 14px',background:C.bg3,border:`0.5px solid ${C.border}`,borderRadius:10 }}>
              <div style={{ fontSize:10,color:C.text3,marginBottom:6,textTransform:'uppercase',letterSpacing:.5 }}>Lead Score</div>
              {scoreBar(lead.score)}
            </div>
            <div style={{ padding:'12px 14px',background:C.bg3,border:`0.5px solid ${C.border}`,borderRadius:10 }}>
              <div style={{ fontSize:10,color:C.text3,marginBottom:4,textTransform:'uppercase',letterSpacing:.5 }}>Deal Value</div>
              <div style={{ fontSize:16,fontWeight:700,color:C.teal }}>{fmt(lead.value)}<span style={{ fontSize:11,color:C.text3 }}>/mo</span></div>
            </div>
          </div>

          {/* Info */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11,color:C.text3,marginBottom:10,textTransform:'uppercase',letterSpacing:.5 }}>Details</div>
            {[
              ['Source', lead.source],
              ['Assigned Agent', `${agentEmoji[lead.assigned_agent]||'🤖'} ${lead.assigned_agent}`],
              ['Added', ago(lead.created_at)],
              ['Updated', ago(lead.updated_at)],
            ].map(([k,v]) => (
              <div key={k} style={{ display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:`0.5px solid ${C.border}`,fontSize:13 }}>
                <span style={{ color:C.text3 }}>{k}</span>
                <span style={{ color:C.text2,fontWeight:500 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Stage switcher */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11,color:C.text3,marginBottom:10,textTransform:'uppercase',letterSpacing:.5 }}>Stage {statusChanging && <Spin size={10}/>}</div>
            <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>
              {STAGES.map(s => {
                const m = STAGE_META[s]
                const active = lead.status === s
                return (
                  <button key={s} onClick={() => !active && changeStatus(s)}
                    style={{ padding:'5px 12px',borderRadius:20,fontSize:11,fontWeight:600,cursor:active?'default':'pointer',
                      color: active?m.color:C.text3,
                      background: active?m.bg:'transparent',
                      border: `0.5px solid ${active?m.dot:C.border}`,
                      transition:'.15s' }}>
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11,color:C.text3,marginBottom:8,textTransform:'uppercase',letterSpacing:.5 }}>Notes</div>
              <div style={{ background:C.bg3,border:`0.5px solid ${C.border}`,borderRadius:8,padding:'12px 14px',fontSize:13,color:C.text2,lineHeight:1.6 }}>{lead.notes}</div>
            </div>
          )}

          {/* Aria email draft */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11,color:C.text3,marginBottom:10,textTransform:'uppercase',letterSpacing:.5 }}>📊 Aria — AI Outreach</div>
            <button onClick={draftEmail} disabled={drafting}
              style={{ width:'100%',padding:'10px',background:'rgba(124,109,250,0.08)',border:`0.5px solid rgba(124,109,250,0.3)`,borderRadius:8,color:C.purple2,fontSize:13,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
              {drafting ? <><Spin size={12}/> Aria is writing…</> : '✉️ Draft Personalized Email'}
            </button>
            {draft && (
              <div style={{ marginTop:10,background:C.bg3,border:`0.5px solid ${C.border}`,borderRadius:8,padding:'14px',fontSize:12,lineHeight:1.7,color:C.text2,whiteSpace:'pre-wrap' }}>
                {draft}
                <div style={{ display:'flex',gap:8,marginTop:10 }}>
                  <button onClick={()=>navigator.clipboard?.writeText(draft)}
                    style={{ padding:'5px 12px',background:'rgba(34,211,176,0.08)',border:`0.5px solid rgba(34,211,176,0.25)`,borderRadius:6,color:C.teal,fontSize:11,cursor:'pointer' }}>📋 Copy</button>
                  <button onClick={draftEmail}
                    style={{ padding:'5px 12px',background:'rgba(255,255,255,0.04)',border:`0.5px solid ${C.border2}`,borderRadius:6,color:C.text3,fontSize:11,cursor:'pointer' }}>🔄 Regenerate</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete */}
        <div style={{ padding:'14px 24px',borderTop:`0.5px solid ${C.border}` }}>
          <button onClick={async ()=>{ if(confirm('Delete this lead?')){ await onDelete(lead.id); onClose() } }}
            style={{ width:'100%',padding:'8px',background:'rgba(255,107,107,0.06)',border:`0.5px solid rgba(255,107,107,0.25)`,borderRadius:8,color:'#ff6b6b',fontSize:12,cursor:'pointer' }}>
            🗑 Delete Lead
          </button>
        </div>
      </div>
      {editing && (
        <LeadModal lead={lead} onClose={()=>setEditing(false)}
          onSave={async d=>{ await onUpdate(lead.id,d); setEditing(false) }}/>
      )}
    </>
  )
}

// ─── Kanban Column ─────────────────────────────────────────────────────────────
function KanbanColumn({ stage, leads, onSelect }: { stage:Stage; leads:Lead[]; onSelect:(l:Lead)=>void }) {
  const m = STAGE_META[stage]
  const total = leads.reduce((s,l)=>s+l.value,0)
  return (
    <div style={{ minWidth:210,maxWidth:240,flex:'1 1 210px' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,padding:'0 4px' }}>
        <div style={{ display:'flex',gap:6,alignItems:'center' }}>
          <div style={{ width:7,height:7,borderRadius:'50%',background:m.dot }}/>
          <span style={{ fontSize:12,fontWeight:700,color:m.color }}>{stage}</span>
          <span style={{ background:'rgba(255,255,255,0.07)',borderRadius:10,padding:'1px 7px',fontSize:10,color:C.text3 }}>{leads.length}</span>
        </div>
        {leads.length>0 && <span style={{ fontSize:10,color:C.text3 }}>{fmt(total)}</span>}
      </div>
      <div style={{ display:'flex',flexDirection:'column',gap:7 }}>
        {leads.map(l=>(
          <div key={l.id} onClick={()=>onSelect(l)}
            style={{ background:C.bg3,border:`0.5px solid ${C.border}`,borderRadius:10,padding:'12px 12px',cursor:'pointer',transition:'.15s' }}
            onMouseEnter={e=>(e.currentTarget.style.borderColor=m.dot)}
            onMouseLeave={e=>(e.currentTarget.style.borderColor=C.border)}>
            <div style={{ fontSize:13,fontWeight:600,marginBottom:2,color:C.text }}>{l.name}</div>
            {l.company && <div style={{ fontSize:11,color:C.text3,marginBottom:6 }}>{l.company}</div>}
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <span style={{ fontSize:11,color:C.teal,fontWeight:600 }}>{fmt(l.value)}</span>
              <span style={{ fontSize:10,color:l.score>=80?C.teal:l.score>=60?C.gold:C.coral,fontWeight:700 }}>{l.score}</span>
            </div>
            {l.source && <div style={{ fontSize:10,color:C.text3,marginTop:4 }}>{l.source}</div>}
          </div>
        ))}
        {leads.length===0 && <div style={{ textAlign:'center',padding:'20px 12px',color:C.text3,fontSize:11,border:`0.5px dashed ${C.border}`,borderRadius:10 }}>No leads</div>}
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function SalesHub() {
  const orgId = useOrgId()
  const [view,        setView]        = useState<'pipeline'|'leads'|'outreach'>('pipeline')
  const [leads,       setLeads]       = useState<Lead[]>([])
  const [stats,       setStats]       = useState<Stats|null>(null)
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [filterStage, setFilterStage] = useState<Stage|'All'>('All')
  const [selected,    setSelected]    = useState<Lead|null>(null)
  const [showModal,   setShowModal]   = useState(false)

  const orgHeaders = useCallback((): Record<string,string> =>
    orgId ? { 'x-org-id': orgId } : {}, [orgId])

  const api = useCallback(async (path:string, opts:RequestInit={}) => {
    const res = await fetch(`/api/leads${path}`, {
      ...opts,
      headers: { ...orgHeaders(), ...(opts.headers as Record<string,string>||{}) }
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Request failed')
    return data
  }, [orgHeaders])

  const fetchAll = useCallback(async () => {
    try {
      const [ld, st] = await Promise.all([api('/'), api('/stats')])
      setLeads(ld.leads)
      setStats(st)
    } catch { /* ignore */ }
    setLoading(false)
  }, [api])

  useEffect(() => { fetchAll() }, [fetchAll])

  const createLead = async (data: Partial<Lead>) => {
    await api('/', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) })
    setShowModal(false)
    fetchAll()
  }

  const updateLead = async (id:number, data:Partial<Lead>) => {
    const { lead } = await api(`/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) })
    setLeads(prev => prev.map(l => l.id===id ? lead : l))
    if (selected?.id===id) setSelected(lead)
  }

  const deleteLead = async (id:number) => {
    await api(`/${id}`, { method:'DELETE' })
    setLeads(prev => prev.filter(l => l.id!==id))
    setSelected(null)
    fetchAll()
  }

  // filtered list
  const filtered = leads.filter(l => {
    const q = search.toLowerCase()
    const matchSearch = !q || l.name.toLowerCase().includes(q) || (l.company||'').toLowerCase().includes(q) || (l.email||'').toLowerCase().includes(q)
    const matchStage  = filterStage==='All' || l.status===filterStage
    return matchSearch && matchStage
  })

  const byStage = (s:Stage) => leads.filter(l=>l.status===s)
  const pipelineValue = leads.filter(l=>!['Won','Lost'].includes(l.status)).reduce((s,l)=>s+l.value,0)

  // ─── Outreach tab ────────────────────────────────────────────────────
  const [bulkTarget,  setBulkTarget]  = useState<Stage>('New')
  const [bulkDrafts,  setBulkDrafts]  = useState<{lead:Lead;text:string}[]>([])
  const [bulkLoading, setBulkLoading] = useState(false)

  const runBulkOutreach = async () => {
    const targets = leads.filter(l=>l.status===bulkTarget).slice(0,5)
    if (!targets.length) return
    setBulkLoading(true); setBulkDrafts([])
    const results: {lead:Lead;text:string}[] = []
    for (const lead of targets) {
      try {
        const text = await callAI(ARIA_SYS,
          `Write a personalized cold email to ${lead.name}${lead.company?` at ${lead.company}`:''}. Stage: ${lead.status}. Source: ${lead.source}. Deal: $${lead.value}/mo.${lead.notes?` Context: ${lead.notes}`:''} Keep under 120 words.`, 350)
        results.push({ lead, text })
      } catch { results.push({ lead, text:'Failed to generate.' }) }
      setBulkDrafts([...results])
    }
    setBulkLoading(false)
  }

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg, overflow:'hidden' }}>

      {/* TOP BAR */}
      <div style={{ padding:'16px 20px 0', flexShrink:0 }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
          <div>
            <div style={{ fontSize:18,fontWeight:800,letterSpacing:-.5 }}>📊 Sales Hub</div>
            <div style={{ fontSize:12,color:C.text3,marginTop:1 }}>Aria manages your pipeline · {leads.length} leads</div>
          </div>
          <div style={{ display:'flex',gap:8 }}>
            {(['pipeline','leads','outreach'] as const).map(v=>(
              <button key={v} onClick={()=>setView(v)}
                style={{ padding:'6px 14px',borderRadius:8,border:`0.5px solid ${view===v?C.purple:C.border}`,background:view===v?'rgba(124,109,250,0.12)':'transparent',color:view===v?C.purple2:C.text3,fontSize:12,cursor:'pointer',textTransform:'capitalize',fontWeight:view===v?600:400 }}>
                {v}
              </button>
            ))}
            <Btn onClick={()=>setShowModal(true)} style={{ padding:'6px 14px', fontSize:12 }}>+ Add Lead</Btn>
          </div>
        </div>

        {/* KPI ROW */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:16 }}>
          {[
            { label:'Pipeline',     value:fmt(pipelineValue),             color:C.teal    },
            { label:'Won',          value:stats?fmt(stats.won_value):'—', color:C.green   },
            { label:'Avg Score',    value:stats?`${stats.avg_score}`:' —',color:C.purple2 },
            { label:'Active',       value:stats?String(stats.qualified+stats.contacted+stats.proposal_sent):'—', color:C.gold },
            { label:'Closed Won',   value:stats?String(stats.won):'—',    color:C.teal    },
          ].map(k=>(
            <div key={k.label} style={{ background:C.bg2,border:`0.5px solid ${C.border}`,borderRadius:10,padding:'10px 14px' }}>
              <div style={{ fontSize:10,color:C.text3,marginBottom:3,textTransform:'uppercase',letterSpacing:.5 }}>{k.label}</div>
              <div style={{ fontSize:18,fontWeight:700,color:k.color }}>{loading?'—':k.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex:1,overflow:'auto',padding:'0 20px 20px' }}>
        {loading ? (
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:200,gap:10,color:C.text3 }}>
            <Spin size={18}/> Loading leads…
          </div>
        ) : view==='pipeline' ? (

          /* ── KANBAN ── */
          <div style={{ overflowX:'auto', paddingBottom:8 }}>
            <div style={{ display:'flex',gap:12,minWidth:1200 }}>
              {STAGES.map(s=>(
                <KanbanColumn key={s} stage={s} leads={byStage(s)} onSelect={setSelected}/>
              ))}
            </div>
          </div>

        ) : view==='leads' ? (

          /* ── TABLE ── */
          <div>
            {/* Filters */}
            <div style={{ display:'flex',gap:10,marginBottom:14,alignItems:'center' }}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search leads…"
                style={{ flex:1,maxWidth:300,padding:'7px 12px',background:'rgba(255,255,255,0.04)',border:`0.5px solid ${C.border2}`,borderRadius:8,color:C.text,fontSize:13,outline:'none' }}/>
              <select value={filterStage} onChange={e=>setFilterStage(e.target.value as any)}
                style={{ padding:'7px 12px',background:'rgba(255,255,255,0.04)',border:`0.5px solid ${C.border2}`,borderRadius:8,color:C.text,fontSize:12,outline:'none' }}>
                <option value="All">All Stages</option>
                {STAGES.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
              <span style={{ fontSize:12,color:C.text3 }}>{filtered.length} leads</span>
            </div>

            {/* Table */}
            <div style={{ background:C.bg2,border:`0.5px solid ${C.border}`,borderRadius:12,overflow:'hidden' }}>
              <div style={{ display:'grid',gridTemplateColumns:'2fr 1.6fr 1fr 1fr 1fr 0.8fr 0.8fr',padding:'10px 16px',borderBottom:`0.5px solid ${C.border}`,fontSize:10,color:C.text3,textTransform:'uppercase',letterSpacing:.5,fontWeight:600 }}>
                <div>Lead</div><div>Company / Email</div><div>Source</div><div>Stage</div><div>Score</div><div>Value</div><div>Updated</div>
              </div>
              {filtered.length===0 && (
                <div style={{ padding:'40px 16px',textAlign:'center',color:C.text3,fontSize:13 }}>No leads match your filters.</div>
              )}
              {filtered.map((l,i)=>(
                <div key={l.id} onClick={()=>setSelected(l)}
                  style={{ display:'grid',gridTemplateColumns:'2fr 1.6fr 1fr 1fr 1fr 0.8fr 0.8fr',padding:'12px 16px',borderBottom:i<filtered.length-1?`0.5px solid ${C.border}`:'none',cursor:'pointer',transition:'.1s',alignItems:'center' }}
                  onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.02)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                  <div style={{ fontSize:13,fontWeight:600,color:C.text }}>{l.name}</div>
                  <div>
                    <div style={{ fontSize:13,color:C.text2 }}>{l.company||'—'}</div>
                    {l.email && <div style={{ fontSize:11,color:C.text3 }}>{l.email}</div>}
                  </div>
                  <div style={{ fontSize:12,color:C.text3 }}>{l.source}</div>
                  <div>{stagePill(l.status)}</div>
                  <div style={{ paddingRight:16 }}>{scoreBar(l.score)}</div>
                  <div style={{ fontSize:13,fontWeight:600,color:C.teal }}>{fmt(l.value)}</div>
                  <div style={{ fontSize:11,color:C.text3 }}>{ago(l.updated_at)}</div>
                </div>
              ))}
            </div>
          </div>

        ) : (

          /* ── OUTREACH ── */
          <div style={{ maxWidth:800 }}>
            <Card style={{ marginBottom:14 }}>
              <div style={{ fontSize:14,fontWeight:700,marginBottom:4 }}>📊 Aria — Bulk AI Outreach</div>
              <div style={{ fontSize:12,color:C.text2,marginBottom:16 }}>Aria writes personalized emails for up to 5 leads in a selected stage.</div>
              <div style={{ display:'flex',gap:10,alignItems:'center' }}>
                <select value={bulkTarget} onChange={e=>setBulkTarget(e.target.value as Stage)}
                  style={{ padding:'8px 12px',background:'rgba(255,255,255,0.04)',border:`0.5px solid ${C.border2}`,borderRadius:8,color:C.text,fontSize:13,outline:'none' }}>
                  {STAGES.map(s=>(
                    <option key={s} value={s}>{s} ({byStage(s).length} leads)</option>
                  ))}
                </select>
                <Btn onClick={runBulkOutreach} disabled={bulkLoading} style={{ whiteSpace:'nowrap' }}>
                  {bulkLoading ? <><Spin size={12}/> Writing…</> : '✉️ Generate Emails'}
                </Btn>
              </div>
            </Card>

            {bulkDrafts.map(({lead,text},i)=>(
              <Card key={lead.id} style={{ marginBottom:12 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10 }}>
                  <div>
                    <span style={{ fontSize:13,fontWeight:700 }}>{lead.name}</span>
                    {lead.company && <span style={{ fontSize:12,color:C.text3,marginLeft:8 }}>{lead.company}</span>}
                  </div>
                  {stagePill(lead.status)}
                </div>
                <div style={{ background:C.bg3,border:`0.5px solid ${C.border}`,borderRadius:8,padding:'12px 14px',fontSize:12,lineHeight:1.7,color:C.text2,whiteSpace:'pre-wrap',marginBottom:10 }}>{text}</div>
                <button onClick={()=>navigator.clipboard?.writeText(text)}
                  style={{ padding:'5px 12px',background:'rgba(34,211,176,0.08)',border:`0.5px solid rgba(34,211,176,0.25)`,borderRadius:6,color:C.teal,fontSize:11,cursor:'pointer' }}>📋 Copy Email</button>
              </Card>
            ))}

            {bulkLoading && bulkDrafts.length===0 && (
              <div style={{ display:'flex',alignItems:'center',gap:10,color:C.text3,fontSize:13,padding:20 }}>
                <Spin size={14}/> Aria is writing personalized emails…
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      {showModal && (
        <LeadModal lead={null} onClose={()=>setShowModal(false)} onSave={createLead}/>
      )}
      {selected && (
        <LeadPanel
          lead={selected}
          onClose={()=>setSelected(null)}
          onUpdate={updateLead}
          onDelete={deleteLead}
          orgHeaders={orgHeaders()}
        />
      )}
    </div>
  )
}
