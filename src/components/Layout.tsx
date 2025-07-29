import { Link, Outlet, useLocation } from "react-router-dom";
import { useContextSelector } from "use-context-selector";
import { AuthContext } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UtensilsCrossed, LogOut, User, Menu } from "lucide-react";

export function Layout() {
  const logout = useContextSelector(AuthContext, (ctx) => ctx.logout);
  const location = useLocation();

  const menuItems = [
    { label: "Cardápio", to: "/menu", icon: <Menu size={16} /> },
    { label: "Mesas", to: "/tables", icon: <UtensilsCrossed size={16} /> },
    { label: "Usuários", to: "/users", icon: <User size={16} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fef7f0]">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-gradient-to-r from-[#D35400] to-[#FF7F50] text-white shadow-lg fixed w-full z-50">
        {/* Logo */}
        <h1 className="text-2xl font-extrabold tracking-tight">
          Food<span className="text-yellow-200">Flow</span>
        </h1>

        {/* Menu de navegação */}
        <nav className="flex gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md transition-all hover:bg-white/20",
                location.pathname === item.to ? "bg-white/30" : ""
              )}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <Button
          variant="ghost"
          onClick={logout}
          className="flex gap-2 items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition cursor-pointer"
        >
          <LogOut size={16} />
          Sair
        </Button>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 pt-20 px-8">
        <Outlet />
      </main>
    </div>
  );
}
