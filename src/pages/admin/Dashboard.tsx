import { useEffect, useState } from "react";
import {
  useNavigate,
  Outlet,
  Link,
  useLocation,
} from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Star,
  Settings,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  BookOpen,
  Search,
  Calendar,
  ClipboardList,
  Users,
  Gamepad2,
  Share2,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Oversikt", path: "/admin" },
  { icon: FileText, label: "Innhold", path: "/admin/content" },
  { icon: Calendar, label: "Events", path: "/admin/events" },
  { icon: ClipboardList, label: "Bookinger", path: "/admin/bookings" },
  { icon: Users, label: "Sponsorer", path: "/admin/sponsors" },
  { icon: Package, label: "Pakker", path: "/admin/packages" },
  { icon: BookOpen, label: "Blogg", path: "/admin/blog" },
  { icon: Star, label: "Anmeldelser", path: "/admin/reviews" },
  { icon: MessageSquare, label: "Meldinger", path: "/admin/messages" },
  { icon: Share2, label: "Sosiale Medier", path: "/admin/some" },
  { icon: Search, label: "SEO & AEO", path: "/admin/seo" },
  { icon: Settings, label: "Innstillinger", path: "/admin/settings" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
    } else {
      setUser(session.user);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#1C244B] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Branding */}
        <div className="flex h-16 items-center gap-3 px-6">
          <Link to="/" className="flex items-center gap-2">
            <Gamepad2 className="h-7 w-7 text-[#F2DE27]" />
            <span className="text-xl font-bold text-[#F2DE27]">STOLL</span>
          </Link>
          <span className="text-sm font-medium text-white/60">Admin</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-md p-1 text-white/60 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Separator className="bg-white/10" />

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-[#5F4E9D] text-white shadow-sm"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Separator className="bg-white/10" />

        {/* User & Logout */}
        <div className="p-4">
          {user?.email && (
            <p className="mb-2 truncate text-xs text-gray-400">{user.email}</p>
          )}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-gray-300 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Logg ut
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          <h1 className="text-lg font-semibold text-gray-900">
            {menuItems.find((item) => item.path === location.pathname)?.label ||
              "Admin"}
          </h1>

          <Link
            to="/"
            target="_blank"
            className="text-sm font-medium text-[#5F4E9D] transition-colors hover:text-[#5F4E9D]/80"
          >
            Se nettside &rarr;
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
