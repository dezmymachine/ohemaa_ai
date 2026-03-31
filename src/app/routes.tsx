import { createBrowserRouter } from "react-router"
import { RootLayout } from "./components/root-layout"
import { OnboardingScreen } from "./screens/onboarding"
import { HomeScreen } from "./screens/home"
import { ScanScreen } from "./screens/scan"
import { TrackScreen } from "./screens/track"
import { NutritionScreen } from "./screens/nutrition"
import { ChatScreen } from "./screens/chat"
import { RiskReportScreen } from "./screens/risk-report"
import { CommunityScreen } from "./screens/community"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <OnboardingScreen />,
  },
  {
    path: "/app",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: "scan", element: <ScanScreen /> },
      { path: "track", element: <TrackScreen /> },
      { path: "nutrition", element: <NutritionScreen /> },
      { path: "chat", element: <ChatScreen /> },
      { path: "risk-report", element: <RiskReportScreen /> },
      { path: "community", element: <CommunityScreen /> },
    ],
  },
])