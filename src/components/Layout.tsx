// layout.tsx
import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  Calendar,
  ChevronDown,
  CircleUser,
  LogOut,
  Menu,
  Settings,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
  hideSidebar?: boolean;
}

const Layout = ({ children, hideSidebar = false }: LayoutProps) => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const navigation = isAdmin
    ? [
        { name: "Admin Dashboard", href: "/admin", icon: Settings },
        { name: "Manage Workspaces", href: "/admin/workspaces", icon: Settings },
      ]
    : [
        { name: "Dashboard", href: "/dashboard", icon: Building2 },
        { name: "Book Space", href: "/booking", icon: Calendar },
      ];

  const NavLink = ({ item }: { item: typeof navigation[0] }) => {
    const isActive = location.pathname === item.href;
    return (
      <Link
        to={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <item.icon className="h-4 w-4" />
        {item.name}
      </Link>
    );
  };

  const MobileNav = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <div className="px-2 py-4">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            FlexiSpace
          </h2>
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  // The existing user menu for authenticated users
  const AuthenticatedUserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <CircleUser className="h-5 w-5" />
          <span className="hidden sm:inline">{profile?.full_name || user?.email}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/profile")}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // The public menu for non-authenticated users
  const PublicUserMenu = () => (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={() => navigate("/login")}>
        Sign in
      </Button>
      <Button onClick={() => navigate("/signup")}>Sign up</Button>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          {isMobile ? (
            <MobileNav />
          ) : (
            <Link to="/dashboard" className="flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              <span className="text-xl font-bold">FlexiSpace</span>
            </Link>
          )}
        </div>

        <div className="ml-auto flex items-center gap-4">
          {/* If user is logged in, show My Account dropdown; otherwise show Sign in / Sign up */}
          {user ? <AuthenticatedUserMenu /> : <PublicUserMenu />}
        </div>
      </header>

      {/* Main Content with optional sidebar */}
      <div className="flex flex-1">
        {!isMobile && !hideSidebar && (
          <aside className="hidden w-64 flex-col border-r bg-background md:flex">
            <div className="flex flex-col gap-2 p-4">
              {navigation.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
            </div>
          </aside>
        )}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
