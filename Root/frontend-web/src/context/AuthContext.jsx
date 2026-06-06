/**
 * AuthContext - Quản lý xác thực người dùng
 */

import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";

export const AuthContext = createContext(null);

/**
 * Giải mã JWT payload từ token string.
 * @param {string} token
 * @returns {object|null}
 */
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Xác định trang redirect sau khi đăng nhập dựa trên role.
 * - BCN  → /bcn-management (quản lý sự kiện CLB)
 * - KHOA → /faculty-management (duyệt sự kiện cấp khoa)
 * - CTSV → /student-affairs (duyệt sự kiện cấp trường)
 * - SV   → /                 (danh sách sự kiện)
 *
 * @param {string} role
 * @returns {string}
 */
function getHomeByRole(role) {
  switch (role) {
    case "BCN":
      return "/bcn-management";
    case "KHOA":
      return "/faculty-management";
    case "CTSV":
      return "/student-affairs";
    default:
      return "/";
  }
}

/**
 * AuthProvider - Provider bao bọc ứng dụng để cung cấp auth state.
 *
 * State shape:
 * - user: { maND, hoTen, email, role } | null
 * - token: string | null
 * - isLoading: boolean
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Khôi phục session từ localStorage khi tải lại trang
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      const payload = parseJwt(savedToken);
      if (payload && payload.exp * 1000 > Date.now()) {
        const managementClubId = localStorage.getItem("managementClubId");
        const defaultRole = payload.role || "SV";
        setUser({
          maND: payload.maND || payload.maSV,
          maSV: payload.maSV || payload.maND,
          hoTen: payload.hoTen,
          email: payload.email,
          role: managementClubId ? "BCN" : defaultRole,
          originalRole: managementClubId ? defaultRole : undefined,
          clubId: managementClubId || undefined,
          tenDVQL: payload.tenDVQL || null,
        });
        setToken(savedToken);
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("managementClubId");
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * Đăng nhập với email và password.
   * Gọi POST /api/auth/login, lưu token, cập nhật state, navigate về trang phù hợp với role.
   *
   * @param {string} email
   * @param {string} password
   * @throws {AxiosError} Nếu đăng nhập thất bại
   */
  async function login(email, password) {
    const response = await apiClient.post("/api/auth/login", {
      email,
      password,
    });
    const {
      token: newToken,
      maND,
      maSV,
      hoTen,
      email: userEmail,
      role,
      tenDVQL,
    } = response.data.data;

    localStorage.setItem("token", newToken);
    setToken(newToken);

    const userObj = {
      maND: maND || maSV,
      maSV: maSV || maND,
      hoTen,
      email: userEmail,
      role: role || "SV",
      tenDVQL: tenDVQL || null,
    };
    setUser(userObj);

    navigate(getHomeByRole(userObj.role));
  }

  /**
   * Đăng xuất: xóa token, reset state, navigate về trang login.
   */
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("managementClubId");
    setToken(null);
    setUser(null);
    navigate("/login");
  }

  function enterManagementMode(clubId) {
    if (user) {
      setUser((prev) => ({
        ...prev,
        originalRole: prev.originalRole || prev.role,
        role: "BCN",
        clubId: clubId,
      }));
      localStorage.setItem("managementClubId", clubId);
    }
  }

  function exitManagementMode() {
    if (user) {
      setUser((prev) => {
        const updated = { ...prev };
        updated.role = prev.originalRole || "SV";
        delete updated.originalRole;
        delete updated.clubId;
        return updated;
      });
      localStorage.removeItem("managementClubId");
      navigate("/clubs");
    }
  }

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    enterManagementMode,
    exitManagementMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook tiện ích để sử dụng AuthContext.
 * Phải được dùng bên trong AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth phải được dùng bên trong AuthProvider");
  return context;
}
