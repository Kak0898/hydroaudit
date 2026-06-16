import { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Maquinaria } from './pages/Maquinaria';
import { Repuestos } from './pages/Repuestos';
import { Auditorias } from './pages/Auditorias';
import { Importar } from './pages/Importar';

export default function App(){
 const [page,setPage]=useState('dashboard');
 return <Layout page={page} setPage={setPage}>
  {page==='dashboard' && <Dashboard/>}
  {page==='maquinaria' && <Maquinaria/>}
  {page==='repuestos' && <Repuestos/>}
  {page==='auditorias' && <Auditorias/>}
  {page==='importar' && <Importar/>}
 </Layout>
}
