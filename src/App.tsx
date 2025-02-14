
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/AuthProvider"
import { routes } from "./routes.tsx"
import "./App.css"

const queryClient = new QueryClient()

// Create a wrapper component that provides auth context
function AppWithProviders() {
  return (
    <AuthProvider>
      <Toaster />
    </AuthProvider>
  )
}

// Update the routes to wrap the elements with the auth provider
const routesWithAuth = routes.map(route => ({
  ...route,
  element: (
    <AppWithProviders>
      {route.element}
    </AppWithProviders>
  ),
  // If there are children routes, wrap their elements too
  ...(route.children && {
    children: route.children.map(child => ({
      ...child,
      element: (
        <AppWithProviders>
          {child.element}
        </AppWithProviders>
      ),
    })),
  }),
}))

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
