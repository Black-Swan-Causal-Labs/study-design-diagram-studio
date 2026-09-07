import { z } from 'zod';
export const categories = ['washout','eligibility','exclusion','covariates','follow-up'] as const;
export const palette = {washout:'#358ad3',eligibility:'#8964c5',exclusion:'#b25734',covariates:'#5968c4','follow-up':'#087f83'};
const text = z.string().max(6000);
const day = z.number().int().min(-36500).max(36500).nullable();
export const elementSchema = z.object({id:z.string().regex(/^[a-zA-Z0-9_-]+$/).max(80),label:z.string().min(1).max(100),category:z.enum(categories),start:day,end:day,rule:text,source:text,endpointLabel:z.string().max(80).default('')}).strict();
export const detailsSchema = z.object({title:z.string().min(1).max(180),design:text,indexEvent:text,exposure:text,comparator:text,entryPeriod:text,episodeRule:text,outcome:text,endRules:text,footnotes:text.default(''),abbreviations:text.default('')}).strict();
export const specSchema = z.object({schemaVersion:z.literal(1),details:detailsSchema,elements:z.array(elementSchema).max(60)}).strict().superRefine((s,c)=>{const ids=new Set();s.elements.forEach((e,i)=>{if(ids.has(e.id))c.addIssue({code:'custom',path:['elements',i,'id'],message:'Duplicate element ID'});ids.add(e.id);if(e.start!==null&&e.end!==null&&e.start>e.end)c.addIssue({code:'custom',path:['elements',i,'end'],message:'End day must be on or after start day'});});});
export type Element = z.infer<typeof elementSchema>;
export type Spec = z.infer<typeof specSchema>;
const source='Uploaded schematic (IMG_1214.jpeg); transcribed from the figure, not checked against the manuscript.';
export const seed:Spec={schemaVersion:1,details:{footnotes:'',abbreviations:'',title:'Antibiotic initiation study',design:'Cohort design · Reference example',indexEvent:'',exposure:'',comparator:'',entryPeriod:'',episodeRule:'Keep the first new initiation episode observed within the study period for each patient.',outcome:'Clostridioides difficile',endRules:'First of: outcome; 183 days; 30 September 2015; discharged dead; disenrollment from medical or drug coverage (45-day gaps allowed).'},elements:[
{id:'washout',label:'Antibiotic washout',category:'washout',start:-183,end:-1,endpointLabel:'',rule:'No macrolide or fluoroquinolone (any formulation).',source},
{id:'coverage',label:'Medical & drug coverage',category:'eligibility',start:-183,end:0,endpointLabel:'',rule:'INCL 1: Medical and drug coverage; 45-day gaps allowed.',source},
{id:'hospital',label:'Hospital admission',category:'exclusion',start:-90,end:0,endpointLabel:'',rule:'EXCL 1: Exclude inpatient hospital admission.',source},
{id:'pneumonia',label:'Pneumonia diagnosis',category:'eligibility',start:-14,end:0,endpointLabel:'',rule:'INCL 2: Pneumonia diagnosis.',source},
{id:'age',label:'Age at entry',category:'eligibility',start:0,end:0,endpointLabel:'',rule:'INCL 3: Age between 18–65.',source},
{id:'covariates-index',label:'Index-day covariates',category:'covariates',start:0,end:0,endpointLabel:'',rule:'COV 1: Age (continuous), sex, coprescription of β lactam.',source},
{id:'covariates-history',label:'Baseline covariates',category:'covariates',start:-183,end:-1,endpointLabel:'',rule:'COV 2: Alcohol abuse; anaemia; arrhythmia; coagulopathy; complicated diabetes; congestive heart failure; dementia; fluid and electrolyte disorder; hemiplegia; HIV/AIDS; hypertension; liver disease; metastatic cancer; peripheral vascular disorder; psychosis; pulmonary circulation disorders; pulmonary disease; renal failure; tumour; weight loss; durable medical equipment; number of inpatient hospital admissions, outpatient visits, emergency department visits, unique generics; empirically selected (high-dimensional propensity score).',source},
{id:'follow-up',label:'Outcome follow-up',category:'follow-up',start:1,end:183,endpointLabel:'End of follow-up*',rule:'Days 1 to end. 183 days is the maximum; apply the study-level stopping rules.',source},
{id:'start-exclusion',label:'Start-day exclusion',category:'exclusion',start:1,end:1,endpointLabel:'',rule:'EXCL 2: Censored on the day follow-up starts.',source}
]};
export function issues(s:Spec){const result:string[]=[];for(const key of ['indexEvent','exposure','comparator','entryPeriod','outcome','endRules'] as const)if(!s.details[key].trim())result.push(`${({indexEvent:'Index event',exposure:'Exposure definition',comparator:'Comparator definition',entryPeriod:'Calendar entry period',outcome:'Outcome',endRules:'Follow-up stopping rules'})[key]} is not specified.`);if(!s.elements.length)result.push('No assessment windows have been added.');for(const e of s.elements){if(e.start===null||e.end===null)result.push(`${e.label}: timing is not fully specified.`);if(!e.rule.trim())result.push(`${e.label}: assessment rule is missing.`);if(!e.source.trim())result.push(`${e.label}: source is not recorded.`);if((e.category==='washout'||e.category==='covariates')&&e.end!==null&&e.end>0)result.push(`${e.label}: extends after day zero; review whether this is intended.`);}if(!s.elements.some(e=>e.category==='follow-up'))result.push('No follow-up window is specified.');return result;}
export function updateElement(s:Spec,id:string,patch:unknown):Spec{const p=elementSchema.omit({id:true}).partial().strict().parse(patch);if(!s.elements.some(e=>e.id===id))throw Error('Element not found');return specSchema.parse({...s,elements:s.elements.map(e=>e.id===id?{...e,...p}:e)});}
export function addElement(s:Spec,input:unknown):Spec{return specSchema.parse({...s,elements:[...s.elements,elementSchema.parse(input)]});}
export function updateDetails(s:Spec,input:unknown):Spec{return specSchema.parse({...s,details:{...s.details,...detailsSchema.partial().parse(input)}});}

export function blankSpec():Spec{return {schemaVersion:1,details:{footnotes:'',abbreviations:'',title:"Untitled study",design:"",indexEvent:"",exposure:"",comparator:"",entryPeriod:"",episodeRule:"",outcome:"",endRules:""},elements:[]};}

export function reviewChecklist(s:Spec){
 const fields={indexEvent:'Index event defined',exposure:'Exposure definition recorded',comparator:'Comparator definition recorded',entryPeriod:'Calendar entry period recorded',outcome:'Outcome defined',endRules:'Follow-up stopping rules recorded'} as const;
 const checks:{id:string;label:string;complete:boolean;missing:string[]}[]=Object.entries(fields).map(([id,label])=>({id,label,complete:Boolean(s.details[id as keyof typeof fields].trim()),missing:[] as string[]}));
 checks.push({id:'windows',label:'Assessment windows added',complete:s.elements.length>0,missing:[]});
 for(const [id,label,present] of [
  ['timing','Timing specified for every window',(e:Element)=>e.start!==null&&e.end!==null],
  ['rules','Assessment rule recorded for every window',(e:Element)=>Boolean(e.rule.trim())],
  ['sources','Source recorded for every window',(e:Element)=>Boolean(e.source.trim())],
 ] as const){const missing=s.elements.filter(e=>!present(e)).map(e=>e.label);checks.push({id,label,complete:s.elements.length>0&&!missing.length,missing});}
 checks.push({id:'follow-up',label:'Follow-up window added',complete:s.elements.some(e=>e.category==='follow-up'),missing:[]});
 return checks;
}

export const categoryLabels:Record<Element['category'],string>={washout:'Washout',eligibility:'Inclusion / eligibility',exclusion:'Exclusion assessment',covariates:'Covariate assessment','follow-up':'Follow-up'};

export function removeElement(s:Spec,id:string):Spec{
 if(!s.elements.some(e=>e.id===id))throw Error('Element not found');
 return specSchema.parse({...s,elements:s.elements.filter(e=>e.id!==id)});
}
export function reorderElements(s:Spec,ids:string[]):Spec{
 const byId=new Map(s.elements.map(e=>[e.id,e]));
 if(ids.length!==s.elements.length||new Set(ids).size!==ids.length||ids.some(id=>!byId.has(id)))throw Error('Provide every current window ID exactly once, in the desired top-to-bottom order.');
 return specSchema.parse({...s,elements:ids.map(id=>byId.get(id)!)});
}
