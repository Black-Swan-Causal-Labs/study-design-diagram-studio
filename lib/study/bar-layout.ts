import type {Element} from './model';
// Conservative cross-format text budget: reserve space rather than shrink labels.
export function wrapLabel(text:string,limit=27):string[]{
 const words=text.trim().split(/\s+/);const rows:string[]=[];let row='';
 for(let word of words){if(row&&row.length+1+word.length>limit){rows.push(row);row='';}while(word.length>limit){if(row){rows.push(row);row='';}rows.push(word.slice(0,limit));word=word.slice(limit);}if(word)row+=(row?' ':'')+word;}
 if(row)rows.push(row);return rows;
}
export function barLabel(e:Element,_width:number){const known=e.start!==null&&e.end!==null;const dates=e.category==='follow-up'&&e.endpointLabel.trim()?`Day ${e.start??'?'} to ${e.endpointLabel}${e.end!==null?` (maximum day ${e.end})`:''}`:known?`Days ${e.start} to ${e.end}${e.category==='follow-up'?' · maximum':''}`:'Timing not specified';return {inside:false,lines:wrapLabel(e.label),dates,dateLines:wrapLabel(dates,32)};}
// Clip diagonal strokes mathematically so PDF and editable PPTX match SVG.
export function hatchSegments(x:number,y:number,w:number,h:number){const out:{x:number;y:number;x2:number;y2:number}[]=[];for(let d=-h;d<w;d+=9){const lo=Math.max(0,-d),hi=Math.min(h,w-d);if(hi>lo)out.push({x:x+d+lo,y:y+lo,x2:x+d+hi,y2:y+hi});}return out;}
