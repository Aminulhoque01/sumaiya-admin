 
import {
  useState,
  type ReactNode,
} from "react";

import Sidebar from "./Sidebar";
 
import MobileSidebar from "./MobileSidebar";
import Topbar from "./Topbar";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        open={mobileSidebarOpen}
        onClose={() =>
          setMobileSidebarOpen(false)
        }
      />

      {/* Main */}
      <div className="min-h-screen lg:pl-[270px]">
        <Topbar
          onMenuClick={() =>
            setMobileSidebarOpen(true)
          }
        />

        <main className="min-h-[calc(100vh-82px)] p-5 sm:p-7 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
 
