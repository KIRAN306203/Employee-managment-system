import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCircle,
  LogOut,
  Settings,
  Shield,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AppSidebar() {
  const { user, role, signOut } = useAuth();

  const navigationItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
      roles: ["admin", "manager", "employee"],
    },
    {
      title: "Employees",
      url: "/employees",
      icon: Users,
      roles: ["admin", "manager"],
    },
    {
      title: "Departments",
      url: "/departments",
      icon: Building2,
      roles: ["admin", "manager"],
    },
    {
      title: "Profile",
      url: "/profile",
      icon: UserCircle,
      roles: ["admin", "manager", "employee"],
    },
  ];

  const adminItems = [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      roles: ["admin"],
    },
  ];

  const visibleItems = navigationItems.filter((item) =>
    item.roles.includes(role || "employee")
  );

  const visibleAdminItems = adminItems.filter((item) =>
    item.roles.includes(role || "employee")
  );

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-primary text-primary-foreground font-medium"
      : "hover:bg-accent";

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg">EmployeeHub</h2>
            <p className="text-xs text-muted-foreground capitalize">{role} Portal</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavClass}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {visibleAdminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleAdminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClass}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate max-w-[120px]">
                {user?.email?.split("@")[0]}
              </span>
              <span className="text-xs text-muted-foreground">{user?.email}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="h-8 w-8"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
