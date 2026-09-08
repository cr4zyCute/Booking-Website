import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { PublicLayout } from "@/layouts/PublicLayout"
import { AdminLayout } from "@/layouts/AdminLayout"
import { DoctorLayout } from "@/layouts/DoctorLayout"
import { CustomerLayout } from "@/layouts/CustomerLayout"

import { HomePage } from "@/pages/HomePage"
import { AboutPage } from "@/pages/AboutPage"
import { BookingPage } from "@/pages/BookingPage"
import { TreatmentsPage } from "@/pages/TreatmentsPage"
import { TreatmentDetailPage } from "@/pages/TreatmentDetailPage"
import { DentistsPage } from "@/pages/DentistsPage"
import { DentistDetailPage } from "@/pages/DentistDetailPage"
import { LoginPage } from "@/pages/LoginPage"
import { RegisterPage } from "@/pages/RegisterPage"

// Admin Pages
import { DashboardPage } from "@/pages/admin/DashboardPage"
import { AppointmentsPage } from "@/pages/admin/AppointmentsPage"
import { CalendarPage } from "@/pages/admin/CalendarPage"
import { CustomersPage } from "@/pages/admin/CustomersPage"
import { ServicesAdminPage } from "@/pages/admin/ServicesAdminPage"
import { StaffAdminPage } from "@/pages/admin/StaffAdminPage"
import { SchedulesPage } from "@/pages/admin/SchedulesPage"
import { AppearancePage } from "@/pages/admin/AppearancePage"
import { WebsitePage } from "@/pages/admin/WebsitePage"
import { SettingsPage } from "@/pages/admin/SettingsPage"
import { LocationAdminPage } from "@/pages/admin/LocationAdminPage"
import { ReviewsAdminPage } from "@/pages/admin/ReviewsAdminPage"

// Doctor Pages
import { DoctorDashboardPage } from "@/pages/doctor/DoctorDashboardPage"
import { DoctorAppointmentsPage } from "@/pages/doctor/DoctorAppointmentsPage"
import { DoctorAppointmentDetailPage } from "@/pages/doctor/DoctorAppointmentDetailPage"
import { DoctorSchedulePage } from "@/pages/doctor/DoctorSchedulePage"
import { DoctorNotificationsPage } from "@/pages/doctor/DoctorNotificationsPage"
import { DoctorProfilePage } from "@/pages/doctor/DoctorProfilePage"

// Customer Pages
import { CustomerPortalPage } from "@/pages/customer/CustomerPortalPage"

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/treatments" element={<TreatmentsPage />} />
        <Route path="/treatments/:slug" element={<TreatmentDetailPage />} />
        <Route path="/dentists" element={<DentistsPage />} />
        <Route path="/dentists/:slug" element={<DentistDetailPage />} />
        {/* Aliases & Fallbacks */}
        <Route path="/services" element={<Navigate to="/treatments" replace />} />
        <Route path="/services/:slug" element={<TreatmentDetailPage />} />
        <Route path="/staff" element={<Navigate to="/dentists" replace />} />
        <Route path="/staff/:slug" element={<DentistDetailPage />} />
        <Route path="/doctors" element={<Navigate to="/dentists" replace />} />
        <Route path="/doctors/:slug" element={<DentistDetailPage />} />
        <Route path="/contact" element={<Navigate to="/#contact" replace />} />
      </Route>

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Doctor Portal */}
      <Route path="/doctor" element={<DoctorLayout />}>
        <Route index element={<DoctorDashboardPage />} />
        <Route path="appointments" element={<DoctorAppointmentsPage />} />
        <Route path="appointments/:id" element={<DoctorAppointmentDetailPage />} />
        <Route path="schedule" element={<DoctorSchedulePage />} />
        <Route path="notifications" element={<DoctorNotificationsPage />} />
        <Route path="profile" element={<DoctorProfilePage />} />
      </Route>

      {/* Customer Portal */}
      <Route path="/portal" element={<CustomerLayout />}>
        <Route index element={<CustomerPortalPage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="services" element={<ServicesAdminPage />} />
        <Route path="staff" element={<StaffAdminPage />} />
        <Route path="schedules" element={<SchedulesPage />} />
        <Route path="appearance" element={<AppearancePage />} />
        <Route path="website" element={<WebsitePage />} />
        <Route path="website/homepage" element={<WebsitePage />} />
        <Route path="website/testimonials" element={<WebsitePage />} />
        <Route path="website/faq" element={<WebsitePage />} />
        <Route path="reviews" element={<ReviewsAdminPage />} />
        <Route path="location" element={<LocationAdminPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
export default AppRoutes
