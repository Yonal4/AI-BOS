import { useState } from 'react'
import { C } from '../design'
import { Card, Btn, Badge, Pill, Spin, KpiGrid } from '../components/ui'
import { callAI } from '../utils/ai'

const LEXI_SYS = `You are Lexi, AI Marketing Manager for AI BOS (AI Business Operating System). Bold, direct, outcome-focused. No fluff. Produce one concrete deliverable — either a LinkedIn post, email subject line list, campaign brief, or ad copy. Make it specific and high-converting.`

const CAMPAIGNS = [
  { id:1, name:'Q3 Revenue Push', type:'Email', status:'Active', sent:1240, opens:'62%', clicks:'18%', revenue:'$8,200' },
  { id:2, name:'LinkedIn Thought Leadership', type:'Social', status:'Active', sent:8, opens:'—', clicks:'4.2%', revenue:'$3,100' },
  { id:3, name:'Competitor Comparison', type:'Content', status:'Draft', sent:0, opens:'—', clicks:'—', revenue:'—' },
  { id:4, name:'Product Launch — Command Center', type:'Email', status:'Scheduled', sent:0, opens:'—', clicks:'—', revenue:'—' },
]

export default function MarketingHub() {
  const [view, setView] = useState('campaigns')
  const [generating, setGenerating] = useState(false)
  const [contentType, setContentType] = useState('linkedin')
  const [prompt, setPrompt] = useState('')
  const [output, setOutput] = useState('')

  const generate = async () => {
    if (!prompt.trim() || generating) return
    setGenerating(true); setOutput('')
    try {
      const types: Record<string,string> = {
        linkedin:'Write a high-performing LinkedIn post (150-200 words)',
        email:'Write 5 high-converting email subject lines',
        ad:'Write a LinkedIn ad (headline + body + CTA under 100 words)',
        blog:'Write a blog post outline with 5 sections',
      }
      const text = await callAI(LEXI_SYS, `${types[contentType]} for this topic/goal: ${prompt}`, 600)
      setOutput(text)
    } catch(e: any) { setOutput(`Error: ${e.message}`) }
    setGenerating(false)
  }

  return (
    <div style={{ flex:1, overflow:'auto', padding:'20px', background:C.bg }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div><div style={{ fontSize:18, fontWeight:800, letterSpacing:-.5 }}>📣 Marketing Hub</div><div style={{ fontSize:12, color:C.text3, marginTop:2 }}>Lexi runs campaigns, creates content, and drives growth</div></div>
        <div style={{ display:'flex', gap:8 }}>
          {['campaigns','content','email','analytics','seo'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding:'6px 14px', borderRadius:8, border:`0.5px solid ${view===v?C.coral:C.border}`, background:view===v?'rgba(240,106,64,0.12)':'transparent', color:view===v?C.coral:C.text3, fontSize:12, cursor:'pointer', textTransform:'capitalize' }}>{v==='seo'?'SEO':v}</button>
          ))}
        </div>
      </div>

      <KpiGrid items={[
        { label:'Campaigns Active', value:CAMPAIGNS.filter(c=>c.status==='Active').length, color:C.coral },
        { label:'Email Opens', value:'62%', sub:'↑ 8% vs last month', color:C.teal },
        { label:'Leads Generated', value:'48', sub:'This month', color:C.purple2 },
        { label:'Marketing Revenue', value:'$11.3K', sub:'Attributed MRR', color:C.gold },
      ]}/>

      {view==='campaigns' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <span style={{ fontSize:13, fontWeight:600 }}>Active Campaigns</span>
            <Btn style={{ fontSize:11, padding:'5px 12px' }}>+ New Campaign</Btn>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {CAMPAIGNS.map(c => (
              <Card key={c.id}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:13, fontWeight:600 }}>{c.name}</span>
                      <Badge type={c.status==='Active'?'success':c.status==='Draft'?'default':'info'}>{c.status}</Badge>
                      <Pill color={C.text3} bg="rgba(255,255,255,0.05)">{c.type}</Pill>
                    </div>
                    <div style={{ display:'flex', gap:20 }}>
                      {[{l:'Sent',v:c.sent.toLocaleString()},{l:'Opens',v:c.opens},{l:'Clicks',v:c.clicks},{l:'Revenue',v:c.revenue}].map(k => (
                        <div key={k.l}>
                          <span style={{ fontSize:10, color:C.text3 }}>{k.l}: </span>
                          <span style={{ fontSize:12, fontWeight:600, color:k.l==='Revenue'?C.gold:C.text }}>{k.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    {c.status==='Draft'&&<Btn style={{ fontSize:11, padding:'5px 12px' }}>Launch</Btn>}
                    {c.status==='Active'&&<Btn variant="ghost" style={{ fontSize:11, padding:'5px 12px' }}>Pause</Btn>}
                    <Btn variant="ghost" style={{ fontSize:11, padding:'5px 12px' }}>View</Btn>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {view==='content' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Card>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:12, color:C.coral }}>📣 Lexi — Content Generator</div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:12, color:C.text2, marginBottom:6 }}>Content type</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {[{id:'linkedin',label:'LinkedIn Post'},{id:'email',label:'Email Subject Lines'},{id:'ad',label:'Ad Copy'},{id:'blog',label:'Blog Outline'}].map(t => (
                  <button key={t.id} onClick={() => setContentType(t.id)} style={{ padding:'6px 12px', borderRadius:20, border:`0.5px solid ${contentType===t.id?C.coral:C.border}`, background:contentType===t.id?'rgba(240,106,64,0.12)':'transparent', color:contentType===t.id?C.coral:C.text3, fontSize:12, cursor:'pointer' }}>{t.label}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:12, color:C.text2, marginBottom:6 }}>Topic or goal</div>
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                placeholder="e.g. Why AI employees beat hiring — focus on ROI and speed"
                style={{ width:'100%', minHeight:80, padding:'10px 12px', background:'rgba(255,255,255,0.04)', border:`0.5px solid ${C.border2}`, borderRadius:8, color:C.text, fontSize:13, outline:'none', resize:'none', fontFamily:'inherit', lineHeight:1.6 }}/>
            </div>
            <Btn onClick={generate} disabled={generating||!prompt.trim()} style={{ width:'100%', display:'flex', alignItems:'center', gap:8, justifyContent:'center', background:C.coral }}>
              {generating?<><Spin/>Lexi is creating…</>:'📣 Generate Content'}
            </Btn>
          </Card>
          <Card>
            {output ? (
              <div>
                <div style={{ fontSize:11, color:C.coral, fontWeight:600, marginBottom:8, textTransform:'uppercase' }}>📣 Lexi's Output</div>
                <div style={{ fontSize:13, lineHeight:1.8, color:C.text, whiteSpace:'pre-wrap', marginBottom:12 }}>{output}</div>
                <div style={{ display:'flex', gap:8 }}>
                  <Btn style={{ flex:1, fontSize:11, background:C.coral }}>✓ Approve & Schedule</Btn>
                  <Btn variant="ghost" style={{ flex:1, fontSize:11 }}>↺ Regenerate</Btn>
                </div>
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'40px', color:C.text3, fontSize:13 }}>
                <div style={{ fontSize:32, marginBottom:12 }}>📣</div>
                Content will appear here after generation
              </div>
            )}
          </Card>
        </div>
      )}

      {view==='email' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:14 }}>
          <Card>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Email Sequences</div>
            {[{name:'Onboarding Welcome Series',emails:5,active:240,opens:'71%',status:'Active'},{name:'Re-engagement Campaign',emails:3,active:89,opens:'42%',status:'Active'},{name:'Upgrade to Team Plan',emails:4,active:52,opens:'58%',status:'Paused'},{name:'Churn Prevention',emails:6,active:8,opens:'83%',status:'Active'}].map((seq,i) => (
              <div key={i} style={{ display:'flex', gap:12, padding:'12px 0', borderBottom:`0.5px solid ${C.border}`, alignItems:'center' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:500 }}>{seq.name}</div>
                  <div style={{ fontSize:11, color:C.text3, marginTop:2 }}>{seq.emails} emails · {seq.active} active subscribers · {seq.opens} open rate</div>
                </div>
                <Badge type={seq.status==='Active'?'success':'warning'}>{seq.status}</Badge>
                <button style={{ fontSize:11, padding:'4px 10px', background:'transparent', border:`0.5px solid ${C.border}`, borderRadius:6, color:C.text3, cursor:'pointer' }}>Edit</button>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:12, color:C.coral }}>📣 Lexi's Email Stats</div>
            {[{l:'Emails sent today',v:'847',c:C.teal},{l:'Avg open rate',v:'62%',c:C.purple2},{l:'Avg click rate',v:'18%',c:C.gold},{l:'Unsubscribe rate',v:'0.2%',c:C.green},{l:'Revenue attributed',v:'$8,200',c:C.coral}].map(s => (
              <div key={s.l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:`0.5px solid ${C.border}` }}>
                <span style={{ fontSize:12, color:C.text2 }}>{s.l}</span>
                <span style={{ fontSize:13, fontWeight:700, color:s.c }}>{s.v}</span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {view==='analytics' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Card>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Channel Performance</div>
            {[{ch:'Email',leads:24,mrr:'$4,800',roi:'12x'},{ch:'LinkedIn',leads:12,mrr:'$3,200',roi:'8x'},{ch:'Content/SEO',leads:8,mrr:'$1,600',roi:'∞'},{ch:'Paid Ads',leads:4,mrr:'$800',roi:'2x'}].map((r,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:`0.5px solid ${C.border}`, alignItems:'center' }}>
                <span style={{ fontSize:13, fontWeight:500 }}>{r.ch}</span>
                <div style={{ display:'flex', gap:16 }}>
                  <span style={{ fontSize:12, color:C.text3 }}>{r.leads} leads</span>
                  <span style={{ fontSize:12, color:C.gold }}>{r.mrr}</span>
                  <span style={{ fontSize:12, color:C.teal }}>ROI: {r.roi}</span>
                </div>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:12, color:C.coral }}>📣 Lexi's Recommendations</div>
            {['Double down on email — highest ROI at 12x','LinkedIn audience growing — increase post frequency','Competitor comparison page would capture 4,200/mo searches','Activate re-engagement for 47 cold leads from March'].map((r,i) => (
              <div key={i} style={{ display:'flex', gap:8, padding:'8px 0', borderBottom:`0.5px solid ${C.border}`, alignItems:'flex-start' }}>
                <span style={{ color:C.coral, fontWeight:700, flexShrink:0 }}>→</span>
                <span style={{ fontSize:12, color:C.text2, lineHeight:1.5 }}>{r}</span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {view==='seo' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Card>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Top Keywords</div>
            {[{kw:'AI business operating system',pos:4,vol:'2.4K',trend:'↑'},{kw:'AI employees for business',pos:7,vol:'1.8K',trend:'↑'},{kw:'automate business with AI',pos:12,vol:'3.2K',trend:'→'},{kw:'AI sales rep software',pos:9,vol:'980',trend:'↑'},{kw:'AI support agent',pos:3,vol:'1.2K',trend:'↑'}].map((k,i) => (
              <div key={i} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:`0.5px solid ${C.border}`, alignItems:'center' }}>
                <span style={{ fontSize:11, color:C.text3, width:16, textAlign:'center' }}>#{k.pos}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:500 }}>{k.kw}</div>
                  <div style={{ fontSize:10, color:C.text3 }}>{k.vol}/mo searches</div>
                </div>
                <span style={{ fontSize:12, color:k.trend==='↑'?C.teal:C.text3 }}>{k.trend}</span>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Lexi's SEO Recommendations</div>
            {['Add FAQ schema to pricing page — 3 featured snippets available','Update meta for \'AI employees\' — competitor outranks by 0.3 score','Publish case study: Nexus AI 10x meetings — targets 3 keywords','Internal link \'Company Brain\' from product docs to landing page','Create comparison page: AI BOS vs HubSpot — 4,200 monthly searches'].map((r,i) => (
              <div key={i} style={{ display:'flex', gap:8, padding:'8px 0', borderBottom:`0.5px solid ${C.border}`, alignItems:'flex-start' }}>
                <span style={{ color:C.teal, fontWeight:700, flexShrink:0 }}>→</span>
                <span style={{ fontSize:12, color:C.text2, lineHeight:1.5 }}>{r}</span>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  )
}
