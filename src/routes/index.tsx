import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, useRouteError } from "react-router-dom";

import ClientLayout from "../components/layout/ClientLayout";
import Home from "../pages/client/Home";
const ProductDetail = lazy(() => import("../pages/client/ProductDetail"));

const ThemeProductsPage = lazy(() => import("../pages/client/ThemeProductsPage"));
const themeProductsLoader = async (args: import("react-router-dom").LoaderFunctionArgs) =>
    (await import("../pages/client/ThemeProductsPage")).themeProductsLoader(args);

const AdminLayout = lazy(() => import("../components/layout/AdminLayout"));
const AdminHome = lazy(() => import("../pages/admin/AdminHome"));
const AdminLogin = lazy(() => import("../pages/admin/AdminLogin"));
const AdminProductList = lazy(() => import("../pages/admin/AdminProductList"));
const AdminProductEdit = lazy(() => import("../pages/admin/AdminProductEdit"));
const AdminThemes = lazy(() => import("../pages/admin/AdminThemes"));
import { adminOnlyGuard } from "./guards";

const ClientLogin = lazy(() => import("../pages/client/ClientLogin"));
const MyPage = lazy(() => import("../pages/client/MyPage"));
const SupportPage = lazy(() => import("../pages/client/SupportPage"));
const FaqPage = lazy(() => import("../pages/client/FaqPage"));
const TermsPage = lazy(() => import("../pages/client/TermsPage"));
const PrivacyPage = lazy(() => import("../pages/client/PrivacyPage"));
const InsurancePage = lazy(() => import("../pages/client/InsurancePage"));

const AdminBookings = lazy(() => import("../pages/admin/AdminBookings"));

const NoticesPage = lazy(() => import("../pages/client/NoticesPage"));
const NoticeDetailPage = lazy(() => import("../pages/client/NoticeDetailPage"));

const AdminNotices = lazy(() => import("../pages/admin/AdminNotices"));
const AdminNoticeEdit = lazy(() => import("../pages/admin/AdminNoticeEdit"));

const AdminBranding = lazy(() => import("../pages/admin/AdminBranding"));
const AdminFooter = lazy(() => import("../pages/admin/AdminFooter"));

const AdminUsers = lazy(() => import("../pages/admin/AdminUsers"));
const AdminUserDetail = lazy(() => import("../pages/admin/AdminUserDetail"));

const HeroSlideAdminPage = lazy(() => import("../pages/admin/HeroSlidesAdminPage"));
const HeroSlides2AdminPage = lazy(() => import("../pages/admin/HeroSlides2AdminPage"));

const SearchPage = lazy(() => import("../pages/client/SearchPage"));

const InquiriesAdminPage = lazy(() => import("../pages/admin/InquiriesAdminPage"));

const AdminAreas = lazy(() => import("../pages/admin/AdminAreas"));
const AdminRegions = lazy(() => import("../pages/admin/AdminRegions"));

const AdminPopups = lazy(() => import("../pages/admin/AdminPopupsPage"));

const AdminThumbnailCleanupPage = lazy(() => import("../pages/admin/AdminThumbnailCleanupPage"));

const EstimatePage = lazy(() => import("../pages/client/EstimatePage"));

const AdminHomeSections = lazy(() => import("../pages/admin/AdminHomeSections"));


function deferred(element: ReactNode) {
    return <Suspense fallback={<div role="status" className="p-8 text-center">불러오는 중...</div>}>{element}</Suspense>;
}

function RouteError() {
    const err = useRouteError() as any;

    const msg =
        err?.message ||
        err?.statusText ||
        (typeof err === "string" ? err : "Unknown error");

    return (
        <div style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
            <h1 style={{ fontSize: 20, fontWeight: 800 }}>Route Error</h1>
            <p style={{ marginTop: 8 }}>{msg}</p>
            <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>
        {JSON.stringify(err, Object.getOwnPropertyNames(err), 2)}
      </pre>
        </div>
    );
}

export const router = createBrowserRouter([
    {
        element: <ClientLayout />,
        errorElement: <RouteError />,
        children: [
            { path: "/", element: <Home /> },

            { path: "/theme/:slug", element: deferred(<ThemeProductsPage />), loader: themeProductsLoader },
            { path: "/product/:id", element: deferred(<ProductDetail />) },
            { path: "/login", element: deferred(<ClientLogin />) },
            { path: "/me", element: deferred(<MyPage />) },

            { path: "/notices", element: deferred(<NoticesPage />) },
            { path: "/notices/:id", element: deferred(<NoticeDetailPage />) },
            { path: "/faq", element: deferred(<FaqPage />) },
            { path: "/support", element: deferred(<SupportPage />) },
            { path: "/search", element: deferred(<SearchPage />) },

            { path: "/estimate", element: deferred(<EstimatePage />) },

            { path: "/terms", element: deferred(<TermsPage />) },
            { path: "/privacy", element: deferred(<PrivacyPage />) },
            { path: "/insurance", element: deferred(<InsurancePage />) },
        ],
    },

    { path: "/admin/login", element: deferred(<AdminLogin />), errorElement: <RouteError /> },

    {
        path: "/admin",
        element: deferred(<AdminLayout />),
        loader: adminOnlyGuard,
        errorElement: <RouteError />,
        children: [
            { index: true, element: deferred(<AdminHome />) },

            { path: "bookings", element: deferred(<AdminBookings />) },

            { path: "products", element: deferred(<AdminProductList />) },
            { path: "themes", element: deferred(<AdminThemes />) },

            // ✅ HERO 슬라이드 관리 라우트
            { path: "hero-slides", element: deferred(<HeroSlideAdminPage />) },
            { path: "hero-slides2", element: deferred(<HeroSlides2AdminPage />) },

            { path: "home-sections", element: deferred(<AdminHomeSections />) },

            { path: "settings/branding", element: deferred(<AdminBranding />) },
            { path: "settings/footer", element: deferred(<AdminFooter />) },

            { path: "users", element: deferred(<AdminUsers />) },
            { path: "users/:id", element: deferred(<AdminUserDetail />) },

            { path: "products/new/:tab", element: deferred(<AdminProductEdit mode="create" />) },
            { path: "products/new", element: deferred(<AdminProductEdit mode="create" />) },

            { path: "products/:id/:tab", element: deferred(<AdminProductEdit mode="edit" />) },
            { path: "products/:id", element: deferred(<AdminProductEdit mode="edit" />) },

            { path: "notices", element: deferred(<AdminNotices />) },
            { path: "notices/new", element: deferred(<AdminNoticeEdit mode="create" />) },
            { path: "notices/:id", element: deferred(<AdminNoticeEdit mode="edit" />) },

            { path: "inquiries", element: deferred(<InquiriesAdminPage />) },

            { path: "areas", element: deferred(<AdminAreas />) },
            { path: "regions", element: deferred(<AdminRegions />) },

            { path: "popups", element: deferred(<AdminPopups />) },

            { path: "cleanup",  element: deferred(<AdminThumbnailCleanupPage />) },
        ],
    },
]);
