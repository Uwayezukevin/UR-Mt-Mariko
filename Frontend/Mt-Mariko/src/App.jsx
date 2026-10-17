import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages are lazy-loaded so the initial bundle stays small and the first
// paint is fast. Each route only downloads its own chunk when visited.
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const EventsPublic = lazy(() => import("./pages/EventsPublic"));
const EventDetailsPublic = lazy(() => import("./pages/EventDetailsPublic"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Members = lazy(() => import("./pages/Members"));
const CreateMember = lazy(() => import("./pages/CreateMember"));
const MemberDetails = lazy(() => import("./pages/MemberDetails"));
const UpdateMember = lazy(() => import("./pages/UpdateMember"));
const Events = lazy(() => import("./pages/Events"));
const EventDetails = lazy(() => import("./pages/EventDetails"));
const EventAttendance = lazy(() => import("./pages/EventAttendance"));
const AdminMessages = lazy(() => import("./pages/AdminMessages"));
const Reports = lazy(() => import("./pages/Reports"));
const ReportDetails = lazy(() => import("./pages/ReportDetails"));
const FamilyView = lazy(() => import("./components/FamilyView"));
const FamiliesList = lazy(() => import("./components/FamiliesList"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm">Turimo gutegura...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes - Everyone can access */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/events-public" element={<EventsPublic />} />
          <Route path="/events-public/:id" element={<EventDetailsPublic />} />
          {/* Backwards-compatible alias for older links */}
          <Route path="/events/public/:id" element={<EventDetailsPublic />} />

          {/* Protected Routes - Require authentication */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute><Members /></ProtectedRoute>} />
          <Route path="/members/create" element={<ProtectedRoute><CreateMember /></ProtectedRoute>} />
          <Route path="/members/:id" element={<ProtectedRoute><MemberDetails /></ProtectedRoute>} />
          <Route path="/members/edit/:id" element={<ProtectedRoute><UpdateMember /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
          <Route path="/events/:id/attendance" element={<ProtectedRoute><EventAttendance /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/reports/:id" element={<ProtectedRoute><ReportDetails /></ProtectedRoute>} />
          <Route path="/admin/messages" element={<ProtectedRoute><AdminMessages /></ProtectedRoute>} />
          <Route path="/members/:id/family" element={<ProtectedRoute><FamilyView /></ProtectedRoute>} />
          <Route path="/families" element={<ProtectedRoute><FamiliesList /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
