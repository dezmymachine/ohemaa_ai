import { Outlet, useLocation, Link } from "react-router"
import { Home, Camera, Calendar, Apple, MessageCircle } from "lucide-react"

export function RootLayout() {
  const location = useLocation()

  const navItems = [
    { path: "/app", icon: Home, label: "Home" },
    { path: "/app/scan", icon: Camera, label: "Scan" },
    { path: "/app/track", icon: Calendar, label: "Track" },
    { path: "/app/nutrition", icon: Apple, label: "Nutrition" },
    { path: "/app/chat", icon: MessageCircle, label: "Chat" },
  ]

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background">
      <div className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </div>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-border shadow-lg">
        <div className="flex justify-around items-center h-20 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.path === "/app"
                ? location.pathname === "/app"
                : location.pathname.startsWith(item.path)

            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors"
              >
                <Icon
                  className={`w-6 h-6 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`text-xs ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}