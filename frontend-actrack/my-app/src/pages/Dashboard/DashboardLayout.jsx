import { NavLink, Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="dashboard-shell">
      <ul className="menu dashboard-sidebar">
        <li>
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              isActive ? "side-nav-link-active" : "side-nav-link"
            }
          >
            Dashboard Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard/details"
            className={({ isActive }) =>
              isActive ? "side-nav-link-active" : "side-nav-link"
            }
          >
            Dashboard Details
          </NavLink>
        </li>
      </ul>
      <div className="dashboard-content">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
