import {
  BarChart3,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react"

import { NavLink } from "react-router"


type SidebarProps = {
  collapsed: boolean
  userRole?: string
}


function Sidebar({
  collapsed,
  userRole,
}: SidebarProps) {
  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Products",
      path: "/products",
      icon: Package,
    },
    {
      label: "Inventory",
      path: "/inventory",
      icon: Boxes,
    },
    {
      label: "Tasks",
      path: "/tasks",
      icon: ClipboardList,
    },
    {
      label: "Orders",
      path: "/orders",
      icon: ShoppingCart,
    },
    {
      label: "Analytics",
      path: "/analytics",
      icon: BarChart3,
    },
  ]


  if (userRole === "owner") {
    navItems.push({
      label: "Users",
      path: "/users",
      icon: Users,
    })
  }


  return (
    <aside
      className={`
        min-h-screen
        border-r
        border-gray-200
        bg-white
        px-3
        py-5
        transition-all
        duration-300
        ${
          collapsed
            ? "w-20"
            : "w-64"
        }
      `}
    >

      <div className="mb-8 px-2">

        <h2 className="text-xl font-bold tracking-tight">
          {collapsed
            ? "RP"
            : "RetailPulse"}
        </h2>

      </div>


      <nav className="space-y-2">

        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({
                isActive,
              }) =>
                `
                  flex
                  items-center
                  gap-3
                  rounded-lg
                  px-3
                  py-2
                  text-sm
                  font-medium
                  transition
                  ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }
                `
              }
            >

              <Icon size={19} />

              {!collapsed && (
                <span>
                  {item.label}
                </span>
              )}

            </NavLink>
          )
        })}

      </nav>

    </aside>
  )
}


export default Sidebar