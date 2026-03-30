import logo from './logo.svg';
import './App.css';
//paginas-componentes do react
import Login from "./componentes/Login";
import Register from "./componentes/Register";
import Dashboard from "./componentes/views/Dashboard";
import Exemplos from "./Exemplos"
import AddCategoria from "./componentes/cadastro/add_categoria";
import AddGasto from "./componentes/cadastro/add_gasto"

import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return(
  <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/addcategoria" element={<AddCategoria />} />
        <Route path="/addgasto" element={<AddCategoria />} />
        <Route path="/nova-despesa" element={<AddCategoria />} />
      </Routes>
    </BrowserRouter>
    );
}

export default App;
