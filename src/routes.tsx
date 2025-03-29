
import { RouteObject } from "react-router-dom"
import MainLayout from "@/components/MainLayout"
import Auth from "@/pages/Auth"
import Index from "@/pages/Index"
import Projects from "@/pages/Projects"
import ProjectDetails from "@/pages/ProjectDetails"
import Team from "@/pages/Team"
import Teams from "@/pages/Teams"
import TeamDetails from "@/pages/TeamDetails"
import TeamMemberDetails from "@/pages/TeamMemberDetails"
import NotFound from "@/pages/NotFound"

export const routes: RouteObject[] = [
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: "projects",
        element: <Projects />,
      },
      {
        path: "projects/:id",
        element: <ProjectDetails />,
      },
      {
        path: "team",
        element: <Team />,
      },
      {
        path: "teams",
        element: <Teams />,
      },
      {
        path: "teams/new",
        element: <TeamDetails />,
      },
      {
        path: "teams/:id",
        element: <TeamDetails />,
      },
      {
        path: "team/new",
        element: <TeamMemberDetails />,
      },
      {
        path: "team/:id",
        element: <TeamMemberDetails />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]
