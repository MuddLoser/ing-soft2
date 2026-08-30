import { useState } from "react";
import Icon from "../../../shared/icons/Icon"; // Ajusta la ruta a tu ícono

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const usuariosSimulados = {
    "rsalazar2504": {
      pass: "1234",
      rol: "profesor",
      nombre: "Rodrigo Salazar - Profesor",
    },
    "psoto3467": {
      pass: "admin123",
      rol: "inspector",
      nombre: "Paula Soto - Encargada de Convivencia",
    },
  };

  const handleIngresar = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const usuarioEncontrado = usuariosSimulados[username];

    setTimeout(() => {
      const usuarioEncontrado = usuariosSimulados[username];

      if (usuarioEncontrado && usuarioEncontrado.pass === password) {
        onLogin(usuarioEncontrado.rol, usuarioEncontrado.nombre);
      } else {
        setError("Usuario o contraseña incorrectos.");
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "var(--bg-2)" }}>
      <div className="card" style={{ width: "400px", padding: "32px", textAlign: "center" }}>
        <div style={{ background: "var(--teal-100)", width: "64px", height: "64px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "var(--teal-700)" }}>
          <Icon name="users" size={32} />
        </div>
        
        <h2 style={{ marginBottom: "8px" }}>Gestión Escolar</h2>
        <p style={{ color: "var(--ink-500)", marginBottom: "24px" }}>Ingrese sus credenciales para continuar</p>

        {error && (
          <div style={{ background: "#fdf1ee", color: "#8a2a14", padding: "12px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleIngresar} style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
          <div className="field">
            <label>Nombre de Usuario</label>
            <input 
              type="text" 
              placeholder="Ingrese su usuario" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading} // Bloquea el botón
            style={{ 
              width: "100%", 
              marginTop: "8px", 
              padding: "12px", 
              fontSize: "16px", 
              cursor: loading ? "wait" : "pointer", // Cambia el cursor
              opacity: loading ? 0.7 : 1 // Lo hace un poco transparente
            }}
          >
            {loading ? "Verificando..." : "Iniciar Sesión"}
          </button>
        </form>

      </div>
    </div>
  );
}

export default Login;