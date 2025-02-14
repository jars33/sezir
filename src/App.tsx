
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createBrowserRouter, RouterProvider, RouteObject, IndexRouteObject, NonIndexRouteObject } from "react-router-dom"
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
  // Handle index routes
  if ('index' in route && route.index === true) {
    return {
      ...route,
      element: <AppWithProviders>{route.element}</AppWithProviders>
    } as IndexRouteObject
  }

  // Handle non-index routes
  const nonIndexRoute = route as NonIndexRouteObject
  if (nonIndexRoute.children) {
    return {
      ...nonIndexRoute,
      element: <AppWithProviders>{nonIndexRoute.element}</AppWithProviders>,
      children: nonIndexRoute.children.map(child => {
        if ('index' in child && child.index === true) {
          return {
            ...child,
            element: <AppWithProviders>{child.element}</AppWithProviders>
          } as IndexRouteObject
        }
        return {
          ...child,
          element: <AppWithProviders>{child.element}</AppWithProviders>
        } as NonIndexRouteObject
      })
    } as NonIndexRouteObject
  }

  return {
    ...nonIndexRoute,
    element: <AppWithProviders>{nonIndexRoute.element}</AppWithProviders>
  } as NonIndexRouteObject
})

function App() {
  const router = createBrowserRouter(routesWithAuth)

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
