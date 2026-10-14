import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listThemesActive, type ThemeRow } from "../../api/themes.api";
import { useSession } from "../../hooks/useSession";
import { useLogoUrl, usePrimaryColor } from "../../hooks/useSiteBranding";

import KakaoLogo from "../../assets/kakao.png";
import InstaIcon from "../../assets/insta.webp";
import BlogIcon from "../../assets/blog.png";
import CountryNavigation from "./CountryNavigation";
import BrandLogo from "../common/BrandLogo";

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const { session } = useSession();

    const [params] = useSearchParams();
    const initialQ = params.get("q") ?? "";

    const [q, setQ] = useState(initialQ);

    useEffect(() => {
        setQ(initialQ);
    }, [initialQ]);

    const goSearch = () => {
        const keyword = q.trim();
        navigate(keyword ? `/search?q=${encodeURIComponent(keyword)}` : `/search`);
    };

    const themesQuery = useQuery({
        queryKey: ["themes", "active"],
        queryFn: listThemesActive,
        staleTime: 60_000,
    });

    const logoQuery = useLogoUrl();
    // Keep the published brand visible while its configurable setting refreshes.
    const publishedLogoPath = "branding/logo-72a193df-5664-48a1-86a5-ad364f669c17.svg";
    const configuredLogo = logoQuery.data;
    const logoUrl = !configuredLogo || configuredLogo.endsWith(publishedLogoPath)
        ? "/site-logo.svg" : configuredLogo;

    const primaryColorQuery = usePrimaryColor();
    const primaryColor = primaryColorQuery.data || "#2E97F2";

    const themes: ThemeRow[] = useMemo(() => {
        const list = (themesQuery.data ?? []) as ThemeRow[];
        return [...list]
            .filter((t) => t.is_active !== false)
            .sort((a, b) => {
                const ao = a.sort_order ?? 9999;
                const bo = b.sort_order ?? 9999;
                if (ao !== bo) return ao - bo;
                return (a.name ?? "").localeCompare(b.name ?? "");
            });
    }, [themesQuery.data]);

    const mobileToggle = useRef<HTMLButtonElement>(null);
    const mobilePanel = useRef<HTMLDivElement>(null);
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 4);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => { setMobileMenuOpen(false); }, [location.pathname, location.search]);
    useEffect(() => {
        if (!mobileMenuOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const background = Array.from(document.querySelectorAll<HTMLElement>(".client-shell > main, .client-shell > footer, .mobile-bottom-nav"));
        const previousInert = background.map(element => element.inert);
        background.forEach(element => { element.inert = true; });
        const focusFrame = requestAnimationFrame(() => mobilePanel.current?.querySelector<HTMLButtonElement>("button")?.focus());
        const close = (e: KeyboardEvent) => {
            if (e.key === "Escape") { setMobileMenuOpen(false); mobileToggle.current?.focus(); }
        };
        const desktop = window.matchMedia("(min-width: 768px)");
        const resized = () => { if (desktop.matches) setMobileMenuOpen(false); };
        document.addEventListener("keydown", close);
        desktop.addEventListener("change", resized);
        return () => {
            cancelAnimationFrame(focusFrame);
            document.body.style.overflow = previousOverflow;
            background.forEach((element, index) => { element.inert = previousInert[index]; });
            document.removeEventListener("keydown", close);
            desktop.removeEventListener("change", resized);
        };
    }, [mobileMenuOpen]);

    const disabledSearch = !q.trim();

    return (
        <header data-client-header="true"
            className={`sticky top-0 z-50 ${scrolled ? "shadow-md" : ""}`}
            style={{ backgroundColor: primaryColor }}
        >
            <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6">
                {/* =======================
            (모바일) 로고 + 햄버거 메뉴
           ======================= */}
                <div className="relative z-30 flex items-center justify-between py-3 md:hidden">
                    {/* 로고 */}
                    <Link to="/" aria-label="홈으로" className="flex items-center">
                        <BrandLogo src={logoUrl} className="h-10 w-auto max-w-[180px] object-contain" />
                    </Link>

                    {/* 햄버거 메뉴 버튼 */}
                    <button
                        type="button"
                        ref={mobileToggle}
                        aria-expanded={mobileMenuOpen}
                        aria-controls="mobile-site-menu"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10"
                        aria-label={mobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
                    >
                        {mobileMenuOpen ? (
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* =======================
            (모바일) 펼쳐지는 메뉴
           ======================= */}
                {mobileMenuOpen && (
                    <div id="mobile-site-menu" ref={mobilePanel} className="mobile-menu-panel md:hidden" role="dialog" aria-modal="true" aria-label="전체 메뉴"
                        onKeyDown={e => {
                            if (e.key !== "Tab") return;
                            const items = Array.from(mobilePanel.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input') ?? []);
                            const first = items[0], last = items[items.length - 1];
                            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
                            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
                        }}>
                        <div className="mobile-menu-heading"><span>골프여행</span><button type="button" className="mobile-menu-close" onClick={() => { setMobileMenuOpen(false); mobileToggle.current?.focus(); }} aria-label="전체 메뉴 닫기">닫기 <span aria-hidden="true">×</span></button></div>
                        {themesQuery.isLoading ? <p role="status">여행지를 불러오는 중입니다.</p> : <CountryNavigation themes={themes} mobile />}
                        <form className="mobile-menu-search" onSubmit={e => { e.preventDefault(); goSearch(); setMobileMenuOpen(false); }} role="search">
                            <input aria-label="여행 상품 검색" value={q} onChange={e => setQ(e.target.value)} placeholder="검색어를 입력하세요" inputMode="search" enterKeyHint="search" />
                            <button type="submit" disabled={disabledSearch} aria-label="검색"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5" /></svg></button>
                        </form>
                        <Link to="/estimate" className="mobile-menu-estimate">1:1 맞춤견적 <span aria-hidden="true">↗</span></Link>
                        <div className="mobile-menu-utility"><Link to="/support">상담</Link><Link to="/notices">공지사항</Link><Link to="/faq">고객센터</Link><Link to={session ? "/me" : "/login"}>{session ? "마이메뉴" : "로그인"}</Link></div>
                        <div className="mobile-menu-social"><a href="https://pf.kakao.com/_qFxdqX" target="_blank" rel="noopener noreferrer" aria-label="카카오톡 채널"><img src={KakaoLogo} alt="" /></a><a href="https://www.instagram.com/chungwon.tour/" target="_blank" rel="noopener noreferrer" aria-label="인스타그램"><img src={InstaIcon} alt="" /></a><a href="https://blog.naver.com/chungwon87" target="_blank" rel="noopener noreferrer" aria-label="블로그"><img src={BlogIcon} alt="" /></a></div>
                    </div>
                )}

                {/* =======================
            (PC) 1줄: 로고 위 우측 메뉴 (현재 안 보이던 부분)
           ======================= */}
                <div className="header-tools hidden md:flex items-center justify-end gap-4 pt-3 pb-2 text-sm font-semibold text-white/90">
                    <Link to="/notices" className="hover:text-white">
                        공지사항
                    </Link>
                    <Link to="/faq" className="hover:text-white">
                        고객센터
                    </Link>

                    {session ? (
                        <Link to="/me" className="rounded-full bg-white/10 px-3 py-1 hover:bg-white/15">
                            마이메뉴 ▾
                        </Link>
                    ) : (
                        <Link to="/login" className="rounded-full bg-white/10 px-3 py-1 hover:bg-white/15">
                            로그인
                        </Link>
                    )}
                </div>

                {/* =======================
            2줄: 로고 영역 (PC 전용)
           ======================= */}
                <div className="header-brand hidden md:relative md:flex items-center justify-between pt-3 pb-6 md:pt-4 md:pb-10">
                    {/* PC 좌측 스페이서 */}
                    <div className="hidden md:block w-[260px]" aria-hidden="true" />

                    {/* 로고 */}
                    <Link
                        to="/"
                        aria-label="홈으로"
                        className={[
                            "flex items-center justify-center",
                            "w-auto",
                            "header-logo-anchor",
                            "pointer-events-auto",
                        ].join(" ")}
                    >
                        <BrandLogo src={logoUrl} className="h-11 md:h-20 w-auto max-w-[240px] md:max-w-[420px] object-contain" />
                    </Link>

                    {/* PC 우측: SNS */}
                    <div className="hidden md:flex w-[260px] items-center justify-end pr-2">
                        <div className="flex items-center gap-3">
                            <a
                                href="https://pf.kakao.com/_qFxdqX"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center"
                                aria-label="카카오톡 채널"
                                title="카카오톡 채널"
                            >
                                <img
                                    src={KakaoLogo}
                                    alt="KakaoTalk"
                                    className="h-7 w-7 object-contain opacity-90 hover:opacity-100"
                                    loading="eager"
                                />
                            </a>

                            <a
                                href="https://www.instagram.com/chungwon.tour/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center"
                                aria-label="인스타그램"
                                title="인스타그램"
                            >
                                <img
                                    src={InstaIcon}
                                    alt="Instagram"
                                    className="h-7 w-7 object-contain opacity-90 hover:opacity-100"
                                    loading="eager"
                                />
                            </a>

                            <a
                                href="https://blog.naver.com/chungwon87"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center"
                                aria-label="블로그"
                                title="블로그"
                            >
                                <img
                                    src={BlogIcon}
                                    alt="Blog"
                                    className="h-7 w-7 object-contain opacity-90 hover:opacity-100"
                                    loading="eager"
                                />
                            </a>
                        </div>
                    </div>

                </div>
            </div>

            {/* =======================
          3줄: 카테고리 + 검색/상담 (PC 전용)
         ======================= */}
            <div className="header-navigation hidden md:block">
                <nav className="mx-auto w-full max-w-[1400px] px-4 md:px-6">
                    <div className="header-nav-row flex flex-row items-center gap-4 pt-5">
                        {/* 카테고리 */}
                                                <div className="header-themes"><CountryNavigation themes={themes} /></div>

<div className="header-actions flex items-center gap-3 shrink-0 ml-auto justify-end">
                            <div className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-white/90">
                                <span className="text-sm">🔍</span>
                                <input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    className="w-[300px] bg-transparent text-sm placeholder:text-white/70 focus:outline-none"
                                    placeholder="검색어를 입력하세요"
                                    inputMode="search"
                                    enterKeyHint="search"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") goSearch();
                                    }}
                                />
                            </div>

                            <button
                                type="button"
                                className="whitespace-nowrap rounded-full bg-yellow-400 px-5 py-2 text-sm font-extrabold text-neutral-900 hover:bg-yellow-300"
                                onClick={() => navigate("/estimate")}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M8 4h8v4H8zM8 6H5v15h14V6h-3M8 12h8M8 16h5" strokeLinecap="round" strokeLinejoin="round" /></svg><span>1:1 맞춤견적</span>
                            </button>
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    );
}
