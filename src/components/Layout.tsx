import type { JSX, PropsWithChildren } from "react";
import { NavLink, Outlet } from "react-router-dom";
import "../styles/global.css";

/**
 * PUBLIC_INTERFACE
 * Layout is the shared application shell providing a persistent header and left sidebar.
 * It renders nested routes via <Outlet /> inside the main content area.
 *
 * Accessibility:
 * - Includes a "Skip to content" link for keyboard users.
 * - Uses NavLink which sets aria-current="page" for the active route, enabling styling and screen reader context.
 */
export default function Layout(_: PropsWithChildren): JSX.Element {
  return (
    <div className="app-shell">
      <header className="app-header" role="banner">
        <a href="#main-content" className="header-skip-link">
          Skip to content
        </a>
        <div className="app-title" aria-label="Application Name">
          Indian Stock Market
        </div>
        {/* Placeholder for future header actions (profile, settings, notifications) */}
      </header>

      <aside className="app-sidebar" aria-label="Primary">
        <nav className="sidebar-nav" aria-labelledby="primary-navigation">
          <h2 id="primary-navigation">Primary navigation</h2>
          <ul className="sidebar-list" role="list">
            <li>
              <NavLink to="/" end className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/watchlist"
                className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
              >
                Watchlist
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/portfolio"
                className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
              >
                Portfolio
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      <main id="main-content" className="app-main" role="main" aria-label="Application Root">
        <Outlet />
      </main>
    </div>
  );
}
