
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/AuthProvider"
import { routes } from "./routes.tsx"
import "./App.css"

const queryClient = new QueryClient()

function App() {
  const router = createBrowserRouter(routes)

  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
