import { useState } from "react";

function AuthForm({ title, fields, onSubmit, buttonText }) {
  const [form, setForm] = useState({});

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{title}</h2>

      {fields.map((f) => (
        <input
          key={f.name}
          type={f.type}
          name={f.name}
          placeholder={f.placeholder}
          onChange={handleChange}
        />
      ))}

      <button type="submit">{buttonText}</button>
    </form>
  );
}

export default AuthForm;