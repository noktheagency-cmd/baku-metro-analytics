import React,{useState,useEffect,useRef,useId} from 'react';
const fmt=n=>new Intl.NumberFormat('az-AZ',{maximumFractionDigits:1}).format(n);
const series=[['passengers','Sərnişinlər','#8ef0c1'],['stations','Stansiyalar','#8dc9ff'],['length','Xətt uzunluğu','#ffc77d'],['wagons','Vaqonlar','#d4a6ff']];
export function useTween(target,duration=850){
 const [value,setValue]=useState(target),current=useRef(target);
 const signature=JSON.stringify(target);
 useEffect(()=>{const to=JSON.parse(signature);if(matchMedia('(prefers-reduced-motion: reduce)').matches){current.current=to;setValue(to);return}const from=current.current;let frame;const start=performance.now();function step(now){const t=Math.min((now-start)/duration,1),ease=1-Math.pow(1-t,3);const next=to.map((v,i)=>(from[Math.min(i,from.length-1)]??v)+(v-(from[Math.min(i,from.length-1)]??v))*ease);current.current=next;setValue(next);if(t<1)frame=requestAnimationFrame(step)}frame=requestAnimationFrame(step);return()=>cancelAnimationFrame(frame)},[signature,duration]);
 return value.length===target.length?value:target;
}
export default function AnimatedTrend({rows,metric,onCompare}){
 const [compare,setCompare]=useState(false),[area,setArea]=useState(true),[hover,setHover]=useState(null),[mobile,setMobile]=useState(()=>innerWidth<760);const id=useId().replace(/:/g,'');
 useEffect(()=>{const mq=matchMedia('(max-width:760px)');const update=()=>setMobile(mq.matches);mq.addEventListener('change',update);return()=>mq.removeEventListener('change',update)},[]);
 useEffect(()=>{onCompare?.(compare)},[compare,onCompare]);
 useEffect(()=>setHover(null),[rows[0].year,rows.at(-1).year,metric.key,compare]);
 const w=mobile?360:1000,h=compare?(mobile?400:440):(mobile?300:310),l=48,r=24,t=20,b=40;
 const values=series.map(([key])=>rows.map(row=>compare?row[key]/rows[0][key]*100:row[key]));
 const selected=series.findIndex(([key])=>key===metric.key),chosen=compare?[0,1,2,3]:[selected];
 const visibleValues=chosen.flatMap(i=>values[i]);
 const low=Math.min(...visibleValues),high=Math.max(...visibleValues);
 const padding=Math.max((high-low)*.08,2);
 const floor=compare?Math.max(0,Math.floor((low-padding)/5)*5):0;
 const ceiling=compare?Math.ceil((high+padding)/5)*5:(Math.ceil(high/20)*20||20);
 const target=series.flatMap((_,s)=>values[compare?s:selected].map(v=>h-b-(v-floor)/(ceiling-floor)*(h-b-t)));
 const tween=useTween(target);const axis=useTween([floor,ceiling]);const x=i=>l+i*(w-l-r)/(rows.length-1);
 const y=(s,i)=>tween[s*rows.length+i];const path=s=>rows.map((_,i)=>`${i?'L':'M'}${x(i)},${y(s,i)}`).join(' ');
 const pick=e=>{const rect=e.currentTarget.getBoundingClientRect();setHover(Math.max(0,Math.min(rows.length-1,Math.round(((e.clientX-rect.left)/rect.width*w-l)/(w-l-r)*(rows.length-1)))))};
 const active=hover===null?null:rows[hover];
 return <div className={`animated-trend ${compare?'is-comparing':''}`}><div className="trend-options"><span>{compare?`${rows[0].year} = 100 · indeks`:metric.unit}</span><div><button aria-pressed={area} onClick={()=>setArea(v=>!v)}>{area?'Sahə görünüşü':'Xətt görünüşü'}</button><button aria-pressed={compare} onClick={()=>{setCompare(v=>!v);onCompare?.(!compare)}}>Birlikdə müqayisə</button></div></div><div className="trend-legend">{chosen.map(s=><span key={s}><i style={{background:series[s][2]}}/>{series[s][1]}</span>)}</div>
 <div className="trend-canvas"><svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={compare?'Göstəricilərin indeks müqayisəsi':`${metric.label}, illər üzrə`} onPointerMove={pick} onPointerLeave={()=>setHover(null)}>
 <defs>{series.map((s,i)=><linearGradient key={s[0]} id={`${id}-${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={s[2]} stopOpacity={compare?.12:.3}/><stop offset="100%" stopColor={s[2]} stopOpacity="0"/></linearGradient>)}</defs>
 {Array.from({length:compare?9:5},(_,n)=>n).map(n=><g key={n}><line x1={l} x2={w-r} y1={h-b-n*(h-b-t)/(compare?8:4)} y2={h-b-n*(h-b-t)/(compare?8:4)} stroke="#ffffff15"/><text x={l-12} y={h-b-n*(h-b-t)/(compare?8:4)+4} textAnchor="end">{fmt(axis[0]+(axis[1]-axis[0])*n/(compare?8:4))}</text></g>)}
 {chosen.map(s=><g key={s}>{area&&<path d={path(s)+` L${x(rows.length-1)},${h-b} L${l},${h-b} Z`} fill={`url(#${id}-${s})`}/>}<path d={path(s)} fill="none" stroke={series[s][2]} strokeWidth={compare?2.5:3} strokeLinejoin="round" strokeLinecap="round"/>{rows.map((row,i)=><circle key={row.year} cx={x(i)} cy={y(s,i)} r={hover===i?5:rows.length>20?0:2.5} fill={series[s][2]} stroke="#093e30" strokeWidth="2"/>)}</g>)}
 {hover!==null&&<line x1={x(hover)} x2={x(hover)} y1={t} y2={h-b} stroke="#d3fbe180" strokeDasharray="4 5"/>}
 {rows.map((row,i)=><g key={row.year}>{(i===0||i===rows.length-1||(i%Math.ceil(rows.length/(mobile?4:10))===0&&i<rows.length-2))&&<text x={x(i)} y={h-12} textAnchor="middle">{row.year}</text>}<rect x={x(i)-Math.min(15,(w-l-r)/rows.length/2)} y={t} width={Math.min(30,(w-l-r)/rows.length)} height={h-b-t} fill="transparent" tabIndex="0" role="button" aria-label={`${row.year}, ${fmt(row[metric.key])} ${metric.unit}`} onFocus={()=>setHover(i)} onBlur={()=>setHover(null)} onClick={()=>setHover(i)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setHover(i)}}}/></g>)}
 </svg>{active&&<div className="trend-tooltip" style={{left:mobile?'12px':`${Math.min(75,Math.max(4,x(hover)/w*100-8))}%`}}><strong>{active.year}</strong>{chosen.map(s=><div key={s}><i style={{background:series[s][2]}}/><span>{series[s][1]}</span><b>{fmt(values[s][hover])}{compare?'':s===0?' mln':s===2?' km':''}</b></div>)}</div>}</div>
 {compare&&<p className="trend-explanation">Hər göstərici seçilən başlanğıc ildə 100-ə bərabərləşdirilib. Xətlər mütləq sayları deyil, nisbi dəyişməni müqayisə edir. Fərqləri aydın göstərmək üçün şkala seçilmiş dövrə uyğunlaşır və sıfırdan başlamaya bilər.</p>}
 </div>
}

export function PresentationCurve({data,index}){
 const [position]=useTween([index],1000),i=Math.min(data.length-1,Math.max(0,position)),whole=Math.floor(i),fraction=i-whole;
 const px=n=>10+n*10.8,py=v=>120-v/2.7;
 const value=data[whole].passengers+(data[Math.min(whole+1,35)].passengers-data[whole].passengers)*fraction;
 const x=px(i),y=py(value),points=data.slice(0,whole+1).map((d,n)=>`${n?'L':'M'}${px(n)},${py(d.passengers)}`).join(' ')+` L${x},${y}`;
 const id=useId().replace(/:/g,'');return <svg className="presentation-curve" viewBox="0 0 400 150" role="img" aria-label={`${data[index].year}: ${data[index].passengers} milyon gediş`}><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#9cf0ca" stopOpacity=".25"/><stop offset="1" stopColor="#9cf0ca" stopOpacity="0"/></linearGradient></defs>{[50,100,150,200].map(v=><line key={v} x1="10" x2="390" y1={py(v)} y2={py(v)} stroke="#ffffff14"/>)}<path d={data.map((d,n)=>`${n?'L':'M'}${px(n)},${py(d.passengers)}`).join(' ')} fill="none" stroke="#ffffff30" strokeWidth="1.5"/><path d={`${points} L${x},125 L10,125 Z`} fill={`url(#${id})`}/><path d={points} fill="none" stroke="#a7f4d0" strokeWidth="3" strokeLinejoin="round"/><line x1={x} x2={x} y1={y} y2="125" stroke="#bcf8d850" strokeDasharray="3 4"/><circle cx={x} cy={y} r="10" fill="#b8f8d61f"/><circle cx={x} cy={y} r="4" fill="#c5ffe1"/><text x={Math.min(354,Math.max(30,x))} y={y-15} textAnchor="middle" fill="#e4fff1" fontSize="12">{fmt(value)}</text><text x="10" y="145" fill="#c8dcd4" fontSize="10">1990</text><text x="390" y="145" textAnchor="end" fill="#c8dcd4" fontSize="10">2025</text></svg>
}
