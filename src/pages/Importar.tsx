import { useState } from 'react';
import { readExcelFile, normalizeMachineRow } from '../lib/excel';
import { supabase } from '../lib/supabase';
import { Card } from '../components/Card';
export function Importar(){
 const [rows,setRows]=useState<any[]>([]); const [type,setType]=useState<'machines'|'spare_parts'>('machines');
 async function onFile(file:File){ const raw=await readExcelFile(file); const mapped= type==='machines' ? raw.map((r:any)=>normalizeMachineRow(r)) : raw; setRows(mapped); }
 async function importRows(){ const valid=rows.filter(r=>r.code && r.name); if(!valid.length) return alert('No hay filas válidas'); const {error}=await supabase.from(type).upsert(valid,{onConflict:'code'}); if(error) return alert(error.message); await supabase.from('import_logs').insert({import_type:type,total_rows:rows.length,success_rows:valid.length,error_rows:rows.length-valid.length}); alert('Importación lista'); }
 return <div><h2 className="text-3xl font-bold mb-6">Importar Excel</h2><Card><div className="flex gap-3 mb-4"><select className="border p-3 rounded" value={type} onChange={e=>setType(e.target.value as any)}><option value="machines">Maquinaria</option><option value="spare_parts">Repuestos</option></select><input type="file" accept=".xlsx,.xls,.csv" onChange={e=>e.target.files?.[0]&&onFile(e.target.files[0])}/><button onClick={importRows} className="bg-green-600 text-white rounded px-4">Importar a Supabase</button></div><p className="mb-3 text-slate-500">Filas detectadas: {rows.length}</p><pre className="bg-slate-950 text-green-300 p-4 rounded-xl overflow-auto max-h-96">{JSON.stringify(rows.slice(0,10),null,2)}</pre></Card></div>
}
