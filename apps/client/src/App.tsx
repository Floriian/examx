import { AdminPage, AuthPage, CourseDetails, CoursePage, Homepage } from "@/features"
import { ProtectedRoutes } from "@/features/auth/components/ProtectedRoutes";
import { Route, Routes } from "react-router-dom"
import { injectStore } from "@/utils";
import { store } from "./app/store/store";

import "@/styles/main.css"

function App() {
  injectStore(store)
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<Homepage />} />
        <Route path="/courses">
          <Route index element={<CoursePage />} />
          <Route path=":id" element={<CourseDetails />} />
        </Route>

        <Route path="/admin">
          <Route index element={<AdminPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
