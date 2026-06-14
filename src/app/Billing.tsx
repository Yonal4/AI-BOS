import { useState } from 'react'
import { C } from '../design'
import { Card, Btn, Badge, Pill } from '../components/ui'

const INVOICES = [
  { id:'INV-0024', date:'Jun 1, 2026',  amount:1999, plan:'Team', status:'Paid' },
  { id:'INV-0023', date:'May 1, 2026',  amount:1999, plan:'Team', status:'Paid' },
  { id:'INV-0022', date:'Apr 1, 2026',  amount:799,  plan:'Growth', status:'Paid' },
  { id:'INV-0021', date:'Mar 1, 2026',  amount:799,  plan:'Growth', status:'Paid' },
]

const USAGE = [
  { label:'AI Actions Used',        val:14280, limit:null,  unit:'/ mo',   pct:null },
  { label:'Agents Active',          val:5,     limit:5,     unit:'/ 5',    pct:100  },
  { label:'Company Brain Chunks',   val:156,   limit:1000,  unit:'/ 1,000',pct:16   },
  { label:'API Calls (Anthropic)',  val:4280,  limit:null,  unit:'/ mo',   pct:null },
  { label:'Users / Seats',          val:3,     limit:10,    unit:'/ 10',   pct:30   },
  { label:'Integrations Connected', val:5,     limit:20,    unit:'/ 20',   pct:25   },
]

export default function Billing() {
  const [view, setView] = useState('plan')

  return (
    <div style={{ flex:1, overflow:'auto', padding:'20px', background:C.bg }}>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:18, fontWeight:800, letterSpacing:-.5 }}>💳 Billing</div>
        <div style={{ fontSize:12, color:C.text3, marginTop:2 }}>Plan, usage, and invoices</div>
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {['plan','usage','invoices','upgrade'].map(v => (
          <button key={v} onClick={() => setView(v)} style={{ padding:'6px 14px', borderRadius:8, border:`0.5px solid ${view===v?C.purple:C.border}`, background:view===v?'rgba(124,109,250,0.12)':'transparent', color:view===v?C.purple2:C.text3, fontSize:12, cursor:'pointer', textTransform:'capitalize' }}>{v}</button>
        ))}
      </div>

      {view==='plan' && (
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14 }}>
          <Card style={{ border:`0.5px solid rgba(124,109,250,0.4)`, background:'rgba(124,109,250,0.04)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
              <div>
                <div style={{ fontSize:11, color:C.purple2, fontWeight:600, letterSpacing:.5, marginBottom:4 }}>CURRENT PLAN</div>
                <div style={{ fontSize:22, fontWeight:800 }}>Team Plan</div>
                <div style={{ fontSize:28, fontWeight:800, color:C.purple2, marginTop:4 }}>$1,999<span style={{ fontSize:14, color:C.text3 }}>/month</span></div>
              </div>
              <Badge type="success">Active</Badge>
            </div>
            <div style={{ marginBottom:16 }}>
              {['All 5 AI Employees (Aria, Marcus, Lexi, Felix, Nova)','Unlimited AI Actions','Full Command Center access','Company Brain (unlimited chunks)','Agent Marketplace access','Custom agent creation','10 team seats','Priority support + dedicated CSM'].map(f => (
                <div key={f} style={{ display:'flex', gap:8, fontSize:13, color:C.text2, marginBottom:7 }}>
                  <span style={{ color:C.teal }}>✓</span>{f}
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <div style={{ background:C.bg3, borderRadius:8, padding:'10px 14px' }}>
                <div style={{ fontSize:10, color:C.text3, marginBottom:2 }}>NEXT BILLING</div>
                <div style={{ fontSize:13, fontWeight:600 }}>Jul 1, 2026</div>
              </div>
              <div style={{ background:C.bg3, borderRadius:8, padding:'10px 14px' }}>
                <div style={{ fontSize:10, color:C.text3, marginBottom:2 }}>NEXT AMOUNT</div>
                <div style={{ fontSize:13, fontWeight:600, color:C.gold }}>$1,999</div>
              </div>
              <div style={{ background:C.bg3, borderRadius:8, padding:'10px 14px' }}>
                <div style={{ fontSize:10, color:C.text3, marginBottom:2 }}>BILLED</div>
                <div style={{ fontSize:13, fontWeight:600 }}>Monthly</div>
              </div>
            </div>
          </Card>
          <div>
            <Card style={{ marginBottom:10 }}>
              <div style={{ fontSize:12, fontWeight:600, marginBottom:10 }}>Payment Method</div>
              <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:10 }}>
                <div style={{ width:40, height:26, background:'rgba(255,255,255,0.1)', borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:C.text3 }}>VISA</div>
                <div>
                  <div style={{ fontSize:13 }}>•••• •••• •••• 4242</div>
                  <div style={{ fontSize:10, color:C.text3 }}>Expires 12/2028</div>
                </div>
              </div>
              <Btn variant="ghost" style={{ width:'100%', fontSize:11 }}>Update Card</Btn>
            </Card>
            <Card>
              <div style={{ fontSize:12, fontWeight:600, marginBottom:10 }}>Quick Actions</div>
              {[{l:'Download W9',a:'Download'},{l:'Save 20% — switch to annual',a:'Switch'},{l:'Change plan',a:'View Plans'},{l:'Cancel subscription',a:'Cancel'}].map(q => (
                <div key={q.l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:`0.5px solid ${C.border}` }}>
                  <span style={{ fontSize:12, color:C.text2 }}>{q.l}</span>
                  <button style={{ fontSize:11, color:C.purple2, background:'none', border:'none', cursor:'pointer' }}>{q.a} →</button>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {view==='usage' && (
        <div>
          <Card style={{ marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:14 }}>Usage This Month (Jun 2026)</div>
            {USAGE.map(u => (
              <div key={u.label} style={{ marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:13 }}>{u.label}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:C.teal }}>{u.val.toLocaleString()} {u.unit}</span>
                </div>
                {u.pct !== null && (
                  <div>
                    <div style={{ height:6, background:'rgba(255,255,255,0.07)', borderRadius:6 }}>
                      <div style={{ height:'100%', width:`${u.pct}%`, background:u.pct>80?C.coral:u.pct>60?C.gold:C.teal, borderRadius:6 }}/>
                    </div>
                    <div style={{ fontSize:10, color:C.text3, marginTop:2 }}>{u.pct}% of limit</div>
                  </div>
                )}
              </div>
            ))}
          </Card>
        </div>
      )}

      {view==='invoices' && (
        <Card>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:14 }}>Invoice History</div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>{['Invoice','Date','Plan','Amount','Status',''].map(h => <th key={h} style={{ textAlign:'left', fontSize:10, color:C.text3, padding:'6px 10px', borderBottom:`0.5px solid ${C.border}`, letterSpacing:.5 }}>{h}</th>)}</tr></thead>
            <tbody>
              {INVOICES.map(inv => (
                <tr key={inv.id} style={{ borderBottom:`0.5px solid ${C.border}` }}>
                  <td style={{ padding:'12px 10px', fontSize:13, fontWeight:600, color:C.purple2 }}>{inv.id}</td>
                  <td style={{ padding:'12px 10px', fontSize:12, color:C.text2 }}>{inv.date}</td>
                  <td style={{ padding:'12px 10px', fontSize:12, color:C.text2 }}>{inv.plan}</td>
                  <td style={{ padding:'12px 10px', fontSize:13, fontWeight:700, color:C.gold }}>${inv.amount.toLocaleString()}</td>
                  <td style={{ padding:'12px 10px' }}><Badge type="success">{inv.status}</Badge></td>
                  <td style={{ padding:'12px 10px' }}><button style={{ fontSize:11, color:C.text3, background:'none', border:'none', cursor:'pointer' }}>↓ PDF</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {view==='upgrade' && (
        <div>
          <div style={{ background:'rgba(250,204,75,0.06)', border:`0.5px solid rgba(250,204,75,0.25)`, borderRadius:12, padding:'14px 16px', marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:600, color:C.gold, marginBottom:4 }}>💡 Save 20% — Switch to Annual Billing</div>
            <div style={{ fontSize:12, color:C.text2 }}>Pay annually and save $4,797/year on your Team plan. That's a free 2.4 months.</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
            {[
              { name:'Starter', monthly:299, annual:2869, agents:'1 AI Employee (Aria)', features:['Sales Hub','5K AI Actions/mo','Email support'], color:C.text2 },
              { name:'Growth',  monthly:799, annual:7670, agents:'3 AI Employees',        features:['Aria + Marcus + Lexi','Unlimited AI Actions','Company Brain','All integrations'], color:C.purple2 },
              { name:'Team',    monthly:1999,annual:19190,agents:'All 5 AI Employees',    features:['Full AI Workforce','Command Center','Agent Marketplace','Custom agents','Dedicated CSM'], color:C.gold, current:true },
            ].map(plan => (
              <Card key={plan.name} style={{ border:`0.5px solid ${plan.current?'rgba(250,204,75,0.5)':C.border}`, position:'relative' }}>
                {plan.current && <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:C.gold, color:'#000', fontSize:10, fontWeight:700, padding:'3px 12px', borderRadius:20, whiteSpace:'nowrap' }}>Current Plan</div>}
                <div style={{ fontSize:15, fontWeight:700, marginBottom:8 }}>{plan.name}</div>
                <div style={{ fontSize:26, fontWeight:800, marginBottom:2 }}>${plan.monthly}<span style={{ fontSize:14, color:C.text3 }}>/mo</span></div>
                <div style={{ fontSize:11, color:C.teal, marginBottom:12 }}>Annual: ${plan.annual.toLocaleString()}/yr (save 20%)</div>
                <div style={{ fontSize:12, color:plan.color, marginBottom:12 }}>{plan.agents}</div>
                {plan.features.map(f => <div key={f} style={{ display:'flex', gap:6, fontSize:12, color:C.text2, marginBottom:6 }}><span style={{ color:C.teal }}>✓</span>{f}</div>)}
                <Btn style={{ width:'100%', marginTop:12, background:plan.current?'rgba(255,255,255,0.05)':C.purple, fontSize:13 }} variant={plan.current?'ghost':'primary'}>
                  {plan.current ? 'Current Plan' : `Switch to ${plan.name} →`}
                </Btn>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
