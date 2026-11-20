import React,{useEffect,useState} from 'react';
import {scenes} from './scenes';

export default function SidebarSlideshow(){
 const [active,setActive]=useState(0);
 useEffect(()=>{
  const timer=setInterval(()=>{if(!document.hidden)setActive(i=>(i+1)%scenes.length)},3000);
  return()=>clearInterval(timer);
 },[]);
 useEffect(()=>{
  const next=new Image();
  next.src=`/images/${scenes[(active+1)%scenes.length].image}.png`;
 },[active]);
 return <div className="sidebar-slides" aria-hidden="true">{scenes.map((scene,i)=><img key={scene.image} className={i===active?'slide-active':''} src={`/images/${scene.image}.png`} alt=""/>)}</div>;
}
