import { useState } from "react";
import MainLayout from "./layout/MainLayout";
import RegistrarIncidente from "./modules/incidentes/pages/RegistrarIncidente";
import PanelControl from "./modules/incidentes/pages/PanelControl";
import DirectorioEstudiantil from "./modules/incidentes/pages/DirectorioEstudiantil";

function App() {
  // Estado que controla qué pantalla estamos viendo. Inicia en "dash" (Panel de Control)
  const [vistaActual, setVistaActual] = useState("dash");

  // Función que decide qué componente renderizar
  const renderizarPantalla = () => {
    switch (vistaActual) {
      case "dash":
        return <PanelControl />;  
      case "incident":
        // Le pasamos la prop onSwitch para que cuando termine de guardar, vuelva al panel
        return <RegistrarIncidente onSwitch={() => setVistaActual("dash")} />;
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

  return (
    <MainLayout vistaActual={vistaActual} cambiarVista={setVistaActual}>
      {renderizarPantalla()}
    </MainLayout>
  );
}

export default App;