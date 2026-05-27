import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function MainLayout({ children }) {
  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar />
        {children}
      </div>
    </div>
  );
}

export default MainLayout;