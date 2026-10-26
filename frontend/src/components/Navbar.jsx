
import { NavLink } from "react-router-dom";
import { CalendarDays, LayoutDashboard, PlusCircle } from "lucide-react";

export default function Navbar() {
  return (
    <header className="navbar">
      <NavLink to="/" className="brand">
        <span className="brand-icon"><CalendarDays size={23} /></span>
        <span>Event<span className="brand-accent">Hub</span>
          <small>ADMIN PANEL</small>
        </span>
      </NavLink>

      <nav className="nav-links">
        <NavLink to="/" end className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }>
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        <NavLink to="/add-event" className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }>
          <PlusCircle size={18} />
          Add Event
        </NavLink>
      </nav>
    </header>
  );
}
