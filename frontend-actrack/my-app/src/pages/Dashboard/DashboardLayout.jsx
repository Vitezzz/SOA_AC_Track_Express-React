import { NavLink, Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="flex gap-4 p-6">
      <ul className="menu bg-white rounded-xl border border-gray-200 w-56 gap-1 shadow-sm">
        <li>
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              isActive ? "btn btn-soft bg-gray-100 text-gray-900" : "btn btn-ghost text-gray-500"
            }
          >
            Dashboard Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard/details"
            className={({ isActive }) =>
              isActive ? "btn btn-soft bg-gray-100 text-gray-900" : "btn btn-ghost text-gray-500"
            }
          >
            Dashboard Details
          </NavLink>
        </li>
      </ul>
      <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
