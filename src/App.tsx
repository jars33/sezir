
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createBrowserRouter, RouterProvider, RouteObject } from "react-router-dom"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/AuthProvider"
import { routes } from "./routes.tsx"
import "./App.css"

const queryClient = new QueryClient()

// Create a wrapper component that provides auth context
function AppWithProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  )
}

// Update the routes to wrap the elements with the auth provider
const routesWithAuth: RouteObject[] = routes.map(route => {
  if (route.children) {
    return {
      ...route,
      element: <AppWithProviders>{route.element}</AppWithProviders>,
      children: route.children.map(child => ({
        ...child,
        element: <AppWithProviders>{child.element}</AppWithProviders>
      }))
    }
  }
  return {
    ...route,
    element: <AppWithProviders>{route.element}</AppWithProviders>
  }
})

function App() {
  const router = createBrowserRouter(routesWithAuth)

  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
