
import { RouteObject } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Auth from "@/pages/Auth";
import Team from "@/pages/Team";
import TeamDetails from "@/pages/TeamDetails";
import TeamMemberDetails from "@/pages/TeamMemberDetails";
import Projects from "@/pages/Projects";
import ProjectDetails from "@/pages/ProjectDetails";
import Calendar from "@/pages/Calendar";
import Teams from "@/pages/Teams";
import Profile from "@/pages/Profile";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: "team",
        element: <Team />,
      },
      {
        path: "team/:id",
        element: <TeamDetails />,
      },
      {
        path: "team/member/:id",
        element: <TeamMemberDetails />,
      },
      {
        path: "teams",
        element: <Teams />,
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
        path: "calendar",
        element: <Calendar />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  {
    path: "/auth",
    element: <Auth />,
  },
];
