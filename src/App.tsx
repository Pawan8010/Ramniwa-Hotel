import React, { Suspense, lazy, useEffect } from 'react';
import { MotionConfig } from 'motion/react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { LoadingSkeleton } from './components/ui/DataState';
import { ToastContainer } from './components/ui/ToastContainer';
import { LanguageProvider } from './hooks/useLanguage';
import { ToastProvider } from './hooks/useToast';

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const RoomsPage = lazy(() => import('./pages/RoomsPage').then((m) => ({ default: m.RoomsPage })));
const BookPage = lazy(() => import('./pages/BookPage').then((m) => ({ default: m.BookPage })));
const MyBookingPage = lazy(() => import('./pages/MyBookingPage').then((m) => ({ default: m.MyBookingPage })));
const AmenitiesPage = lazy(() => import('./pages/AmenitiesPage').then((m) => ({ default: m.AmenitiesPage })));
const LocationPage = lazy(() => import('./pages/LocationPage').then((m) => ({ default: m.LocationPage })));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage').then((m) => ({ default: m.ReviewsPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const PrivacyPage = lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.TermsPage })));
const NotFoundPage = lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.NotFoundPage })));

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminBookingsPage = lazy(() =>
  import('./pages/admin/AdminBookingsPage').then((m) => ({ default: m.AdminBookingsPage }))
);
const AdminRoomsPage = lazy(() =>
  import('./pages/admin/AdminRoomsPage').then((m) => ({ default: m.AdminRoomsPage }))
);
const AdminRatesPage = lazy(() =>
  import('./pages/admin/AdminRatesPage').then((m) => ({ default: m.AdminRatesPage }))
);
const AdminHousekeepingPage = lazy(() =>
  import('./pages/admin/AdminHousekeepingPage').then((m) => ({ default: m.AdminHousekeepingPage }))
);
const AdminInboxPage = lazy(() =>
  import('./pages/admin/AdminInboxPage').then((m) => ({ default: m.AdminInboxPage }))
);
const AdminMediaPage = lazy(() =>
  import('./pages/admin/AdminMediaContentPage').then((m) => ({ default: m.AdminMediaPage }))
);
const AdminContentPage = lazy(() =>
  import('./pages/admin/AdminMediaContentPage').then((m) => ({ default: m.AdminContentPage }))
);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PageFallback() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <LoadingSkeleton rows={4} />
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <LanguageProvider>
        <ToastProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route
                  path="/"
                  element={
                    <PublicLayout>
                      <HomePage />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/rooms"
                  element={
                    <PublicLayout>
                      <RoomsPage />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/book"
                  element={
                    <PublicLayout>
                      <BookPage />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/my-booking"
                  element={
                    <PublicLayout>
                      <MyBookingPage />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/amenities"
                  element={
                    <PublicLayout>
                      <AmenitiesPage />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/location"
                  element={
                    <PublicLayout>
                      <LocationPage />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/reviews"
                  element={
                    <PublicLayout>
                      <ReviewsPage />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/contact"
                  element={
                    <PublicLayout>
                      <ContactPage />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/privacy"
                  element={
                    <PublicLayout>
                      <PrivacyPage />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/terms"
                  element={
                    <PublicLayout>
                      <TermsPage />
                    </PublicLayout>
                  }
                />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="bookings" element={<AdminBookingsPage />} />
                  <Route path="rooms" element={<AdminRoomsPage />} />
                  <Route path="rates" element={<AdminRatesPage />} />
                  <Route path="housekeeping" element={<AdminHousekeepingPage />} />
                  <Route path="inbox" element={<AdminInboxPage />} />
                  <Route path="media" element={<AdminMediaPage />} />
                  <Route path="content" element={<AdminContentPage />} />
                </Route>

                {/* 404 */}
                <Route
                  path="*"
                  element={
                    <PublicLayout>
                      <NotFoundPage />
                    </PublicLayout>
                  }
                />
              </Routes>
            </Suspense>
            <ToastContainer />
          </BrowserRouter>
        </ToastProvider>
      </LanguageProvider>
    </MotionConfig>
  );
}
