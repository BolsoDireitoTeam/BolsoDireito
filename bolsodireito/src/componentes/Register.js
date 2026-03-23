import AuthForm from "./AuthForm";
import { Link } from "react-router-dom";

function Register() {
  return (
    <div>
    <AuthForm
      title="Registrar"
      buttonText="Criar conta"
      fields={[
        { name: "nome", type: "text", placeholder: "Nome" },
        { name: "email", type: "email", placeholder: "Email" },
        { name: "senha", type: "password", placeholder: "Senha" }
      ]}
      onSubmit={(data) => console.log("register", data)}
    />
    <p>
      Já tem conta? <Link to="/">Login</Link>
    </p>
</div>
  );
}

export default Register;