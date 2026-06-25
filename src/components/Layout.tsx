import { ReactNode } from 'react';

const items = [
  ['dashboard','Dashboard'], ['maquinaria','Maquinaria'], ['repuestos','Repuestos'], ['auditorias','Auditorías'], ['importar','Importar Excel']
];

export function Layout({ page, setPage, children }: { page: string; setPage: (p:string)=>void; children: ReactNode }) {
  return <div className="min-h-screen bg-slate-100 md:flex">
    <aside className="sticky top-0 z-40 bg-slate-950 p-4 text-white md:min-h-screen md:w-72 md:p-5">
      <h1 className="text-xl font-bold md:text-2xl">HydroAudit</h1>
      <p className="mb-4 text-sm text-slate-400 md:mb-8">Inventario y auditoría hidráulica</p>
      <nav className="-mx-1 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] md:mx-0 md:block md:space-y-2 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden">
        {items.map(([key,label]) => <button key={key} onClick={()=>setPage(key)} className={`shrink-0 rounded-xl px-4 py-3 text-left md:w-full ${page===key?'bg-blue-600':'hover:bg-slate-800'}`}>{label}</button>)}
      </nav>
    </aside>
    <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
  </div>;
}
