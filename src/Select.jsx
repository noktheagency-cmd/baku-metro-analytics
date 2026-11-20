import React,{Children,useEffect,useId,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Check,ChevronDown} from 'lucide-react';
import './select.css';

export default function Select({value,onChange,children,'aria-label':label}){
 const options=Children.toArray(children).map(c=>({value:String(c.props.value??c.props.children),label:c.props.children,disabled:c.props.disabled}));
 const selected=options.findIndex(o=>o.value===String(value));
 const [open,setOpen]=useState(false),[active,setActive]=useState(0),[position,setPosition]=useState({});
 const trigger=useRef(null),popup=useRef(null),id=useId();
 function show(){const r=trigger.current.getBoundingClientRect();const below=innerHeight-r.bottom;setPosition({left:Math.min(r.left,innerWidth-Math.max(r.width,180)-12),width:Math.max(r.width,180),maxHeight:Math.min(280,Math.max(below,r.top)-24),...(below>=280||below>=r.top?{top:r.bottom+8}:{bottom:innerHeight-r.top+8})});setActive(Math.max(0,selected));setOpen(true)}
 function choose(i){if(options[i]?.disabled)return;onChange?.({target:{value:options[i].value}});setOpen(false);trigger.current.focus()}
 useEffect(()=>{if(!open)return;popup.current?.focus();const dismiss=e=>{if(!popup.current?.contains(e.target)&&!trigger.current?.contains(e.target))setOpen(false)};const close=()=>setOpen(false);document.addEventListener('pointerdown',dismiss);window.addEventListener('resize',close);return()=>{document.removeEventListener('pointerdown',dismiss);window.removeEventListener('resize',close)}},[open]);
 useEffect(()=>{if(open)document.getElementById(`${id}-${active}`)?.scrollIntoView({block:'nearest'})},[active,open,id]);
 function keyboard(e){if(e.key==='Escape'){e.preventDefault();setOpen(false);trigger.current.focus()}else if(e.key==='Tab'){setOpen(false)}else if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(active)}else if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();setActive(i=>e.key==='Home'?0:e.key==='End'?options.length-1:Math.max(0,Math.min(options.length-1,i+(e.key==='ArrowDown'?1:-1))))}else if(/^\d$/.test(e.key)){const found=options.findIndex(o=>o.value.startsWith(e.key));if(found>=0)setActive(found)}}
 return <span className="styled-select"><button type="button" ref={trigger} className="select-trigger" aria-label={label} aria-haspopup="listbox" aria-expanded={open} aria-controls={open?id:undefined} onClick={()=>open?setOpen(false):show()} onKeyDown={e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();show()}}}>{options[selected]?.label}<ChevronDown size={16} className={open?'rotated':''}/></button>{open&&createPortal(<div ref={popup} id={id} className="select-popup" role="listbox" aria-label={label??'Seçim'} tabIndex={-1} aria-activedescendant={`${id}-${active}`} style={position} onKeyDown={keyboard}>{options.map((o,i)=><div key={o.value} id={`${id}-${i}`} role="option" aria-selected={i===selected} aria-disabled={o.disabled||undefined} className={`select-option ${i===active?'focused':''} ${i===selected?'chosen':''}`} onPointerMove={()=>setActive(i)} onClick={()=>choose(i)}><span>{o.label}</span>{i===selected&&<Check size={16}/>}</div>)}</div>,document.body)}</span>
}
