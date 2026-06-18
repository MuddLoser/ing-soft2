import Icon from "../shared/icons/Icon";

function Topbar() {
  return (
    <header className="topbar">
      <h1>Portal de Convivencia</h1>

      <div className="search">
      </div>

      <div className="topbar-right">
        <button className="icon-btn">
          <Icon name="bell" size={18} />
          <span className="badge-dot"></span>
        </button>

        <button className="icon-btn">
          <Icon name="help" size={18} />
        </button>

        <div className="avatar">CM</div>
      </div>
    </header>
  );
}

export default Topbar;