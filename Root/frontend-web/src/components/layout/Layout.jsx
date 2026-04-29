/**
 * Layout - Root layout component
 * Renders NavBar + page content via <Outlet />
 * - Desktop (lg+): padding-top to clear fixed top NavBar (h-16)
 * - Mobile (<lg): padding-bottom to clear fixed bottom NavBar (h-16)
 * Requirements: 7.1
 */

import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      {/*
        pt-16 on lg+ clears the fixed top navbar (h-16 = 4rem)
        pb-16 on mobile clears the fixed bottom navbar (h-16 = 4rem)
      */}
      <main className="pb-16 lg:pb-0 lg:pt-16">
        <Outlet />
      </main>
    </div>
  );
}
