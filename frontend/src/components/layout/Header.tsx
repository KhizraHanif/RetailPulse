import { Menu, Search } from "lucide-react"
import { useLocation } from "react-router"


type HeaderProps = {
  onToggleSidebar: () => void
}


function Header({
  onToggleSidebar,
}: HeaderProps) {
  const location = useLocation()

  const pageTitles: Record<
    string,
    {
      title: string
      subtitle: string
    }
  > = {
    "/dashboard": {
      title: "Dashboard",
      subtitle: "Store performance overview",
    },
    
    "/users": {
  title: "Users",
  subtitle: "Manage staff accounts and access",
},

    "/products": {
      title: "Products",
      subtitle: "Manage your product catalogue",
    },

    "/inventory": {
      title: "Inventory",
      subtitle: "Monitor stock and movements",
    },

    "/tasks": {
      title: "Tasks",
      subtitle: "Manage warehouse operations",
    },

    "/orders": {
      title: "Orders",
      subtitle: "Manage retail orders",
    },

    "/analytics": {
      title: "Analytics",
      subtitle: "Explore business performance",
    },
  }

  const currentPage =
    pageTitles[location.pathname] ??
    pageTitles["/dashboard"]

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">

      <div className="flex items-center gap-4">

        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 transition hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>


        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {currentPage.title}
          </h1>

          <p className="text-sm text-gray-500">
            {currentPage.subtitle}
          </p>
        </div>

      </div>


      <div className="flex items-center gap-4">

        <div className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 md:flex">
          <Search
            size={16}
            className="text-gray-400"
          />

          <input
            type="text"
            placeholder="Search..."
            className="w-48 bg-transparent text-sm outline-none"
          />
        </div>


        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
          KH
        </div>

      </div>

    </header>
  )
}



export default Header