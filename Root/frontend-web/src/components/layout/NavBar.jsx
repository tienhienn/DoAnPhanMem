/**
 * NavBar - Responsive navigation bar
 * - Desktop (≥1024px / lg): fixed top, logo + nav links + student info
 * - Mobile (<1024px): fixed bottom, icon + label
 * Requirements: 7.1, 7.2, 7.3, 7.5
 */

import { NavLink, useLocation } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

// Calendar icon (SVG inline)
function CalendarIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

// Bookmark/list icon (SVG inline)
function BookmarkIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

// User icon for student info
function UserIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const navItems = [
  {
    label: "Sự Kiện",
    path: "/",
    icon: CalendarIcon,
  },
  {
    label: "Của Tôi",
    path: "/my-events",
    icon: BookmarkIcon,
  },
];

export default function NavBar() {
  const { currentStudent } = useAppContext();
  const location = useLocation();

  /**
   * Determine if a nav item is active.
   * "/" is active only when exactly at "/", not on sub-routes like "/events/:id".
   * "/my-events" is active when pathname starts with "/my-events".
   */
  function isActive(path) {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  }

  return (
    <>
      {/* ── Desktop NavBar (lg and above): fixed top ── */}
      <nav
        className="hidden lg:flex fixed top-0 left-0 right-0 z-50 h-16 items-center px-6 bg-white/95 backdrop-blur-sm border-b border-indigo-100 shadow-sm"
        aria-label="Điều hướng chính"
      >
        {/* Logo / Brand */}
        <div className="flex items-center gap-2 min-w-[160px]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold leading-none">H</span>
          </div>
          <span className="text-indigo-700 font-bold text-lg tracking-tight">
            HCMUTE CLB
          </span>
        </div>

        {/* Nav Links — centered */}
        <div className="flex-1 flex justify-center gap-1">
          {navItems.map(({ label, path, icon: Icon }) => {
            const active = isActive(path);
            return (
              <NavLink
                key={path}
                to={path}
                className={[
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/60",
                ].join(" ")}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            );
          })}
        </div>

        {/* Student Info — right */}
        <div className="flex items-center gap-3 min-w-[160px] justify-end">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-right leading-tight">
            <p className="text-sm font-semibold text-slate-800 truncate max-w-[140px]">
              {currentStudent.fullName}
            </p>
            <p className="text-xs text-slate-400">{currentStudent.studentId}</p>
          </div>
        </div>
      </nav>

      {/* ── Mobile NavBar (below lg): fixed bottom ── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 flex items-stretch bg-white border-t border-indigo-100 shadow-[0_-2px_12px_rgba(99,102,241,0.08)]"
        aria-label="Điều hướng chính"
      >
        {navItems.map(({ label, path, icon: Icon }) => {
          const active = isActive(path);
          return (
            <NavLink
              key={path}
              to={path}
              className={[
                "relative flex-1 flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors duration-150",
                active
                  ? "text-indigo-600"
                  : "text-slate-400 hover:text-indigo-500",
              ].join(" ")}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                className={[
                  "w-5 h-5 transition-transform duration-150",
                  active ? "scale-110" : "",
                ].join(" ")}
              />
              <span>{label}</span>
              {/* Active indicator dot */}
              {active && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-600" />
              )}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
