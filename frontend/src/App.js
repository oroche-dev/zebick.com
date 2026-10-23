import React, { Suspense, lazy } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Components (small, needed on every page — kept in the main bundle)
import CookieBanner from './components/common/CookieBanner';
import ScrollToTop from './components/common/ScrollToTop';
import GoogleAnalytics from './components/GoogleAnalytics';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Toaster } from './components/ui/sonner';

// HomePage is the single most common entry point — kept eager so the very
// first visit doesn't pay an extra chunk round-trip. Everything else below
// is lazy: a visitor only ever needs a handful of these per session, so
// shipping all of them (esp. the 31-file admin panel) in one bundle to every
// anonymous visitor was the main cause of the slow first load (542 KB gzip,
// 3.9s first paint — measured on the unsplit build).
import HomePage from './pages/HomePage';

// Pages
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const LogoPreviewPage = lazy(() => import('./pages/LogoPreviewPage'));
const ReviewPage = lazy(() => import('./pages/ReviewPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const ImpressumPage = lazy(() => import('./pages/ImpressumPage'));
const DatenschutzPage = lazy(() => import('./pages/DatenschutzPage'));
const AGBPage = lazy(() => import('./pages/AGBPage'));
const CookieRichtliniePage = lazy(() => import('./pages/CookieRichtliniePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Service Pages
const WebDevelopmentPage = lazy(() => import('./pages/services/WebDevelopmentPage'));
const AppDevelopmentPage = lazy(() => import('./pages/services/AppDevelopmentPage'));
const CyberSecurityPage = lazy(() => import('./pages/services/CyberSecurityPage'));
const UIUXPage = lazy(() => import('./pages/services/UIUXPage'));
const GamingDevelopmentPage = lazy(() => import('./pages/services/GamingDevelopmentPage'));
const ChatbotDevelopmentPage = lazy(() => import('./pages/services/ChatbotDevelopmentPage'));
const ServerDevelopmentPage = lazy(() => import('./pages/services/ServerDevelopmentPage'));
const MarketingSEOPage = lazy(() => import('./pages/services/MarketingSEOPage'));
const GraphicDesignPage = lazy(() => import('./pages/services/GraphicDesignPage'));
const AutomationKIPage = lazy(() => import('./pages/services/AutomationKIPage'));
const ToolsPage = lazy(() => import('./pages/ToolsPage'));
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'));

// Admin Pages — the entire /zb-panel-8x2k/* tree now lives in its own
// chunk(s), only fetched when someone actually navigates there.
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const NewsletterAdmin = lazy(() => import('./pages/admin/NewsletterAdmin'));
const ContactsAdmin = lazy(() => import('./pages/admin/ContactsAdmin'));
const EmailTemplates = lazy(() => import('./pages/admin/EmailTemplates'));
const TestimonialsAdmin = lazy(() => import('./pages/admin/TestimonialsAdmin'));
const UsersAdmin = lazy(() => import('./pages/admin/UsersAdmin'));
const AnalyticsAdmin = lazy(() => import('./pages/admin/AnalyticsAdmin'));
const SecurityAdmin = lazy(() => import('./pages/admin/SecurityAdmin'));
const InboxAdmin = lazy(() => import('./pages/admin/InboxAdmin'));
const AutoEmails = lazy(() => import('./pages/admin/AutoEmails'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const OfferABStats = lazy(() => import('./pages/admin/OfferABStats'));
const PortfolioAdmin = lazy(() => import('./pages/admin/PortfolioAdmin'));
const BlogAdmin = lazy(() => import('./pages/admin/BlogAdmin'));
const TeamAdmin = lazy(() => import('./pages/admin/TeamAdmin'));
const FAQAdmin = lazy(() => import('./pages/admin/FAQAdmin'));
const HomeContentAdmin = lazy(() => import('./pages/admin/HomeContentAdmin'));
const CustomersAdmin = lazy(() => import('./pages/admin/CustomersAdmin'));
const FunnelAdmin = lazy(() => import('./pages/admin/FunnelAdmin'));
const CategoriesAdmin = lazy(() => import('./pages/admin/CategoriesAdmin'));
const ServicesCatalogAdmin = lazy(() => import('./pages/admin/ServicesCatalogAdmin'));
const ServicePricingAdmin = lazy(() => import('./pages/admin/ServicePricingAdmin'));
const ProjectsMgmtAdmin = lazy(() => import('./pages/admin/ProjectsMgmtAdmin'));
const OffersAdmin = lazy(() => import('./pages/admin/OffersAdmin'));
const SettingsAdmin = lazy(() => import('./pages/admin/SettingsAdmin'));
const ChatbotAdmin = lazy(() => import('./pages/admin/ChatbotAdmin'));
const LeadsAdmin = lazy(() => import('./pages/admin/LeadsAdmin'));
const AchievementsAdmin = lazy(() => import('./pages/admin/AchievementsAdmin'));
const ToolsAdmin = lazy(() => import('./pages/admin/ToolsAdmin'));
const BackupsAdmin = lazy(() => import('./pages/admin/BackupsAdmin'));
const AdminShellLayout = lazy(() => import('./components/admin/AdminShellLayout'));

// Full-screen fallback shown only while a route chunk is fetching (usually
// a few ms on a real connection). Matches ProtectedRoute's existing loading
// style so there's no visual mismatch.
const PageLoading = () => (
  <div style={{
    minHeight: '100vh',
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '18px',
  }}>
    Lädt …
  </div>
);

function App() {
  return (
    <div className="App">
      <Toaster theme="dark" position="bottom-right" richColors closeButton />
      <BrowserRouter>
        <ScrollToTop />
        <GoogleAnalytics />
        <CookieBanner />
        <Suspense fallback={<PageLoading />}>
        <Routes>
          {/* Main Pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/portfolio/:slug" element={<ProjectDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/kontakt" element={<ContactPage />} />
          <Route path="/logo-varianten" element={<LogoPreviewPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/bewertung" element={<ReviewPage />} />
          <Route path="/bewertung-abgeben" element={<ReviewPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/kategorie/:category" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/impressum" element={<ImpressumPage />} />
          <Route path="/datenschutz" element={<DatenschutzPage />} />
          <Route path="/agb" element={<AGBPage />} />
          <Route path="/cookie-richtlinie" element={<CookieRichtliniePage />} />

          {/* Service Landing Pages — English aliases */}
          <Route path="/services/web-development" element={<WebDevelopmentPage />} />
          <Route path="/services/app-development" element={<AppDevelopmentPage />} />
          <Route path="/services/cyber-security" element={<CyberSecurityPage />} />
          <Route path="/services/ui-ux" element={<UIUXPage />} />
          <Route path="/services/gaming" element={<GamingDevelopmentPage />} />
          <Route path="/services/chatbot" element={<ChatbotDevelopmentPage />} />
          <Route path="/services/server" element={<ServerDevelopmentPage />} />
          <Route path="/services/marketing" element={<MarketingSEOPage />} />
          <Route path="/services/graphic-design" element={<GraphicDesignPage />} />
          <Route path="/services/automatisierung-ki" element={<AutomationKIPage />} />
          <Route path="/services/automation-ki" element={<AutomationKIPage />} />
          {/* Lead-Magneten / Tools */}
          <Route path="/kostenlose-analyse" element={<ToolsPage />} />
          <Route path="/analyse" element={<ToolsPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          {/* German (DB-seeded) slug aliases — same rich pages */}
          <Route path="/services/webentwicklung" element={<WebDevelopmentPage />} />
          <Route path="/services/app-entwicklung" element={<AppDevelopmentPage />} />
          <Route path="/services/ui-ux-design" element={<UIUXPage />} />
          <Route path="/services/gaming-entwicklung" element={<GamingDevelopmentPage />} />
          <Route path="/services/chatbot-entwicklung" element={<ChatbotDevelopmentPage />} />
          <Route path="/services/server-systeme" element={<ServerDevelopmentPage />} />
          <Route path="/services/digitales-marketing-seo" element={<MarketingSEOPage />} />
          <Route path="/services/grafikdesign" element={<GraphicDesignPage />} />
          <Route path="/services/cyber" element={<CyberSecurityPage />} />
          <Route path="/services/cyber-sicherheit" element={<CyberSecurityPage />} />
          {/* Dynamic catch-all for any other category slug (from admin-created categories) */}
          <Route path="/services/:slug" element={<ServiceDetailPage />} />

          {/* Admin Pages */}
          <Route path="/zb-panel-8x2k/login" element={<AdminLogin />} />
          <Route path="/zb-panel-8x2k" element={
            <ProtectedRoute>
              <AdminShellLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="newsletter" element={<NewsletterAdmin />} />
            <Route path="contacts" element={<ContactsAdmin />} />
            <Route path="anfragen" element={<ContactsAdmin />} />
            <Route path="email-templates" element={<EmailTemplates />} />
            <Route path="testimonials" element={<TestimonialsAdmin />} />
            <Route path="bewertungen" element={<TestimonialsAdmin />} />
            <Route path="users" element={<UsersAdmin />} />
            <Route path="benutzer" element={<UsersAdmin />} />
            <Route path="analytics" element={<AnalyticsAdmin />} />
            <Route path="security" element={<SecurityAdmin />} />
            <Route path="sicherheit" element={<SecurityAdmin />} />
            <Route path="inbox" element={<InboxAdmin />} />
            <Route path="posteingang" element={<InboxAdmin />} />
            <Route path="auto-emails" element={<AutoEmails />} />
            <Route path="automatische-emails" element={<AutoEmails />} />
            <Route path="angebot-ab-test" element={<OfferABStats />} />
            <Route path="offer-ab-test" element={<OfferABStats />} />
            <Route path="portfolio" element={<PortfolioAdmin />} />
            <Route path="projekte" element={<PortfolioAdmin />} />
            <Route path="blog" element={<BlogAdmin />} />
            <Route path="team" element={<TeamAdmin />} />
            <Route path="faq" element={<FAQAdmin />} />
            <Route path="home-content" element={<HomeContentAdmin />} />
            <Route path="startseite" element={<HomeContentAdmin />} />
            <Route path="customers" element={<CustomersAdmin />} />
            <Route path="kunden" element={<CustomersAdmin />} />
            <Route path="funnel" element={<FunnelAdmin />} />
            <Route path="pipeline" element={<FunnelAdmin />} />
            <Route path="categories" element={<CategoriesAdmin />} />
            <Route path="services-catalog" element={<ServicesCatalogAdmin />} />
            <Route path="service-pricing" element={<ServicePricingAdmin />} />
            <Route path="projects-mgmt" element={<ProjectsMgmtAdmin />} />
            <Route path="offers" element={<OffersAdmin />} />
            <Route path="settings" element={<SettingsAdmin />} />
            <Route path="chatbot" element={<ChatbotAdmin />} />
            <Route path="leads" element={<LeadsAdmin />} />
            <Route path="achievements" element={<AchievementsAdmin />} />
            <Route path="games" element={<AchievementsAdmin />} />
            <Route path="tools" element={<ToolsAdmin />} />
            <Route path="berater" element={<ToolsAdmin />} />
            <Route path="backups" element={<BackupsAdmin />} />
          </Route>

          {/* Catch-all 404 page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
}

export default App;
