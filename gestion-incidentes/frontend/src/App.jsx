import { useState } from "react";
import MainLayout from "./layout/MainLayout";
import RegistrarIncidente from "./modules/incidentes/pages/RegistrarIncidente";
import ListarIncidentes from "./modules/incidentes/pages/ListarIncidentes";

function App() {
  const [vista, setVista] = useState("registrar");

  return (
    <MainLayout>
      {vista === "registrar" ? (
        <RegistrarIncidente onSwitch={() => setVista("listar")} />
      ) : (
        <ListarIncidentes onSwitch={() => setVista("registrar")} />
      )}
    </MainLayout>
  );
}

export default App;