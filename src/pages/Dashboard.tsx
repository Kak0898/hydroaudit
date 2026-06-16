import { Card } from '../components/Card';
export function Dashboard(){
 return <div><h2 className="text-3xl font-bold mb-6">Dashboard</h2><div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  <Card><p className="text-slate-500">Máquinas</p><b className="text-3xl">0</b></Card>
  <Card><p className="text-slate-500">Repuestos</p><b className="text-3xl">0</b></Card>
  <Card><p className="text-slate-500">Bajo stock</p><b className="text-3xl text-red-600">0</b></Card>
  <Card><p className="text-slate-500">Auditorías pendientes</p><b className="text-3xl text-amber-600">0</b></Card>
 </div></div>
}
