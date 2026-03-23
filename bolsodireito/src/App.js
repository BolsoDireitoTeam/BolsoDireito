import logo from './logo.svg';
import './App.css';
import Login from "./componentes/Login";
import Register from "./componentes/Register";
import Exemplos from "./Exemplos"
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return(
  <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
    );
}

export default App;
