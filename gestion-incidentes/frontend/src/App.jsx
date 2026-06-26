import { useState } from "react";
import Login from "./modules/incidentes/pages/Login";
import MainLayout from "./layout/MainLayout";
import RegistrarIncidente from "./modules/incidentes/pages/RegistrarIncidente";
import PanelControl from "./modules/incidentes/pages/PanelControl";
import DirectorioEstudiantil from "./modules/incidentes/pages/DirectorioEstudiantil";
import CrearReincidencia from "./modules/incidentes/pages/CrearReincidencia";

function App() {
  const [usuarioActual, setUsuarioActual] = useState(() => { return localStorage.getItem("usuario_rol") || null; });
  const [vistaActual, setVistaActual] = useState(() => {
    const rolGuardado = localStorage.getItem("usuario_rol");
    return rolGuardado === "profesor" ? "dir" : "dash";
  });

  const manejarLogin = (rol, nombre) => {
    localStorage.setItem("usuario_rol", rol);
    localStorage.setItem("usuario_nombre", nombre);
    setUsuarioActual(rol);
    setVistaActual(rol === "profesor" ? "dir" : "dash");
  };

  const manejarLogout = () => {
    localStorage.removeItem("usuario_rol");
    localStorage.removeItem("usuario_nombre");
    setUsuarioActual(null);
    setVistaActual("dash");
  };

  const renderizarPantalla = () => {
    switch (vistaActual) {
      case "dash":
        return <PanelControl />;
      case "incident":
        return <RegistrarIncidente onSwitch={() => setVistaActual(usuarioActual === "profesor" ? "dir" : "dash")} />;
      case "reinc":
        return <CrearReincidencia onSwitch={() => setVistaActual("dash")} />;
      case "dir":
        return <DirectorioEstudiantil />;
      default:
        return (
          <div className="page">
            <h2>Pantalla en construcción</h2>
          </div>
        );
    }
  };


  if (!usuarioActual) {
    return <Login onLogin={manejarLogin} />;
  }

  return (
    <MainLayout 
      vistaActual={vistaActual} 
      cambiarVista={setVistaActual}
      onLogout={manejarLogout} 
    >
      {renderizarPantalla()}
    </MainLayout>
  );
}

export default App;