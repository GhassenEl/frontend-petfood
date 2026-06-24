import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import CookieConsentBanner from './components/CookieConsentBanner';
import SessionExpiryBanner from './components/SessionExpiryBanner';
import LiveDataBanner from './components/LiveDataBanner';
import GlobalPlatformChat from './components/GlobalPlatformChat';
import LoginPage from './pages/LoginPage.js';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.js';
import ResetPasswordPage from './pages/ResetPasswordPage.js';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.js';
import CookiesPolicyPage from './pages/CookiesPolicyPage.js';
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
import AdminSecurityPage from './pages/AdminSecurityPage';
import AdminIntelligentSecurityPage from './pages/AdminIntelligentSecurityPage';
import AdminDatabaseSecurityPage from './pages/AdminDatabaseSecurityPage';
import AccountSecurityPage from './pages/AccountSecurityPage';
import PlatformSecurityFrameworkPage from './pages/PlatformSecurityFrameworkPage';
import AdminSecurityAuditPage from './pages/AdminSecurityAuditPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import AdminModeratorsPage from './pages/AdminModeratorsPage';
import AdminLiveAudiencePage from './pages/AdminLiveAudiencePage';
import AdminRefundsPage from './pages/AdminRefundsPage';
import AdminActivityLogsPage from './pages/AdminActivityLogsPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminFoodQualityCamPage from './pages/AdminFoodQualityCamPage';
import AdminDeliveryOpsPage from './pages/AdminDeliveryOpsPage';
import AdminBackupsPage from './pages/AdminBackupsPage';
import AdminIoTAnomaliesPage from './pages/AdminIoTAnomaliesPage';
import AdminVetValidationPage from './pages/AdminVetValidationPage';
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
import ClientSmartHubPage from './pages/ClientSmartHubPage';
import ClientIoTHubPage from './pages/ClientIoTHubPage';
import ClientSmartDeliveryPage from './pages/ClientSmartDeliveryPage';
import EventsPage from './pages/EventsPage';
import FoundMePage from './pages/FoundMePage';
import ClientPurchaseNeedsPage from './pages/ClientPurchaseNeedsPage';
import ContactPage from './pages/ContactPage';
import StoreLocatorPage from './pages/StoreLocatorPage';
import VeterinaryPage from './pages/VeterinaryPage';
import PetFeederPage from './pages/PetFeederPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const PlatformCompliancePage = lazy(() => import('./pages/PlatformCompliancePage'));
const EnterpriseFeaturesPage = lazy(() => import('./pages/EnterpriseFeaturesPage'));
const IntelligencePlatformPage = lazy(() => import('./pages/IntelligencePlatformPage'));
const MobileAppPage = lazy(() => import('./pages/MobileAppPage'));
const CloudInfrastructurePage = lazy(() => import('./pages/CloudInfrastructurePage'));
const BigDataPlatformPage = lazy(() => import('./pages/BigDataPlatformPage'));
const DevOpsPlatformPage = lazy(() => import('./pages/DevOpsPlatformPage'));
const PremiumFeaturesPage = lazy(() => import('./pages/PremiumFeaturesPage'));
const AdminAdvancedHubPage = lazy(() => import('./pages/AdminAdvancedHubPage'));
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
import ClientTeleconsultPage from './pages/ClientTeleconsultPage';
import ClientFavoritesPage from './pages/ClientFavoritesPage';
import ClientLoyaltyPage from './pages/ClientLoyaltyPage';
import ClientPetCaloriesPage from './pages/ClientPetCaloriesPage';
import ClientAdaptiveNutritionPage from './pages/ClientAdaptiveNutritionPage';
import ClientExplainableAiPage from './pages/ClientExplainableAiPage';
import ClientCommunityPage from './pages/ClientCommunityPage';
import ClientGeoServicesPage from './pages/ClientGeoServicesPage';
import ClientDigitalTwinPage from './pages/ClientDigitalTwinPage';
import ClientVetIntelligencePage from './pages/ClientVetIntelligencePage';
import ClientPetHealthRecommendationPage from './pages/ClientPetHealthRecommendationPage';
import VendorTraceabilityPage from './pages/VendorTraceabilityPage';
import VendorFeederIoTPage from './pages/VendorFeederIoTPage';
import ClientPetsPage from './pages/ClientPetsPage';
import ClientPetPassportPage from './pages/ClientPetPassportPage';
import PlatformServicesPage from './pages/PlatformServicesPage';
import MarketingLandingPage from './pages/MarketingLandingPage';
import PublicLayout from './layouts/PublicLayout';
import VendorHubPage from './pages/VendorHubPage';
import ModeratorHubPage from './pages/ModeratorHubPage';
import VendorLayout from './layouts/VendorLayout';
import VendorDashboardPage from './pages/VendorDashboardPage';
import VendorProductsPage from './pages/VendorProductsPage';
import VendorOrdersPage from './pages/VendorOrdersPage';
import VendorReturnsPage from './pages/VendorReturnsPage';
import VendorCommunicationPage from './pages/VendorCommunicationPage';
import VendorMarketingPage from './pages/VendorMarketingPage';
import VendorPurchaseNeedsPage from './pages/VendorPurchaseNeedsPage';
import ModeratorLayout from './layouts/ModeratorLayout';
import ModeratorDashboard from './pages/ModeratorDashboard';
import ModeratorContentPage from './pages/ModeratorContentPage';
import ModeratorReportsPage from './pages/ModeratorReportsPage';
import ModeratorRefundsPage from './pages/ModeratorRefundsPage';
import ModeratorAnalyticsPage from './pages/ModeratorAnalyticsPage';
import ModeratorUsersPage from './pages/ModeratorUsersPage';
import ModeratorVendorsPage from './pages/ModeratorVendorsPage';
import ModeratorFraudCenterPage from './pages/ModeratorFraudCenterPage';
import ModeratorMessagesPage from './pages/ModeratorMessagesPage';
import ModeratorIntelligenceHubPage from './pages/ModeratorIntelligenceHubPage';
import VendorProfilePage from './pages/VendorProfilePage';
import ModeratorProfilePage from './pages/ModeratorProfilePage';
import ServiceClientProfilePage from './pages/ServiceClientProfilePage';
import ServiceClientLayout from './layouts/ServiceClientLayout';
import RseEcologyHubPage from './pages/RseEcologyHubPage';
import VendorMlPage from './pages/VendorMlPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminVetsPage from './pages/AdminVetsPage';
import AdminRegionalContactsPage from './pages/AdminRegionalContactsPage';
import ClientReturnsPage from './pages/ClientReturnsPage';
import ClientFamilyPage from './pages/ClientFamilyPage';
import ClientSubscriptionsPage from './pages/ClientSubscriptionsPage';
import ClientSmartCommercePage from './pages/ClientSmartCommercePage';
import AdminDigitalMarketingPage from './pages/AdminDigitalMarketingPage';
import AdminMlAgentPage from './pages/AdminMlAgentPage';
import AdminIncidentsMlPage from './pages/AdminIncidentsMlPage';
import AdminBlogArticles from './pages/AdminBlogArticles';
import AdminRehabilitationPage from './pages/AdminRehabilitationPage';
import AdminStockBiPage from './pages/AdminStockBiPage';
import FoodQualitySurveillancePage from './pages/FoodQualitySurveillancePage';
import DeliveryColdChainSurveillancePage from './pages/DeliveryColdChainSurveillancePage';
import AdminPlatformPerformancePage from './pages/AdminPlatformPerformancePage';
import AdminPartnersHubPage from './pages/AdminPartnersHubPage';
import AdminAdvancedAiPage from './pages/AdminAdvancedAiPage';
import AdminAnalyticsDecisionPage from './pages/AdminAnalyticsDecisionPage';
import AdminBusinessIntelligencePage from './pages/AdminBusinessIntelligencePage';
import AdminMerchantIntelligencePage from './pages/AdminMerchantIntelligencePage';
import AdminPriceGovernancePage from './pages/AdminPriceGovernancePage';
import AdminCitiesHubPage from './pages/AdminCitiesHubPage';
import PlatformCitiesPage from './pages/PlatformCitiesPage';
import ClientEcosystemHubPage from './pages/ClientEcosystemHubPage';
import ClientAdvancedAiPage from './pages/ClientAdvancedAiPage';
import ClientIntelligenceAutomationPage from './pages/ClientIntelligenceAutomationPage';
import RecommendationHubPage from './pages/RecommendationHubPage';
import ClientAIAgentPage from './pages/ClientAIAgentPage';
import ClientMlAgentPage from './pages/ClientMlAgentPage';
import ClientWellnessPage from './pages/ClientWellnessPage';
import SmartFoodAgentPage from './pages/SmartFoodAgentPage';
import NutriProHistory from './pages/NutriProHistory';
import ClientRehabilitationPage from './pages/ClientRehabilitationPage';
import ClientRelayPointsPage from './pages/ClientRelayPointsPage';
import ClientOwnerEmotionsPage from './pages/ClientOwnerEmotionsPage';
import LivreurMlPage from './pages/LivreurMlPage';
import LivreurIntelligenceHubPage from './pages/LivreurIntelligenceHubPage';
import VetMlAgentPage from './pages/VetMlAgentPage';
import VetIntelligenceHubPage from './pages/VetIntelligenceHubPage';
import SafeFallbackRedirect from './routes/SafeFallbackRedirect';
import VendorSalesPage from './pages/VendorSalesPage';
import VetTeleconsultPage from './pages/VetTeleconsultPage';
import VetNutritionAdvicePage from './pages/VetNutritionAdvicePage';

import RoleBiDashboardPage from './pages/RoleBiDashboardPage';
import AuthMobileRoute from './components/AuthMobileRoute';
import CapabilitiesRoute from './components/CapabilitiesRoute';
import PageLoader from './routes/PageLoader';
import RoleRoute from './routes/RoleRoute';
import RoleLayoutShell from './routes/RoleLayoutShell';
import { getRoleHome } from './config/roleConfig';

const App = () => {
  const { user, loading } = useAuth();
  const userHome = getRoleHome(user?.role);

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
      <>
      <CookieConsentBanner />
      <SessionExpiryBanner />
      <LiveDataBanner />
      <GlobalPlatformChat />
      <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<MarketingLandingPage />} />
        <Route path="/marketing" element={<MarketingLandingPage />} />
        <Route path="/services" element={<MarketingLandingPage />} />
        <Route path="/register" element={<AuthMobileRoute title="Inscription"><RegisterPage /></AuthMobileRoute>} />
        <Route path="/forgot-password" element={<AuthMobileRoute title="Mot de passe"><ForgotPasswordPage /></AuthMobileRoute>} />
        <Route path="/verify-email" element={<AuthMobileRoute title="Vérification email"><VerifyEmailPage /></AuthMobileRoute>} />
        <Route path="/reset-password" element={<AuthMobileRoute title="Réinitialiser"><ResetPasswordPage /></AuthMobileRoute>} />
        <Route path="/politique-confidentialite" element={<PrivacyPolicyPage />} />
        <Route path="/privacy" element={<Navigate to="/politique-confidentialite" replace />} />
        <Route path="/cookies" element={<CookiesPolicyPage />} />
        <Route path="/login" element={<AuthMobileRoute title="Connexion"><LoginPage /></AuthMobileRoute>} />
        <Route path="/visitor/*" element={<Navigate to="/" replace />} />
        <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
        <Route path="/vendor" element={<VendorHubPage />} />
        <Route path="/moderator" element={<ModeratorHubPage />} />
        <Route path="/capabilities" element={<CapabilitiesRoute user={null} />} />
        <Route path="/compliance" element={<PlatformCompliancePage />} />
        <Route path="/rse" element={<PublicLayout><RseEcologyHubPage role="public" /></PublicLayout>} />
        <Route path="/ecologie" element={<Navigate to="/rse" replace />} />
        <Route path="/qualite-iso" element={<PlatformCompliancePage />} />
        <Route path="/enterprise" element={<EnterpriseFeaturesPage />} />
        <Route path="/fonctionnalites" element={<EnterpriseFeaturesPage />} />
        <Route path="/intelligence" element={<IntelligencePlatformPage />} />
        <Route path="/ia" element={<IntelligencePlatformPage />} />
        <Route path="/mobile" element={<MobileAppPage />} />
        <Route path="/cloud" element={<CloudInfrastructurePage />} />
        <Route path="/big-data" element={<BigDataPlatformPage />} />
        <Route path="/devops" element={<DevOpsPlatformPage />} />
        <Route path="/premium" element={<PremiumFeaturesPage />} />
        <Route path="*" element={<SafeFallbackRedirect />} />
      </Routes>
      </Suspense>
      </>
    );
  }

  return (
    <>
    <CookieConsentBanner />
    <SessionExpiryBanner />
    <LiveDataBanner />
    <GlobalPlatformChat />
    <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<Navigate to={userHome} replace />} />
      <Route path="/login" element={<Navigate to={userHome} replace />} />
      <Route path="/register" element={<Navigate to={userHome} replace />} />
      <Route path="/forgot-password" element={<AuthMobileRoute title="Mot de passe"><ForgotPasswordPage /></AuthMobileRoute>} />
      <Route path="/verify-email" element={<AuthMobileRoute title="Vérification email"><VerifyEmailPage /></AuthMobileRoute>} />
      <Route path="/reset-password" element={<AuthMobileRoute title="Réinitialiser"><ResetPasswordPage /></AuthMobileRoute>} />
      <Route path="/politique-confidentialite" element={<PrivacyPolicyPage />} />
      <Route path="/privacy" element={<Navigate to="/politique-confidentialite" replace />} />
      <Route path="/cookies" element={<CookiesPolicyPage />} />

      <Route path="/compliance" element={<PlatformCompliancePage />} />
      <Route path="/rse" element={<PublicLayout><RseEcologyHubPage role="public" /></PublicLayout>} />
      <Route path="/ecologie" element={<Navigate to="/rse" replace />} />
      <Route path="/qualite-iso" element={<PlatformCompliancePage />} />
      <Route path="/enterprise" element={<EnterpriseFeaturesPage />} />
      <Route path="/fonctionnalites" element={<EnterpriseFeaturesPage />} />
      <Route path="/intelligence" element={<IntelligencePlatformPage />} />
      <Route path="/ia" element={<IntelligencePlatformPage />} />
      <Route path="/mobile" element={<MobileAppPage />} />
      <Route path="/cloud" element={<CloudInfrastructurePage />} />
      <Route path="/big-data" element={<BigDataPlatformPage />} />
      <Route path="/devops" element={<DevOpsPlatformPage />} />
      <Route path="/premium" element={<PremiumFeaturesPage />} />

      <Route path="/admin/dashboard" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminDashboard /></AdminLayout></RoleRoute>} />
      <Route path="/admin/hub" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminAdvancedHubPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/reports" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminReportsPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/food-quality-cam" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminFoodQualityCamPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/delivery-ops" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminDeliveryOpsPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/backups" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminBackupsPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/iot-anomalies" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminIoTAnomaliesPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/vet-validation" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminVetValidationPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/powerbi" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminPowerBiPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/bi" element={<Navigate to="/admin/powerbi" replace />} />
      <Route path="/admin/nlp-models" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminNlpModelsPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/orders" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminOrders /></AdminLayout></RoleRoute>} />
      <Route path="/admin/reviews" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminReviews /></AdminLayout></RoleRoute>} />
      <Route path="/admin/complaints" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminComplaints /></AdminLayout></RoleRoute>} />
      <Route path="/admin/products" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminProducts /></AdminLayout></RoleRoute>} />
      <Route path="/admin/stock" element={<RoleRoute user={user} roles={['admin', 'stock_manager']}><AdminLayout><AdminStockPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/stock/security" element={<RoleRoute user={user} roles={['admin', 'stock_manager']}><AdminLayout><AccountSecurityPage role="stock_manager" /></AdminLayout></RoleRoute>} />
      <Route path="/admin/food-quality" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><FoodQualitySurveillancePage role="admin" /></AdminLayout></RoleRoute>} />
      <Route path="/admin/delivery-cold-chain" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><DeliveryColdChainSurveillancePage role="admin" /></AdminLayout></RoleRoute>} />
      <Route path="/admin/sales" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminSalesPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/users" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminUsers /></AdminLayout></RoleRoute>} />
      <Route path="/admin/livreurs" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminLivreurs /></AdminLayout></RoleRoute>} />
      <Route path="/admin/vendors" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminVendorsPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/vendors/:id" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminVendorDetailPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/live-audience" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminLiveAudiencePage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/refunds" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminRefundsPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/system" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminSystemConfigPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/security" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminSecurityPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/intelligent-security" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminIntelligentSecurityPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/database-security" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminDatabaseSecurityPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/security-framework" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><PlatformSecurityFrameworkPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/security-audit" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminSecurityAuditPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/account-security" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AccountSecurityPage role="admin" /></AdminLayout></RoleRoute>} />
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
      <Route path="/admin/categories" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminCategoriesPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/vets" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminVetsPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/regional-contacts" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminRegionalContactsPage /></AdminLayout></RoleRoute>} />
      <Route path="/capabilities" element={<CapabilitiesRoute user={user} />} />
      <Route path="/admin/blog-articles" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminBlogArticles /></AdminLayout></RoleRoute>} />
      <Route path="/admin/digital-marketing" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminDigitalMarketingPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/rehabilitation" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminRehabilitationPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/ml-agent" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminMlAgentPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/intelligence" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><IntelligencePlatformPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/advanced-ai" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminAdvancedAiPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/analytics-decision" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminAnalyticsDecisionPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/business-intelligence" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminBusinessIntelligencePage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/merchant-intelligence" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminMerchantIntelligencePage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/incidents-ml" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminIncidentsMlPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/stock-bi" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminStockBiPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/performance" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminPlatformPerformancePage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/devops" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><DevOpsPlatformPage adminMode /></AdminLayout></RoleRoute>} />
      <Route path="/admin/partners" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminPartnersHubPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/prices" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminPriceGovernancePage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/cities" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminCitiesHubPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/rse" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><RseEcologyHubPage role="admin" /></AdminLayout></RoleRoute>} />
      <Route path="/admin/profile" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><AdminProfilePage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/platform-services" element={<RoleRoute user={user} roles={['admin']}><AdminLayout><PlatformServicesPage /></AdminLayout></RoleRoute>} />

      <Route path="/client-dashboard" element={<Navigate to="/client-products" replace />} />
      <Route path="/client-family" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientFamilyPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-subscriptions" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientSubscriptionsPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-products" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientProductsPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-smart-commerce" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientSmartCommercePage /></ClientLayout></RoleRoute>} />
      <Route path="/client-favorites" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientFavoritesPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-loyalty" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientLoyaltyPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-community" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientCommunityPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-geo-services" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientGeoServicesPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-digital-twin" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientDigitalTwinPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-vet-intelligence" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientVetIntelligencePage /></ClientLayout></RoleRoute>} />
      <Route path="/client-pet-health-recommendations" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientPetHealthRecommendationPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-wallet" element={<Navigate to="/checkout" replace />} />
      <Route path="/client-orders" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientOrdersPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-reviews" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientReviewsPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-complaints" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientComplaintsPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-returns" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientReturnsPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-rse" element={<RoleRoute user={user} roles={['client']}><ClientLayout><RseEcologyHubPage role="client" /></ClientLayout></RoleRoute>} />
      <Route path="/client-profile" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientProfilePage /></ClientLayout></RoleRoute>} />
      <Route path="/client-pets" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientPetsPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-pet-passport" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientPetPassportPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-pet-passport/:petId" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientPetPassportPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-invoices" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientInvoicesPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-history" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientHistoryPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-events" element={<RoleRoute user={user} roles={['client']}><ClientLayout><EventsPage /></ClientLayout></RoleRoute>} />
      <Route path="/found-me" element={<RoleRoute user={user} roles={['client']}><ClientLayout><FoundMePage /></ClientLayout></RoleRoute>} />
      <Route path="/client-purchase-needs" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientPurchaseNeedsPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-services" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientServicesPage /></ClientLayout></RoleRoute>} />
      <Route path="/platform-services" element={<RoleRoute user={user} roles={['client']}><ClientLayout><PlatformServicesPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-vaccines" element={<Navigate to="/medical-dossier" replace />} />
      <Route path="/pet-advice" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientPetAdvicePage /></ClientLayout></RoleRoute>} />
      <Route path="/pet-calories" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientPetCaloriesPage /></ClientLayout></RoleRoute>} />
      <Route path="/pet-adaptive-nutrition" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientAdaptiveNutritionPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-smart-hub" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientSmartHubPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-ecosystem" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientEcosystemHubPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-wellness" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientWellnessPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-emotions" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientOwnerEmotionsPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-ai" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientAIAgentPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-advanced-ai" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientAdvancedAiPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-intelligence" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientIntelligenceAutomationPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-recommendations" element={<RoleRoute user={user} roles={['client']}><ClientLayout><RecommendationHubPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-explainable-ai" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientExplainableAiPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-ml-agent" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientMlAgentPage /></ClientLayout></RoleRoute>} />
      <Route path="/smart-food-agent" element={<RoleRoute user={user} roles={['client']}><ClientLayout><SmartFoodAgentPage /></ClientLayout></RoleRoute>} />
      <Route path="/nutripro-history" element={<RoleRoute user={user} roles={['client']}><ClientLayout><NutriProHistory /></ClientLayout></RoleRoute>} />
      <Route path="/client-rehabilitation" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientRehabilitationPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-relay-points" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientRelayPointsPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-product-packs" element={<Navigate to="/client-products#packs-produits" replace />} />
      <Route path="/client-traceability" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientTraceabilityPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-iot" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientIoTHubPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-esp32cam-food-quality" element={<Navigate to="/client-iot?tab=food-quality" replace />} />
      <Route path="/client-smart-water" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientSmartWaterPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-smart-delivery" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientSmartDeliveryPage /></ClientLayout></RoleRoute>} />
      <Route path="/contact" element={
        user?.role === 'client'
          ? <RoleRoute user={user} roles={['client']}><ClientLayout><ContactPage /></ClientLayout></RoleRoute>
          : <PublicLayout><ContactPage /></PublicLayout>
      } />
      <Route path="/store-locator" element={<RoleRoute user={user} roles={['client']}><ClientLayout><StoreLocatorPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-cities" element={<RoleRoute user={user} roles={['client']}><ClientLayout><PlatformCitiesPage /></ClientLayout></RoleRoute>} />
      <Route path="/pet-feeder" element={<RoleRoute user={user} roles={['client']}><ClientLayout><PetFeederPage /></ClientLayout></RoleRoute>} />
      <Route path="/veterinary" element={<RoleRoute user={user} roles={['client']}><ClientLayout><VeterinaryPage /></ClientLayout></RoleRoute>} />
      <Route path="/medical-dossier" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientMedicalDossierPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-teleconsult" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ClientTeleconsultPage /></ClientLayout></RoleRoute>} />
      <Route path="/checkout" element={<RoleRoute user={user} roles={['client']}><ClientLayout><Suspense fallback={<div className="app-auth-loading" style={{ minHeight: '40vh' }}><p className="app-auth-loading__text">Chargement du paiement…</p></div>}><CheckoutPage /></Suspense></ClientLayout></RoleRoute>} />
      <Route path="/change-password" element={<RoleRoute user={user} roles={['client']}><ClientLayout><ChangePasswordPage /></ClientLayout></RoleRoute>} />
      <Route path="/client-security" element={<RoleRoute user={user} roles={['client']}><ClientLayout><AccountSecurityPage role="client" /></ClientLayout></RoleRoute>} />

      <Route path="/livreur/dashboard" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurDashboard /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/orders" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurOrdersPage /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/route" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurRoutePage /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/map" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurMapPage /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/availability" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurAvailabilityPage /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/leave-requests" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><StaffLeavePage roleLabel="Livreur" demoFallback /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/ml" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurMlPage /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/intelligence" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurIntelligenceHubPage /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/recommendations" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><RecommendationHubPage /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/delivery-cold-chain" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><DeliveryColdChainSurveillancePage role="livreur" /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/stats" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurStatsPage /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/bi" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><RoleBiDashboardPage role="livreur" /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/messages" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurMessagesPage /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/earnings" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurEarningsPage /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/history" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurHistoryPage /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/platform-services" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><PlatformServicesPage /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/rse" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><RseEcologyHubPage role="livreur" /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/profile" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><LivreurProfilePage /></LivreurLayout></RoleRoute>} />
      <Route path="/livreur/security" element={<RoleRoute user={user} roles={['livreur']}><LivreurLayout><AccountSecurityPage role="livreur" /></LivreurLayout></RoleRoute>} />

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
      <Route path="/vet/security" element={<RoleRoute user={user} roles={['vet']}><VetLayout><AccountSecurityPage role="vet" /></VetLayout></RoleRoute>} />
      <Route path="/vet/recommendations" element={<RoleRoute user={user} roles={['vet']}><VetLayout><RecommendationHubPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/leave-requests" element={<RoleRoute user={user} roles={['vet']}><VetLayout><StaffLeavePage roleLabel="Vétérinaire" demoFallback /></VetLayout></RoleRoute>} />
      <Route path="/vet/platform-services" element={<RoleRoute user={user} roles={['vet']}><VetLayout><PlatformServicesPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/teleconsult" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetTeleconsultPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/nutrition" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetNutritionAdvicePage /></VetLayout></RoleRoute>} />
      <Route path="/vet/ml-agent" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetMlAgentPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/intelligence" element={<RoleRoute user={user} roles={['vet']}><VetLayout><VetIntelligenceHubPage /></VetLayout></RoleRoute>} />
      <Route path="/vet/rehabilitation" element={<RoleRoute user={user} roles={['vet']}><VetLayout><AdminRehabilitationPage /></VetLayout></RoleRoute>} />

      <Route path="/visitor/*" element={<Navigate to="/" replace />} />
      <Route path="/vendor" element={<VendorHubPage />} />
      <Route path="/moderator" element={<ModeratorHubPage />} />

      <Route path="/vendor/dashboard" element={<RoleRoute user={user} roles={['vendor', 'admin']}><VendorLayout><VendorDashboardPage /></VendorLayout></RoleRoute>} />
      <Route path="/vendor/products" element={<RoleRoute user={user} roles={['vendor', 'admin']}><VendorLayout><VendorProductsPage /></VendorLayout></RoleRoute>} />
      <Route path="/vendor/orders" element={<RoleRoute user={user} roles={['vendor', 'admin']}><VendorLayout><VendorOrdersPage /></VendorLayout></RoleRoute>} />
      <Route path="/vendor/sales" element={<RoleRoute user={user} roles={['vendor', 'admin']}><VendorLayout><VendorSalesPage /></VendorLayout></RoleRoute>} />
      <Route path="/vendor/returns" element={<RoleRoute user={user} roles={['vendor', 'admin']}><VendorLayout><VendorReturnsPage /></VendorLayout></RoleRoute>} />
      <Route path="/vendor/communication" element={<RoleRoute user={user} roles={['vendor', 'admin']}><VendorLayout><VendorCommunicationPage /></VendorLayout></RoleRoute>} />
      <Route path="/vendor/marketing" element={<RoleRoute user={user} roles={['vendor', 'admin']}><VendorLayout><VendorMarketingPage /></VendorLayout></RoleRoute>} />
      <Route path="/vendor/purchase-needs" element={<RoleRoute user={user} roles={['vendor', 'admin']}><VendorLayout><VendorPurchaseNeedsPage /></VendorLayout></RoleRoute>} />
      <Route path="/vendor/ml" element={<RoleRoute user={user} roles={['vendor', 'admin']}><VendorLayout><VendorMlPage /></VendorLayout></RoleRoute>} />
      <Route path="/vendor/food-quality" element={<RoleRoute user={user} roles={['vendor', 'admin']}><VendorLayout><FoodQualitySurveillancePage role="vendor" /></VendorLayout></RoleRoute>} />
      <Route path="/vendor/bi" element={<RoleRoute user={user} roles={['vendor', 'admin']}><VendorLayout><RoleBiDashboardPage role="vendor" /></VendorLayout></RoleRoute>} />
      <Route path="/vendor/platform-services" element={<RoleRoute user={user} roles={['vendor', 'admin']}><VendorLayout><PlatformServicesPage /></VendorLayout></RoleRoute>} />
      <Route path="/vendor/rse" element={<RoleRoute user={user} roles={['vendor', 'admin']}><VendorLayout><RseEcologyHubPage role="vendor" /></VendorLayout></RoleRoute>} />
      <Route path="/vendor/profile" element={<RoleRoute user={user} roles={['vendor', 'admin']}><VendorLayout><VendorProfilePage /></VendorLayout></RoleRoute>} />
      <Route path="/vendor/security" element={<RoleRoute user={user} roles={['vendor', 'admin']}><VendorLayout><AccountSecurityPage role="vendor" /></VendorLayout></RoleRoute>} />
      <Route path="/vendor/recommendations" element={<RoleRoute user={user} roles={['vendor', 'admin']}><VendorLayout><RecommendationHubPage /></VendorLayout></RoleRoute>} />
      <Route path="/vendor/traceability" element={<RoleRoute user={user} roles={['vendor', 'admin']}><VendorLayout><VendorTraceabilityPage /></VendorLayout></RoleRoute>} />
      <Route path="/vendor/feeder-iot" element={<RoleRoute user={user} roles={['vendor', 'admin']}><VendorLayout><VendorFeederIoTPage /></VendorLayout></RoleRoute>} />

      <Route path="/moderator/dashboard" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><ModeratorDashboard /></ModeratorLayout></RoleRoute>} />
      <Route path="/moderator/intelligence" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><ModeratorIntelligenceHubPage /></ModeratorLayout></RoleRoute>} />
      <Route path="/moderator/recommendations" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><RecommendationHubPage /></ModeratorLayout></RoleRoute>} />
      <Route path="/moderator/users" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><ModeratorUsersPage /></ModeratorLayout></RoleRoute>} />
      <Route path="/moderator/vendors" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><ModeratorVendorsPage /></ModeratorLayout></RoleRoute>} />
      <Route path="/moderator/fraud" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><ModeratorFraudCenterPage /></ModeratorLayout></RoleRoute>} />
      <Route path="/moderator/content" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><ModeratorContentPage /></ModeratorLayout></RoleRoute>} />
      <Route path="/moderator/reports" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><ModeratorReportsPage /></ModeratorLayout></RoleRoute>} />
      <Route path="/moderator/refunds" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><ModeratorRefundsPage /></ModeratorLayout></RoleRoute>} />
      <Route path="/moderator/analytics" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><ModeratorAnalyticsPage /></ModeratorLayout></RoleRoute>} />
      <Route path="/moderator/bi" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><RoleBiDashboardPage role="moderator" /></ModeratorLayout></RoleRoute>} />
      <Route path="/moderator/reviews" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><AdminReviews /></ModeratorLayout></RoleRoute>} />
      <Route path="/moderator/complaints" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><AdminComplaints /></ModeratorLayout></RoleRoute>} />
      <Route path="/moderator/events" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><EventsPage /></ModeratorLayout></RoleRoute>} />
      <Route path="/moderator/messages" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><ModeratorMessagesPage /></ModeratorLayout></RoleRoute>} />
      <Route path="/moderator/platform-services" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><PlatformServicesPage /></ModeratorLayout></RoleRoute>} />
      <Route path="/moderator/profile" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><ModeratorProfilePage /></ModeratorLayout></RoleRoute>} />
      <Route path="/moderator/security" element={<RoleRoute user={user} roles={['moderator']}><ModeratorLayout><AccountSecurityPage role="moderator" /></ModeratorLayout></RoleRoute>} />
      <Route path="/support/profile" element={<RoleRoute user={user} roles={['support']}><ServiceClientLayout><ServiceClientProfilePage /></ServiceClientLayout></RoleRoute>} />

      <Route path="*" element={<SafeFallbackRedirect />} />
    </Routes>
    </Suspense>
    </>
  );
};

export default App;