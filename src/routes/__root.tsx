import { AuthButton } from "@/components/AuthButton.tsx";
import { AuthLogin } from "@/components/AuthLogin.tsx";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu.tsx";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

function AppShell() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show auth form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md mx-auto p-8 bg-white rounded-lg shadow-sm">
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-2xl font-bold">Welcome to Labeler</h1>
            <p className="text-gray-600">Please sign in to continue</p>
          </div>

          <AuthLogin />
        </div>
      </div>
    );
  }

  // Show authenticated app
  return (
    <>
      <header className="border-b p-2 flex items-center justify-between">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/" activeProps={{ "data-active": true }}>
                  Dash
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/files" activeProps={{ "data-active": true }}>
                  Files
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/samples" activeProps={{ "data-active": true }}>
                  Samples
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/viruses" activeProps={{ "data-active": true }}>
                  Viruses
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <AuthButton />
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </>
  );
}

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  ),
});
