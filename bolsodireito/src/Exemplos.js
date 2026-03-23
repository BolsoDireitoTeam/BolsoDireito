import { useState } from "react";

function Exemplos() {
  const [nome, setNome] = useState("");

  return (
    <>
      <input onChange={(e) => setNome(e.target.value)} />
      <p>Olá, {nome}</p>
    </>
  );
}

export default Exemplos;