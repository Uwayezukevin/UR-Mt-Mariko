// App.js or your main routes file
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Register";
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

// Optional: If you want a separate reports page
import Reports from "./pages/Reports";
import ReportDetails from "./pages/ReportDetails";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/events-public" element={<EventsPublic />} />
        <Route path="/events-public/:id" element={<EventDetailsPublic />} />

        {/* Protected Routes - Add your auth wrapper */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Member Routes */}
        <Route path="/members" element={<Members />} />
        <Route path="/members/create" element={<CreateMember />} />
        <Route path="/members/:id" element={<MemberDetails />} />
        <Route path="/members/edit/:id" element={<UpdateMember />} />
        
        {/* Event Routes */}
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/events/:id/attendance" element={<EventAttendance />} />
        
        {/* Report Routes - Optional if you want separate pages */}
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/:id" element={<ReportDetails />} />
        
        {/* Admin Routes */}
        <Route path="/admin/messages" element={<AdminMessages />} />
      </Routes>
    </Router>
  );
}