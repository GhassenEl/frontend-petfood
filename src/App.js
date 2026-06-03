import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage.js';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.js';
import ResetPasswordPage from './pages/ResetPasswordPage.js';
import AdminLayout from './layouts/AdminLayout';
import ClientLayout from './layouts/ClientLayout';
import LivreurLayout from './layouts/LivreurLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminReviews from './pages/AdminReviews';
import AdminComplaints from './pages/AdminComplaints';
import AdminProducts from './pages/AdminProducts';
import AdminUsers from './pages/AdminUsers';
import AdminLivreurs from './pages/AdminLivreurs';
import AdminMessages from './pages/AdminMessages';
import AdminInvoices from './pages/AdminInvoices';
import AdminHistory from './pages/AdminHistory';
import AdminVeterinary from './pages/AdminVeterinary';
import AdminProfilePage from './pages/AdminProfilePage';
import AdminLeaveRequestsPage from './pages/AdminLeaveRequestsPage';
import AdminPromotions from './pages/AdminPromotions';
import AdminBlogArticles from './pages/AdminBlogArticles';
import StaffLeavePage from './pages/StaffLeavePage';
import ClientProductsPage from './pages/ClientProductsPage';
import ClientOrdersPage from './pages/ClientOrdersPage';
import ClientReviewsPage from './pages/ClientReviewsPage';
import ClientComplaintsPage from './pages/ClientComplaintsPage';
import ClientProfilePage from './pages/ClientProfilePage';
import ClientInvoicesPage from './pages/ClientInvoicesPage';
import ClientHistoryPage from './pages/ClientHistoryPage';
import ClientPetAdvicePage from './pages/ClientPetAdvicePage';
import ClientServicesPage from './pages/ClientServicesPage';
import ClientAIAgentPage from './pages/ClientAIAgentPage';
import EventsPage from './pages/EventsPage';
import FoundMePage from './pages/FoundMePage';
import NutriProPage from './pages/NutriProPage.js';
import NutriProHistory from './pages/NutriProHistory.js';

import ContactPage from './pages/ContactPage';
import StoreLocatorPage from './pages/StoreLocatorPage';
import VeterinaryPage from './pages/VeterinaryPage';
import PetFeederPage from './pages/PetFeederPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
import LivreurDashboard from './pages/LivreurDashboard';
import LivreurMlPage from './pages/LivreurMlPage';
import LivreurOrdersPage from './pages/LivreurOrdersPage';
import LivreurMapPage from './pages/LivreurMapPage';
import LivreurRoutePage from './pages/LivreurRoutePage';
import LivreurStatsPage from './pages/LivreurStatsPage';
import LivreurMessagesPage from './pages/LivreurMessagesPage';
import LivreurEarningsPage from './pages/LivreurEarningsPage';
import LivreurHistoryPage from './pages/LivreurHistoryPage';
import LivreurProfilePage from './pages/LivreurProfilePage';
import LivreurAvailabilityPage from './pages/LivreurAvailabilityPage';
import VetLayout from './layouts/VetLayout';
import VetDashboard from './pages/VetDashboard';
import VetBiDashboard from './pages/VetBiDashboard';
import VetCalendarPage from './pages/VetCalendarPage';
import VetAppointmentDetailPage from './pages/VetAppointmentDetailPage';
import VetPrescriptionsPage from './pages/VetPrescriptionsPage';
import VetClientsPage from './pages/VetClientsPage';
import VetHistoryPage from './pages/VetHistoryPage';
import VetContactRequestsPage from './pages/VetContactRequestsPage';
import VetProfilePage from './pages/VetProfilePage';
import VetPetDiagnosticsPage from './pages/VetPetDiagnosticsPage';
import VetMedicalDossiersPage from './pages/VetMedicalDossiersPage';
import VetPharmacyPage from './pages/VetPharmacyPage';
import VetMedicalDossierDetailPage from './pages/VetMedicalDossierDetailPage';
import VetClinicPage from './pages/VetClinicPage';
import VetVaccinationsPage from './pages/VetVaccinationsPage';
import ClientMedicalDossierPage from './pages/ClientMedicalDossierPage';
import ClientFavoritesPage from './pages/ClientFavoritesPage';
import ClientLoyaltyPage from './pages/ClientLoyaltyPage';
import ClientPetCaloriesPage from './pages/ClientPetCaloriesPage';

const homeByRole = {
  admin: '/admin/dashboard',
  client: '/client-products',
  livreur: '/livreur/dashboard',
  vet: '/vet/dashboard',
};

const RoleRoute = ({ user, roles, children }) => {
  if (!user) return <LoginPage />;
  if (!roles.includes(user.role)) {
    return <Navigate to={homeByRole[user.role] || '/'} replace />;
  }
  return children;
};

const App = () => {
  const { user, loading } = useAuth();
  const userHome = homeByRole[user?.role] || '/';

  if (loading) {
    return (
      <div className="app-auth-loading" role="status" aria-live="polite">
        <div className="app-auth-loading__mark" aria-hidden>🐾</div>
        <p className="app-auth-loading__text">Chargement de PetfoodTN…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={userHome} replace />} />
      <Route path="/login" element={<Navigate to={userHome} replace />} />
      <Route path="/register" element={<Navigate to={userHome} replace />} />

      <Route path="/admin/dashboard" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminDashboard /></AdminLayout></RoleRoute>} />
      <Route path="/admin/orders" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminOrders /></AdminLayout></RoleRoute>} />
      <Route path="/admin/reviews" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminReviews /></AdminLayout></RoleRoute>} />
      <Route path="/admin/complaints" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminComplaints /></AdminLayout></RoleRoute>} />
      <Route path="/admin/products" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminProducts /></AdminLayout></RoleRoute>} />
      <Route path="/admin/users" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminUsers /></AdminLayout></RoleRoute>} />
      <Route path="/admin/livreurs" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminLivreurs /></AdminLayout></RoleRoute>} />
      <Route path="/admin/messages" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminMessages /></AdminLayout></RoleRoute>} />
      <Route path="/admin/invoices" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminInvoices /></AdminLayout></RoleRoute>} />
      <Route path="/admin/history" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminHistory /></AdminLayout></RoleRoute>} />
      <Route path="/admin/veterinary" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminVeterinary /></AdminLayout></RoleRoute>} />
      <Route path="/admin/events" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><EventsPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/leave-requests" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminLeaveRequestsPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/promotions" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminPromotions /></AdminLayout></RoleRoute>} />
      <Route path="/admin/blog-articles" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminBlogArticles /></AdminLayout></RoleRoute>} />
      <Route path="/admin/profile" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminProfilePage /></AdminLayout></RoleRoute>} />

      <Route path="/client-products" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientProductsPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-favorites" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientFavoritesPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-loyalty" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientLoyaltyPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-orders" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientOrdersPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-reviews" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientReviewsPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-complaints" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientComplaintsPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-profile" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientProfilePage /></ClientLayout></RoleRoute>} />
      <Route path="/client-invoices" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientInvoicesPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-history" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientHistoryPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-events" element={<RoleRoute user={user} roles={['client']}><ClientLayout><EventsPage /></ClientLayout></RoleRoute>} />
      <Route path="/found-me" element={<RoleRoute user={user} roles={['client']}><ClientLayout><FoundMePage /></ClientLayout></RoleRoute>} />
      <Route path="/client-services" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientServicesPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-wallet" element={<Navigate to="/checkout" replace />} />
      <Route path="/client-vaccines" element={<Navigate to="/medical-dossier" replace />} />
      <Route path="/pet-advice" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientPetAdvicePage /></ClientLayout></RoleRoute>} />
      <Route path="/pet-calories" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientPetCaloriesPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-ai" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientAIAgentPage /></ClientLayout></RoleRoute>} />
      <Route
        path="/smart-food-agent"
        element={
          <RoleRoute user={user} roles={['client']}>
            <ClientLayout>
              <NutriProPage />
            </ClientLayout>
          </RoleRoute>
        }
      />
      <Route path="/nutripro-history" element={<RoleRoute user={user} roles={['client']}><ClientLayout><NutriProHistory /></ClientLayout></RoleRoute>} />
      <Route path="/contact" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ContactPage /></ClientLayout></RoleRoute>} />
      <Route path="/store-locator" element={<RoleRoute user={user} roles={['client']}><ClientLayout><StoreLocatorPage /></ClientLayout></RoleRoute>} />
      <Route path="/pet-feeder" element={<RoleRoute user={user} roles={['client']}><ClientLayout><PetFeederPage /></ClientLayout></RoleRoute>} />
      <Route path="/veterinary" element={<RoleRoute user={user} roles={['client']}><ClientLayout><VeterinaryPage /></ClientLayout></RoleRoute>} />
      <Route path="/medical-dossier" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientMedicalDossierPage /></ClientLayout></RoleRoute>} />
      <Route path="/checkout" element={<RoleRoute user={user} roles={['client']}><ClientLayout><Suspense fallback={<div className="app-auth-loading" style={{ minHeight: '40vh' }}><p className="app-auth-loading__text">Chargement du paiement…</p></div>}><CheckoutPage /></Suspense></ClientLayout></RoleRoute>} />
      <Route path="/change-password" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ChangePasswordPage /></ClientLayout></RoleRoute>} />

      <Route path="/livreur/dashboard" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurDashboard /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/orders" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurOrdersPage /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/route" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurRoutePage /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/map" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurMapPage /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/availability" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurAvailabilityPage /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/leave-requests" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><StaffLeavePage roleLabel="Livreur" /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/ml" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurMlPage /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/stats" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurStatsPage /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/messages" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurMessagesPage /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/earnings" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurEarningsPage /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/history" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurHistoryPage /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/profile" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurProfilePage /></LivreurLayout></RoleRoute>} />

      <Route path="/vet/dashboard" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetDashboard /></VetLayout></RoleRoute>} />
      <Route path="/vet/bi" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetBiDashboard /></VetLayout></RoleRoute>} />
      <Route path="/vet/calendar" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetCalendarPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/appointments/:id" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetAppointmentDetailPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/prescriptions" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetPrescriptionsPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/pharmacy" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetPharmacyPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/diagnostics" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetPetDiagnosticsPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/clinic" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetClinicPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/vaccinations" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetVaccinationsPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/medical-dossiers" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetMedicalDossiersPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/medical-dossiers/:id" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetMedicalDossierDetailPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/clients" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetClientsPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/history" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetHistoryPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/contact-requests" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetContactRequestsPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/profile" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetProfilePage /></VetLayout></RoleRoute>} />
      <Route path="/vet/leave-requests" element={<RoleRoute user={user} roles={['vet']}><VetLayout><StaffLeavePage roleLabel="Vétérinaire" /></VetLayout></RoleRoute>} />

      <Route path="*" element={<Navigate to={userHome} replace />} />
    </Routes>
  );
};

export default App;