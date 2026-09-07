'use client';
import {useRef,useState,type PointerEvent} from 'react';
import type {Spec,Element} from '@/lib/study/model';
import {renderSvg} from '@/lib/study/svg';
import {resizedDay,timelineDomain,type Domain} from '@/lib/study/resize';
type Drag={element:Element;edge:'start'|'end';revision:number;domain:Domain;initialX:number;value:number;pointerId:number};
export default function Timeline({spec,revision,selected,onSelect,onResize}:{spec:Spec;revision:number;selected:string;onSelect:(id:string)=>void;onResize:(id:string,edge:'start'|'end',value:number,revision:number)=>void}){
 const drag=useRef<Drag|null>(null);const [preview,setPreview]=useState<Drag|null>(null);const suppressClick=useRef(false);
 const point=(e:PointerEvent<HTMLDivElement>)=>{const svg=e.currentTarget.querySelector('svg')!;const matrix=svg.getScreenCTM();return matrix?new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse()).x:0;};
 const update=(e:PointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d||e.pointerId!==d.pointerId)return;d.value=resizedDay(d.element,d.edge,d.initialX,point(e),d.domain);setPreview({...d});};
 const cancel=()=>{drag.current=null;setPreview(null);};
 const live=preview&&preview.revision===revision?preview:null;
 const shown=live?{...spec,elements:spec.elements.map(el=>el.id===live.element.id?{...el,[live.edge]:live.value}:el)}:spec;
 return <div className="timeline-scroll" onPointerDown={e=>{const handle=(e.target as HTMLElement).closest('[data-edge]');if(!handle||e.button!==0)return;const id=handle.getAttribute('data-id')!;const edge=handle.getAttribute('data-edge') as 'start'|'end';const el=spec.elements.find(w=>w.id===id);if(!el||el.start===null||el.end===null)return;e.preventDefault();onSelect(id);suppressClick.current=true;const d:Drag={element:el,edge,revision,domain:timelineDomain(spec),initialX:point(e),value:el[edge]!,pointerId:e.pointerId};drag.current=d;setPreview(d);e.currentTarget.setPointerCapture(e.pointerId);}}
 onPointerMove={update} onPointerUp={e=>{const d=drag.current;if(!d||d.pointerId!==e.pointerId)return;update(e);cancel();if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);if(d.value!==d.element[d.edge])onResize(d.element.id,d.edge,d.value,d.revision);}}
 onPointerCancel={cancel} onLostPointerCapture={cancel}
 onClick={e=>{if(suppressClick.current){suppressClick.current=false;return;}const id=(e.target as HTMLElement).closest('[data-element]')?.getAttribute('data-element');if(id)onSelect(id);}}
 onKeyDown={e=>{if(e.key==='Escape'){cancel();return;}const handle=(e.target as HTMLElement).closest('[data-edge]');if(handle&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();const id=handle.getAttribute('data-id')!;const edge=handle.getAttribute('data-edge') as 'start'|'end';const el=spec.elements.find(w=>w.id===id)!;const step=(e.key==='ArrowLeft'?-1:1)*(e.shiftKey?7:1);const value=Math.max(-36500,Math.min(36500,edge==='start'?Math.min(el.start!+step,el.end!):Math.max(el.end!+step,el.start!)));onResize(id,edge,value,revision);requestAnimationFrame(()=>{const candidate=Array.from(document.querySelectorAll<SVGGElement>('[data-edge]')).find(h=>h.getAttribute('data-id')===id&&h.getAttribute('data-edge')===edge);candidate?.focus();});}else if(e.key==='Enter'||e.key===' '){e.preventDefault();const id=(e.target as HTMLElement).closest('[data-element]')?.getAttribute('data-element');if(id)onSelect(id);}}}
 dangerouslySetInnerHTML={{__html:renderSvg(shown,selected,false,live?.domain)}}/>;
}
