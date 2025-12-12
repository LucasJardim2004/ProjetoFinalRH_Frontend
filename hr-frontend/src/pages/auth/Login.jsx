import { useState } from "react";
import "./auth.css";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    // Por agora não faz nada. Mais tarde ligas à API .NET.
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>HR System</h1>
          <p>Área reservada a funcionários e RH</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="identifier">Email ou username</label>
            <input
              id="identifier"
              type="text"
              placeholder="ex: joao.silva@empresa.pt"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Palavra-passe</label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Esconder" : "Mostrar"}
              </button>
            </div>
          </div>

          <button type="submit" className="login-button">
            Entrar
          </button>
        </form>

        <div className="login-footer">
          <span>© {new Date().getFullYear()} Recursos Humanos</span>
        </div>
      </div>
    </div>
  );
}

export default Login;