import { ReactNode } from 'react';

const items = [
  ['dashboard','Dashboard'], ['maquinaria','Maquinaria'], ['repuestos','Repuestos'], ['auditorias','Auditorías'], ['importar','Importar Excel']
];

export function Layout({ page, setPage, children }: { page: string; setPage: (p:string)=>void; children: ReactNode }) {
  return <div className="min-h-screen bg-slate-100 flex">
    <aside className="w-72 bg-slate-950 text-white p-5">
      <h1 className="text-2xl font-bold">HydroAudit</h1>
      <p className="text-sm text-slate-400 mb-8">Inventario y auditoría hidráulica</p>
      <nav className="space-y-2">
        {items.map(([key,label]) => <button key={key} onClick={()=>setPage(key)} className={`w-full text-left px-4 py-3 rounded-xl ${page===key?'bg-blue-600':'hover:bg-slate-800'}`}>{label}</button>)}
      </nav>
    </aside>
    <main className="flex-1 p-8">{children}</main>
  </div>;
}
