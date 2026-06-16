import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Machine } from '../types';
import { Card } from '../components/Card';

export function Maquinaria(){
 const [items,setItems]=useState<Machine[]>([]);
 const [form,setForm]=useState<Machine>({code:'',name:'',status:'operativa'});
 async function load(){ const {data}=await supabase.from('machines').select('*').order('created_at',{ascending:false}); setItems(data||[]); }
 useEffect(()=>{load()},[]);
 async function save(){ if(!form.code||!form.name) return alert('Falta código y nombre'); await supabase.from('machines').upsert(form,{onConflict:'code'}); setForm({code:'',name:'',status:'operativa'}); load(); }
 return <div><h2 className="text-3xl font-bold mb-6">Maquinaria</h2><Card><div className="grid md:grid-cols-4 gap-3 mb-4"><input className="border p-3 rounded" placeholder="Código" value={form.code} onChange={e=>setForm({...form,code:e.target.value})}/><input className="border p-3 rounded" placeholder="Nombre" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input className="border p-3 rounded" placeholder="Marca" value={form.brand||''} onChange={e=>setForm({...form,brand:e.target.value})}/><button onClick={save} className="bg-blue-600 text-white rounded px-4">Guardar</button></div><table className="w-full text-left"><thead><tr className="border-b"><th>Código</th><th>Nombre</th><th>Marca</th><th>Estado</th></tr></thead><tbody>{items.map(m=><tr className="border-b" key={m.id}><td>{m.code}</td><td>{m.name}</td><td>{m.brand}</td><td>{m.status}</td></tr>)}</tbody></table></Card></div>
}
