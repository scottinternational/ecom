import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Factory,
  Palette,
  Package,
  Archive,
  TrendingUp,
  MessageSquare,
  Settings,
  Users,
  UsersIcon,
  ShoppingBag,
  Cog,
  ChevronDown,
  Database,
  Globe,
  Link,
  Building2,
  Store
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    badge: null
  },
  
  {
    title: "R&D",
    url: "/rnd",
    icon: Settings,
    badge: "12"
  },
  {
    title: "Procurement",
    url: "/procurement",
    icon: Factory,
    badge: "8"
  },
  {
    title: "Products",
    url: "/products",
    icon: ShoppingBag,
    badge: null,
    submenu: [
      {
        title: "Listing",
        url: "/products/listing",
        icon: Globe,
        badge: null
      },
      {
        title: "Product Master",
        url: "/products/master",
        icon: Database,
        badge: null
      },
      {
        title: "Mapping",
        url: "/products/mapping",
        icon: Link,
        badge: null
      },
      {
        title: "Brands",
        url: "/products/brands",
        icon: Building2,
        badge: null
      }
    ]
  },
  {
    title: "Marketplaces",
    url: "/marketplaces",
    icon: Store,
    badge: null
  },
  {
    title: "Graphic & Content",
    url: "/graphic-content",
    icon: Palette,
    badge: "5"
  },
  {
    title: "Listing & Catalogue",
    url: "/listing-catalogue",
    icon: Package,
    badge: "23"
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: Archive,
    badge: "3"
  },
  {
    title: "Ads & Marketing",
    url: "/ads-marketing",
    icon: TrendingUp,
    badge: null
  },
  {
    title: "Product Review",
    url: "/product-review",
    icon: MessageSquare,
    badge: "7"
  },
  {
    title: "Operations",
    url: "/operations",
    icon: Cog,
    badge: null
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
    badge: null
  },
  {
    title: "People (HRM)",
    url: "/people",
    icon: UsersIcon,
    badge: null
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    badge: null
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const [expandedMenus, setExpandedMenus] = React.useState<string[]>([]);

  // Auto-expand menu when a submenu item is active and collapse others
  React.useEffect(() => {
    const activeMenu = menuItems.find(item => 
      item.submenu && item.submenu.some(subItem => isActive(subItem.url))
    );
    
    if (activeMenu) {
      // Only keep the active menu expanded, collapse others
      setExpandedMenus([activeMenu.title]);
    } else {
      // If no submenu is active, collapse all menus
      setExpandedMenus([]);
    }
  }, [currentPath]);

  const toggleMenu = (menuTitle: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuTitle) 
        ? prev.filter(title => title !== menuTitle)
        : [...prev, menuTitle]
    );
  };

  const isMenuExpanded = (menuTitle: string) => expandedMenus.includes(menuTitle);

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    const active = isActive(path);
    return active 
      ? "bg-primary text-primary-foreground shadow-enterprise" 
      : "hover:bg-muted/80 text-muted-foreground hover:text-foreground";
  };

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} border-r border-border bg-card shadow-enterprise`}>
      <SidebarContent className="py-4">
        {/* Logo Section */}
        <div className="px-4 pb-4 border-b border-border">
          {!collapsed ? (
            <div className="flex items-center space-x-2">
              <div>
                <img
                  src="https://i.postimg.cc/tgfBGrZZ/6732e31fc8403c1a709ad1e0-256-1.png"
                  alt="scott logo"
                  className="h-12 w-12"
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Switzinc</h2>
                <p className="text-xs text-muted-foreground">Scott International</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.submenu ? (
                    <SidebarMenuSub>
                      <SidebarMenuButton 
                        className={`w-full transition-all duration-200 ${getNavClasses(item.url)}`}
                        onClick={() => toggleMenu(item.title)}
                      >
                        <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive(item.url) ? 'text-primary-foreground' : 'text-current'}`} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-sm font-medium truncate">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                isActive(item.url) 
                                  ? 'bg-primary-foreground/20 text-primary-foreground' 
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                              isMenuExpanded(item.title) ? 'rotate-180' : ''
                            }`} />
                          </>
                        )}
                        {collapsed && item.badge && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
                      </SidebarMenuButton>
                      {isMenuExpanded(item.title) && (
                        <SidebarMenuSubItem>
                          {item.submenu.map((subItem) => (
                            <SidebarMenuSubButton 
                              key={subItem.title}
                              asChild 
                              className={`w-full transition-all duration-200 ${getNavClasses(subItem.url)}`}
                            >
                              <NavLink 
                                to={subItem.url} 
                                className="flex items-center space-x-3 px-3 py-2 rounded-md group"
                              >
                                <subItem.icon className={`h-4 w-4 flex-shrink-0 ${isActive(subItem.url) ? 'text-primary-foreground' : 'text-current'}`} />
                                {!collapsed && (
                                  <>
                                    <span className="flex-1 text-sm font-medium truncate">
                                      {subItem.title}
                                    </span>
                                    {subItem.badge && (
                                      <span className={`px-2 py-1 text-xs rounded-full ${
                                        isActive(subItem.url) 
                                          ? 'bg-primary-foreground/20 text-primary-foreground' 
                                          : 'bg-muted text-muted-foreground'
                                      }`}>
                                        {subItem.badge}
                                      </span>
                                    )}
                                  </>
                                )}
                              </NavLink>
                            </SidebarMenuSubButton>
                          ))}
                        </SidebarMenuSubItem>
                      )}
                    </SidebarMenuSub>
                  ) : (
                    <SidebarMenuButton 
                      asChild 
                      className={`w-full transition-all duration-200 ${getNavClasses(item.url)}`}
                    >
                      <NavLink 
                        to={item.url} 
                        end={item.url === "/"}
                        className="flex items-center space-x-3 px-3 py-2 rounded-md group"
                      >
                        <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive(item.url) ? 'text-primary-foreground' : 'text-current'}`} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-sm font-medium truncate">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                isActive(item.url) 
                                  ? 'bg-primary-foreground/20 text-primary-foreground' 
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                        {collapsed && item.badge && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}