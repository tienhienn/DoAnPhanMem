/**
 * NavBar - Responsive navigation bar
 * - Desktop (≥1024px / lg): fixed top, logo + nav links + user info + logout
 * - Mobile (<1024px): fixed bottom, icon + label + logout
 *
 * Menu hiển thị theo role:
 * - SV   → Sự Kiện, Của Tôi
 * - BCN  → Sự Kiện, Quản lý (BCN)
 * - KHOA → Sự Kiện, Quản lý (Khoa)
 * - CTSV → Sự Kiện, Quản lý (CTSV)
 */

import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../utils/apiClient";

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

function ManageIcon({ className }) {
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
      <path d="M12 3v3" />
      <path d="M12 18v3" />
      <path d="M4.22 4.22l2.12 2.12" />
      <path d="M17.66 17.66l2.12 2.12" />
      <path d="M1 12h3" />
      <path d="M20 12h3" />
      <path d="M4.22 19.78l2.12-2.12" />
      <path d="M17.66 6.34l2.12-2.12" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function LogoutIcon({ className }) {
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function UsersGroupIcon({ className }) {
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
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function UserProfileIcon({ className }) {
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

function ChecklistIcon({ className }) {
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
      <path d="M9 11l3 3L22 4" />
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1" />
    </svg>
  );
}

function PeopleIcon({ className }) {
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
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function WalletIcon({ className }) {
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
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <path d="M1 10h22" />
      <circle cx="17" cy="15" r="1" />
    </svg>
  );
}

function FileTextIcon({ className }) {
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="13" x2="12" y2="17" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  );
}

function BellIcon({ className }) {
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
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function CheckIcon({ className }) {
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
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/** Label hiển thị role trong navbar */
const ROLE_LABELS = {
  SV: "Sinh viên",
  BCN: "Ban chủ nhiệm CLB",
  KHOA: "Cán bộ Khoa",
  CTSV: "Phòng CTSV",
};

/** Nav items theo role */
function getNavItems(role) {
  const events = { label: "Sự Kiện", path: "/", icon: CalendarIcon };

  if (role === "SV") {
    return [
      events,
      { label: "Nhiệm vụ", path: "/my-tasks", icon: ChecklistIcon },
      { label: "Của Tôi", path: "/my-events", icon: BookmarkIcon },
      { label: "Câu lạc bộ", path: "/clubs", icon: UsersGroupIcon },
      { label: "Cá nhân", path: "/profile", icon: UserProfileIcon },
    ];
  }

  if (role === "BCN") {
    const manage = {
      label: "Quản lý BCN",
      path: "/bcn-management",
      icon: ManageIcon,
    };
    const members = {
      label: "Quản lý nhân sự",
      path: "/member-management",
      icon: PeopleIcon,
    };
    const tasks = {
      label: "Phân công nhiệm vụ",
      path: "/event-tasks/1",
      icon: ChecklistIcon,
    };
    const finance = {
      label: "Tài chính & CSVC",
      path: "/finance-logistics",
      icon: WalletIcon,
    };
    const reports = {
      label: "Báo cáo & Văn bản",
      path: "/periodic-reports",
      icon: FileTextIcon,
    };
    return [manage, members, tasks, finance, reports];
  }

  if (role === "KHOA") {
    const manage = {
      label: "Duyệt Khoa",
      path: "/faculty-management",
      icon: ManageIcon,
    };
    const clubs = {
      label: "Quản lý CLB",
      path: "/khoa/clubs",
      icon: UsersGroupIcon,
    };
    return [events, manage, clubs];
  }

  if (role === "CTSV") {
    const manage = {
      label: "Quản lý CTSV",
      path: "/student-affairs",
      icon: ManageIcon,
    };
    const reports = {
      label: "Xem Báo cáo",
      path: "/ctsv/reports",
      icon: FileTextIcon,
    };
    return [events, manage, reports];
  }

  // Default
  return [events];
}

export default function NavBar() {
  const { user, logout, exitManagementMode } = useAuth();
  const location = useLocation();
  const navItems = getNavItems(user?.role);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user && user.role === "SV") {
      fetchNotifications();
      const timer = setInterval(fetchNotifications, 30000);
      return () => clearInterval(timer);
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get("/api/students/me/notifications");
      if (response.data.success) {
        setNotifications(response.data.data);
        const unread = response.data.data.filter((n) => !n.DaDoc).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const response = await apiClient.put(
        `/api/students/me/notifications/${id}/read`,
      );
      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.MaTB === id ? { ...n, DaDoc: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifs = notifications.filter((n) => !n.DaDoc);
      await Promise.all(
        unreadNotifs.map((n) =>
          apiClient.put(`/api/students/me/notifications/${n.MaTB}/read`),
        ),
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, DaDoc: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const renderNotificationBell = () => {
    if (!user || user.role !== "SV") return null;

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowNotifDropdown(!showNotifDropdown)}
          className="relative p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors focus:outline-none"
          title="Thông báo"
        >
          <BellIcon className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotifDropdown && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-indigo-50/80 z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-slate-50">
              <span className="font-bold text-slate-800 text-sm">
                Thông báo
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                >
                  <CheckIcon className="w-3.5 h-3.5" /> Đọc tất cả
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  Không có thông báo nào.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.MaTB}
                    onClick={() => !notif.DaDoc && handleMarkAsRead(notif.MaTB)}
                    className={[
                      "p-4 transition-colors cursor-pointer text-left",
                      notif.DaDoc
                        ? "hover:bg-slate-50"
                        : "bg-indigo-50/30 hover:bg-indigo-50/50",
                    ].join(" ")}
                  >
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5 overflow-hidden">
                        {notif.ClubLogo ? (
                          <img
                            src={notif.ClubLogo}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          notif.TenCLB?.charAt(0) || "T"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                            {notif.TenCLB || "Hệ thống"}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">
                            {new Date(notif.NgayGui).toLocaleDateString(
                              "vi-VN",
                            )}
                          </span>
                        </div>
                        <p
                          className={[
                            "text-sm mt-0.5 text-slate-800",
                            !notif.DaDoc ? "font-bold" : "font-normal",
                          ].join(" ")}
                        >
                          {notif.TieuDe}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {notif.NoiDung}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  function isActive(path) {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  }

  const roleLabel = ROLE_LABELS[user?.role] || "Người dùng";

  return (
    <>
      {/* ── Mobile Header Bar (below lg): fixed top ── */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-white/95 backdrop-blur-sm border-b border-indigo-100 flex items-center justify-between px-4 shadow-sm"
        aria-label="Thanh tiêu đề di động"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold leading-none">U</span>
          </div>
          <span className="text-indigo-700 font-bold text-base tracking-tight">
            UTE-UDN CLB
          </span>
        </div>
        <div className="flex items-center gap-2">
          {user?.originalRole === "SV" && (
            <button
              onClick={exitManagementMode}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all"
            >
              Thoát Quản lý
            </button>
          )}
          {renderNotificationBell()}
        </div>
      </div>

      {/* ── Desktop NavBar (lg and above): fixed top ── */}
      <nav
        className="hidden lg:flex fixed top-0 left-0 right-0 z-50 h-16 items-center px-6 bg-white/95 backdrop-blur-sm border-b border-indigo-100 shadow-sm"
        aria-label="Điều hướng chính"
      >
        {/* Logo / Brand */}
        <div className="flex items-center gap-2 min-w-[160px]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold leading-none">U</span>
          </div>
          <span className="text-indigo-700 font-bold text-lg tracking-tight">
            UTE-UDN CLB
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

        {/* User Info + Logout — right */}
        <div className="flex items-center gap-3 min-w-[160px] justify-end">
          {user?.originalRole === "SV" && (
            <button
              onClick={exitManagementMode}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all transform hover:scale-[1.02] flex items-center gap-1"
            >
              Thoát Quản lý
            </button>
          )}
          {renderNotificationBell()}
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-right leading-tight">
            <p className="text-sm font-semibold text-slate-800 truncate max-w-[140px]">
              {user?.hoTen}
            </p>
            <p className="text-xs text-slate-400">{roleLabel}</p>
          </div>
          <button
            onClick={logout}
            title="Đăng xuất"
            className="ml-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
            aria-label="Đăng xuất"
          >
            <LogoutIcon className="w-4 h-4" />
            <span className="hidden xl:inline">Đăng xuất</span>
          </button>
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
              {active && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-600" />
              )}
            </NavLink>
          );
        })}

        {/* Nút đăng xuất mobile */}
        <button
          onClick={logout}
          className="relative flex-1 flex flex-col items-center justify-center gap-1 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors duration-150"
          aria-label="Đăng xuất"
        >
          <LogoutIcon className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </nav>
    </>
  );
}
