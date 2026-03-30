import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup"; 
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import CreateMember from "./pages/CreateMember";
import MemberDetails from "./pages/MemberDetails";
import UpdateMember from "./pages/UpdateMember";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import EventAttendance from "./pages/EventAttendance";
import EventsPublic from "./pages/EventsPublic";
import EventDetailsPublic from "./pages/EventDetailsPublic";
import AdminMessages from "./pages/AdminMessages";
import Reports from "./pages/Reports";
import ReportDetails from "./pages/ReportDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import FamilyView from "./components/FamilyView";
import FamiliesList from "./components/FamiliesList";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - Everyone can access */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/events-public" element={<EventsPublic />} />
        <Route path="/events-public/:id" element={<EventDetailsPublic />} />
        
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
      </Routes>
    </Router>
  );
}