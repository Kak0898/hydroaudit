import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { SparePart } from '../types';
import { Card } from '../components/Card';
export function Repuestos(){
 const [items,setItems]=useState<SparePart[]>([]); const [form,setForm]=useState<SparePart>({code:'',name:'',stock:0,min_stock:1});
 async function load(){ const {data}=await supabase.from('spare_parts').select('*').order('created_at',{ascending:false}); setItems(data||[]); }
 useEffect(()=>{load()},[]); async function save(){ if(!form.code||!form.name) return alert('Falta código y nombre'); await supabase.from('spare_parts').upsert(form,{onConflict:'code'}); setForm({code:'',name:'',stock:0,min_stock:1}); load(); }
 return <div><h2 className="text-3xl font-bold mb-6">Repuestos</h2><Card><div className="grid md:grid-cols-5 gap-3 mb-4"><input className="border p-3 rounded" placeholder="Código" value={form.code} onChange={e=>setForm({...form,code:e.target.value})}/><input className="border p-3 rounded" placeholder="Nombre" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input className="border p-3 rounded" type="number" placeholder="Stock" value={form.stock} onChange={e=>setForm({...form,stock:+e.target.value})}/><input className="border p-3 rounded" type="number" placeholder="Mínimo" value={form.min_stock} onChange={e=>setForm({...form,min_stock:+e.target.value})}/><button onClick={save} className="bg-blue-600 text-white rounded px-4">Guardar</button></div><table className="w-full text-left"><thead><tr className="border-b"><th>Código</th><th>Nombre</th><th>Stock</th><th>Alerta</th></tr></thead><tbody>{items.map(r=><tr className="border-b" key={r.id}><td>{r.code}</td><td>{r.name}</td><td>{r.stock}</td><td>{r.stock<=r.min_stock?<span className="text-red-600 font-bold">Bajo stock</span>:'OK'}</td></tr>)}</tbody></table></Card></div>
}
