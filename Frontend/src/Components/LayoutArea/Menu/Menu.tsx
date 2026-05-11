import { NavLink } from "react-router-dom";
import "./Menu.css";

export function Menu() {
    return (
        <nav className="Menu">
            <NavLink
                to="/chat"
                className={({ isActive }) => "Menu-link" + (isActive ? " is-active" : "")}
            >
                Chat
            </NavLink>
            <NavLink
                to="/about"
                className={({ isActive }) => "Menu-link" + (isActive ? " is-active" : "")}
            >
                About
            </NavLink>
        </nav>
    );
}
