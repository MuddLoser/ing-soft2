import Icon from "../shared/icons/Icon";

function Sidebar({ vistaActual, cambiarVista }) {
  const items = [
    { id: "dash", label: "Panel de Control", icon: "grid" },
    { id: "incident", label: "Registro de Incidentes", icon: "triangle" },
    { id: "reinc", label: "Reincidencias", icon: "link" },
    { id: "dir", label: "Directorio Estudiantil", icon: "users" },
    //{ id: "rep", label: "Reportes Académicos", icon: "chart" },
    //{ id: "cfg", label: "Configuración", icon: "gear" },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">
          <Icon name="grad" size={20} />
        </div>

        <div className="brand-text">
          <div className="name">
            Gestión
            <br />
            Escolar
          </div>
        </div>
      </div>

      <nav className="nav">
        {items.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${vistaActual === item.id ? "active" : ""}`}
            onClick={() => cambiarVista(item.id)}
            style={{ cursor: "pointer" }}
          >
            <span className="ico">
              <Icon name={item.icon} size={18} />
            </span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button 
          className="btn-primary" 
          onClick={() => cambiarVista("incident")}
          style={{ cursor: "pointer" }}
        >
          <Icon name="plus" size={16} stroke={2.5} />
          Registrar Incidente
        </button>

        <div className="logout">
          <Icon name="logout" size={18} />
          <span>Cerrar Sesión</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;