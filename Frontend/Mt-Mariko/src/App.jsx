import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import MemberDetails from "./pages/MemberDetails";
import UpdateMember from "./pages/UpdateMemmber";
import CreateMember from "./pages/CreateMember";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import EventAttendance from "./pages/EventAttendance";
import EventsPublic from "./pages/EventsPublic";
import ProtectedRoute from "./routes/ProtectedRoutes"; // <-- singular to match your component
import Home from "./pages/Home";
import EventDetailsPublic from "./pages/EventDetailsPublic";
import AdminMessages from "./pages/AdminMessage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/events-public" element={<EventsPublic />} />
        <Route path="/events-public/:id" element={<EventDetailsPublic />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/messages"
          element={
            <ProtectedRoute>
              <AdminMessages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id"
          element={
            <ProtectedRoute>
              <EventDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id/attendance"
          element={
            <ProtectedRoute>
              <EventAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <Members />
            </ProtectedRoute>
          }
        />
        <Route
          path="/members/create"
          element={
            <ProtectedRoute>
              <CreateMember />
            </ProtectedRoute>
          }
        />
        <Route
          path="/members/:id"
          element={
            <ProtectedRoute>
              <MemberDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/members/edit/:id"
          element={
            <ProtectedRoute>
              <UpdateMember />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
