import type { Spec, Element } from './model';
export type Domain={min:number;max:number};
export function timelineDomain(s:Spec):Domain{return {min:Math.min(-30,...s.elements.flatMap(e=>[e.start??0,e.end??0])),max:Math.max(30,...s.elements.flatMap(e=>[e.start??0,e.end??0]))};}
export function resizedDay(element:Element,edge:'start'|'end',initialX:number,currentX:number,domain:Domain){const original=element[edge];if(original===null)throw Error('Set a known date before dragging.');const value=Math.round(original+(currentX-initialX)/650*(domain.max-domain.min));return edge==='start'?Math.max(-36500,Math.min(value,element.end??36500)):Math.min(36500,Math.max(value,element.start??-36500));}
