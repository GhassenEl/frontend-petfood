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
import AdminStockPage from './pages/AdminStockPage';
import AdminSalesPage from './pages/AdminSalesPage';
import AdminPowerBiPage from './pages/AdminPowerBiPage';
import AdminNlpModelsPage from './pages/AdminNlpModelsPage';
import AdminVendorsPage from './pages/AdminVendorsPage';
import AdminVendorDetailPage from './pages/AdminVendorDetailPage';
import AdminSystemConfigPage from './pages/AdminSystemConfigPage';
import AdminModeratorsPage from './pages/AdminModeratorsPage';
import AdminVisitorsPage from './pages/AdminVisitorsPage';
import AdminRefundsPage from './pages/AdminRefundsPage';
import AdminActivityLogsPage from './pages/AdminActivityLogsPage';
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
import ClientTraceabilityPage from './pages/ClientTraceabilityPage';
import ClientSmartWaterPage from './pages/ClientSmartWaterPage';
import ClientIoTHubPage from './pages/ClientIoTHubPage';
import ClientSmartDeliveryPage from './pages/ClientSmartDeliveryPage';
import EventsPage from './pages/EventsPage';
import FoundMePage from './pages/FoundMePage';
import ContactPage from './pages/ContactPage';
import StoreLocatorPage from './pages/StoreLocatorPage';
import VeterinaryPage from './pages/VeterinaryPage';
import PetFeederPage from './pages/PetFeederPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
import LivreurDashboard from './pages/LivreurDashboard';
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
import VetMedicationRecommendPage from './pages/VetMedicationRecommendPage';
import VetClientsPage from './pages/VetClientsPage';
import VetClientDetailPage from './pages/VetClientDetailPage';
import VetHistoryPage from './pages/VetHistoryPage';
import VetContactRequestsPage from './pages/VetContactRequestsPage';
import VetProfilePage from './pages/VetProfilePage';
import VetPetDiagnosticsPage from './pages/VetPetDiagnosticsPage';
import VetMedicalDossiersPage from './pages/VetMedicalDossiersPage';
import VetPharmacyPage from './pages/VetPharmacyPage';
import VetMedicalDossierDetailPage from './pages/VetMedicalDossierDetailPage';
import VetClinicPage from './pages/VetClinicPage';
import VetVaccinationsPage from './pages/VetVaccinationsPage';
import VetAvailabilityPage from './pages/VetAvailabilityPage';
import ClientMedicalDossierPage from './pages/ClientMedicalDossierPage';
import ClientFavoritesPage from './pages/ClientFavoritesPage';
import ClientLoyaltyPage from './pages/ClientLoyaltyPage';
import ClientPetCaloriesPage from './pages/ClientPetCaloriesPage';
import ClientPetsPage from './pages/ClientPetsPage';
import ClientPetPassportPage from './pages/ClientPetPassportPage';
import PlatformServicesPage from './pages/PlatformServicesPage';
import MarketingLandingPage from './pages/MarketingLandingPage';
import VisitorHubPage from './pages/VisitorHubPage';
import VisitorProductsPage from './pages/VisitorProductsPage';
import VisitorInfoPage from './pages/VisitorInfoPage';
import VisitorToolsPage from './pages/VisitorToolsPage';
import VendorHubPage from './pages/VendorHubPage';
import ModeratorHubPage from './pages/ModeratorHubPage';
import VendorLayout from './layouts/VendorLayout';
import VendorDashboardPage from './pages/VendorDashboardPage';
import VendorProductsPage from './pages/VendorProductsPage';
import VendorOrdersPage from './pages/VendorOrdersPage';
import VendorReturnsPage from './pages/VendorReturnsPage';
import VendorCommunicationPage from './pages/VendorCommunicationPage';
import ModeratorLayout from './layouts/ModeratorLayout';
import ModeratorDashboard from './pages/ModeratorDashboard';
import ModeratorContentPage from './pages/ModeratorContentPage';
import ModeratorReportsPage from './pages/ModeratorReportsPage';
import ModeratorRefundsPage from './pages/ModeratorRefundsPage';
import ModeratorAnalyticsPage from './pages/ModeratorAnalyticsPage';

const homeByRole = {
  admin: '/admin/dashboard',
  client: '/client-products',
  livreur: '/livreur/dashboard',
  vet: '/vet/dashboard',
  vendor: '/vendor/dashboard',
  moderator: '/moderator/dashboard',
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
        <Route path="/" element={<MarketingLandingPage />} />
        <Route path="/marketing" element={<MarketingLandingPage />} />
        <Route path="/services" element={<MarketingLandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/visitor" element={<VisitorHubPage />} />
        <Route path="/visitor/products" element={<VisitorProductsPage />} />
        <Route path="/visitor/info" element={<VisitorInfoPage />} />
        <Route path="/visitor/tools" element={<VisitorToolsPage />} />
        <Route path="/vendor" element={<VendorHubPage />} />
        <Route path="/moderator" element={<ModeratorHubPage />} />
        <Route path="*" element={<MarketingLandingPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={userHome} replace />} />
      <Route path="/login" element={<Navigate to={userHome} replace />} />
      <Route path="/register" element={<Navigate to={userHome} replace />} />

      <Route path="/admin/dashboard" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminDashboard /></AdminLayout></RoleRoute>} />
      <Route path="/admin/powerbi" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminPowerBiPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/nlp-models" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminNlpModelsPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/orders" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminOrders /></AdminLayout></RoleRoute>} />
      <Route path="/admin/reviews" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminReviews /></AdminLayout></RoleRoute>} />
      <Route path="/admin/complaints" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminComplaints /></AdminLayout></RoleRoute>} />
      <Route path="/admin/products" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminProducts /></AdminLayout></RoleRoute>} />
      <Route path="/admin/stock" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminStockPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/sales" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminSalesPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/users" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminUsers /></AdminLayout></RoleRoute>} />
      <Route path="/admin/livreurs" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminLivreurs /></AdminLayout></RoleRoute>} />
      <Route path="/admin/vendors" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminVendorsPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/vendors/:id" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminVendorDetailPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/visitors" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminVisitorsPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/refunds" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminRefundsPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/system" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminSystemConfigPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/moderators" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminModeratorsPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/activity-logs" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminActivityLogsPage /></AdminLayout></RoleRoute>} />
      <Route path="/vendor-dashboard" element={<RoleRoute user={user} roles={['admin']}><Navigate to="/admin/vendors" replace /></RoleRoute>} />
      <Route path="/admin/messages" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminMessages /></AdminLayout></RoleRoute>} />
      <Route path="/admin/invoices" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminInvoices /></AdminLayout></RoleRoute>} />
      <Route path="/admin/history" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminHistory /></AdminLayout></RoleRoute>} />
      <Route path="/admin/veterinary" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminVeterinary /></AdminLayout></RoleRoute>} />
      <Route path="/admin/events" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><EventsPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/leave-requests" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminLeaveRequestsPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/promotions" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminPromotions /></AdminLayout></RoleRoute>} />
      <Route path="/admin/blog-articles" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/crm" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/rehabilitation" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/ml-agent" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/incidents-ml" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/stock-bi" element={<Navigate to="/admin/powerbi" replace />} />
      <Route path="/admin/profile" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminProfilePage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/platform-services" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><PlatformServicesPage /></AdminLayout></RoleRoute>} />

      <Route path="/client-products" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientProductsPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-favorites" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientFavoritesPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-loyalty" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientLoyaltyPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-orders" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientOrdersPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-reviews" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientReviewsPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-complaints" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientComplaintsPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-profile" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientProfilePage /></ClientLayout></RoleRoute>} />
      <Route path="/client-pets" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientPetsPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-pet-passport" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientPetPassportPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-pet-passport/:petId" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientPetPassportPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-invoices" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientInvoicesPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-history" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientHistoryPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-events" element={<RoleRoute user={user} roles={['client']}><ClientLayout><EventsPage /></ClientLayout></RoleRoute>} />
      <Route path="/found-me" element={<RoleRoute user={user} roles={['client']}><ClientLayout><FoundMePage /></ClientLayout></RoleRoute>} />
      <Route path="/client-services" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientServicesPage /></ClientLayout></RoleRoute>} />
      <Route path="/platform-services" element={<RoleRoute user={user} roles={['client']}><ClientLayout><PlatformServicesPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-wallet" element={<Navigate to="/checkout" replace />} />
      <Route path="/client-vaccines" element={<Navigate to="/medical-dossier" replace />} />
      <Route path="/pet-advice" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientPetAdvicePage /></ClientLayout></RoleRoute>} />
      <Route path="/pet-calories" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientPetCaloriesPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-ecosystem" element={<Navigate to="/client-products" replace />} />
      <Route path="/client-wellness" element={<Navigate to="/pet-calories" replace />} />
      <Route path="/client-emotions" element={<Navigate to="/client-reviews?tab=services" replace />} />
      <Route path="/client-ai" element={<Navigate to="/client-products" replace />} />
      <Route path="/client-ml-agent" element={<Navigate to="/client-products" replace />} />
      <Route path="/smart-food-agent" element={<Navigate to="/pet-calories" replace />} />
      <Route path="/nutripro-history" element={<Navigate to="/pet-calories" replace />} />
      <Route path="/client-rehabilitation" element={<Navigate to="/client-services" replace />} />
      <Route path="/client-relay-points" element={<Navigate to="/veterinary" replace />} />
      <Route path="/client-product-packs" element={<Navigate to="/client-products" replace />} />
      <Route path="/client-traceability" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientTraceabilityPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-iot" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientIoTHubPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-smart-water" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientSmartWaterPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-smart-delivery" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientSmartDeliveryPage /></ClientLayout></RoleRoute>} />
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
      <Route path="/livreur/leave-requests" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><StaffLeavePage roleLabel="Livreur" demoFallback /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/ml" element={<Navigate to="/livreur/stats" replace />} />
      <Route path="/livreur/stats" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurStatsPage /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/messages" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurMessagesPage /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/earnings" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurEarningsPage /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/history" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurHistoryPage /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/platform-services" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><PlatformServicesPage /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/profile" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurProfilePage /></LivreurLayout></RoleRoute>} />

      <Route path="/vet/dashboard" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetDashboard /></VetLayout></RoleRoute>} />
      <Route path="/vet/bi" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetBiDashboard /></VetLayout></RoleRoute>} />
      <Route path="/vet/calendar" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetCalendarPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/availability" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetAvailabilityPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/appointments/:id" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetAppointmentDetailPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/prescriptions" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetPrescriptionsPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/medication-recommendations" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetMedicationRecommendPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/pharmacy" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetPharmacyPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/diagnostics" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetPetDiagnosticsPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/clinic" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetClinicPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/vaccinations" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetVaccinationsPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/medical-dossiers" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetMedicalDossiersPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/medical-dossiers/:id" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetMedicalDossierDetailPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/clients" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetClientsPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/clients/:id" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetClientDetailPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/history" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetHistoryPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/contact-requests" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetContactRequestsPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/profile" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetProfilePage /></VetLayout></RoleRoute>} />
      <Route path="/vet/leave-requests" element={<RoleRoute user={user} roles={['vet']}><VetLayout><StaffLeavePage roleLabel="Vétérinaire" demoFallback /></VetLayout></RoleRoute>} />
      <Route path="/vet/platform-services" element={<RoleRoute user={user} roles={['vet']}><VetLayout><PlatformServicesPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/ml-agent" element={<Navigate to="/vet/dashboard" replace />} />
      <Route path="/vet/rehabilitation" element={<Navigate to="/vet/dashboard" replace />} />

      <Route path="/visitor" element={<VisitorHubPage />} />
      <Route path="/visitor/products" element={<VisitorProductsPage />} />
      <Route path="/visitor/info" element={<VisitorInfoPage />} />
      <Route path="/visitor/tools" element={<VisitorToolsPage />} />
      <Route path="/vendor" element={<VendorHubPage />} />
      <Route path="/moderator" element={<ModeratorHubPage />} />

      <Route path="/vendor/dashboard" element={<RoleRoute user={user} roles={['vendor', 'admin']}><VendorLayout><VendorDashboardPage /></VendorLayout></RoleRoute>} />
      <Route path="/vendor/products" element={<RoleRoute user={user} roles={['vendor', 'admin']}><VendorLayout><VendorProductsPage /></VendorLayout></RoleRoute>} />
      <Route path="/vendor/orders" element={<RoleRoute user={user} roles={['vendor', 'admin']}><VendorLayout><VendorOrdersPage /></VendorLayout></RoleRoute>} />
      <Route path="/vendor/returns" element={<RoleRoute user={user} roles={['vendor', 'admin']}><VendorLayout><VendorReturnsPage /></VendorLayout></RoleRoute>} />
      <Route path="/vendor/communication" element={<RoleRoute user={user} roles={['vendor', 'admin']}><VendorLayout><VendorCommunicationPage /></VendorLayout></RoleRoute>} />
      <Route path="/vendor/platform-services" element={<RoleRoute user={user} roles={['vendor', 'admin']}><VendorLayout><PlatformServicesPage /></VendorLayout></RoleRoute>} />
      <Route path="/vendor/profile" element={<RoleRoute user={user} roles={['vendor', 'admin']}><VendorLayout><AdminProfilePage /></VendorLayout></RoleRoute>} />

      <Route path="/moderator/dashboard" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><ModeratorDashboard /></ModeratorLayout></RoleRoute>} />
      <Route path="/moderator/users" element={<Navigate to="/moderator/dashboard" replace />} />
      <Route path="/moderator/vendors" element={<Navigate to="/moderator/dashboard" replace />} />
      <Route path="/moderator/content" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><ModeratorContentPage /></ModeratorLayout></RoleRoute>} />
      <Route path="/moderator/reports" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><ModeratorReportsPage /></ModeratorLayout></RoleRoute>} />
      <Route path="/moderator/refunds" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><ModeratorRefundsPage /></ModeratorLayout></RoleRoute>} />
      <Route path="/moderator/analytics" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><ModeratorAnalyticsPage /></ModeratorLayout></RoleRoute>} />
      <Route path="/moderator/reviews" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><AdminReviews /></ModeratorLayout></RoleRoute>} />
      <Route path="/moderator/complaints" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><AdminComplaints /></ModeratorLayout></RoleRoute>} />
      <Route path="/moderator/events" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><EventsPage /></ModeratorLayout></RoleRoute>} />
      <Route path="/moderator/messages" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><AdminMessages /></ModeratorLayout></RoleRoute>} />
      <Route path="/moderator/platform-services" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><PlatformServicesPage /></ModeratorLayout></RoleRoute>} />
      <Route path="/moderator/profile" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><AdminProfilePage /></ModeratorLayout></RoleRoute>} />

      <Route path="*" element={<Navigate to={userHome} replace />} />
    </Routes>
  );
};

export default App;