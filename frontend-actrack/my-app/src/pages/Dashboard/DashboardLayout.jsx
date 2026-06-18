import { NavLink, Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="flex gap-4">
      <ul className="menu bg-base-200 rounded-box w-56 gap-1">
        <li>
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              isActive ? "btn btn-soft btn-primary" : "btn btn-ghost"
            }
          >
            Dashboard Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard/details"
            className={({ isActive }) =>
              isActive ? "btn btn-soft btn-primary" : "btn btn-ghost"
            }
          >
            Dashboard Details
          </NavLink>
        </li>
      </ul>
      <div className="flex-1 bg-base-200 rounded-box p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
