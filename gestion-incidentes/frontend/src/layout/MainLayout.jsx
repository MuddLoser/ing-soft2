import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function MainLayout({ children, vistaActual, cambiarVista, onLogout }) {
  return (
    <div className="app">
      <Sidebar vistaActual={vistaActual} cambiarVista={cambiarVista} onLogout={onLogout} />

      <div className="main">
        <Topbar />
        {children}
      </div>
    </div>
  );
}

export default MainLayout;