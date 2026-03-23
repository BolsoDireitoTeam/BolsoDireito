import AuthForm from "./AuthForm";
import { Link } from "react-router-dom";

function Login() {
  return (
    <div>
    <AuthForm
      title="Login"
      buttonText="Entrar"
      fields={[
        { name: "email", type: "email", placeholder: "Email" },
        { name: "senha", type: "password", placeholder: "Senha" }
      ]}
      onSubmit={(data) => console.log("login", data)}
      
    />
    <p>
  Não tem conta? <Link to="/register">Registre-se</Link>
</p>
</div>

  );
}

export default Login;