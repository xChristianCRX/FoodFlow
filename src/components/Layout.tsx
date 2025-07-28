import { Link, Outlet, useLocation } from "react-router-dom";
import { useContextSelector } from "use-context-selector";
import { AuthContext } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Home, UtensilsCrossed, LogOut, User, Menu } from "lucide-react";

export function Layout() {
  const logout = useContextSelector(AuthContext, (ctx) => ctx.logout);
  const location = useLocation();

  const menuItems = [
    { label: "Mesas", to: "/tables", icon: <UtensilsCrossed size={18} /> },
    { label: "Cardápio", to: "/menu", icon: <Menu size={18} /> },
    { label: "Usuários", to: "/users", icon: <User size={18} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#fef7f0]">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#D35400] to-[#FF7F50] text-white p-6 flex flex-col shadow-xl">
        <h1 className="text-3xl font-extrabold mb-10 tracking-tight text-white">
          Food<span className="text-yellow-200">Flow</span>
        </h1>

        <nav className="flex-1">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[#d14900]/70 transition-all",
                    location.pathname === item.to ? "bg-[#b43e00]" : ""
                  )}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Separator className="bg-white/30 my-4" />

        <Button
          variant="ghost"
          onClick={logout}
          className="flex gap-2 items-center bg-red-500 text-white hover:bg-red-600 transition hover:cursor-pointer"
        >
          <LogOut size={18} />
          Logout
        </Button>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
