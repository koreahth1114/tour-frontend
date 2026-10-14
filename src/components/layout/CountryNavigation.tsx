import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listAreasByTheme } from "../../api/areas.api";
import type { ThemeRow } from "../../api/themes.api";

function RegionName({ name }: { name: string }) {
    const parts = name.match(/^(.+?)\s+([A-Za-z].*)$/);
    return <span className="region-name">{parts ? <><span>{parts[1]}</span><small>{parts[2]}</small></> : name}</span>;
}

function CountryItem({ theme, open, setOpen, mobile, active }: {
    theme: ThemeRow; open: boolean; setOpen: (id: string | null) => void; mobile: boolean; active: boolean;
}) {
    const trigger = useRef<HTMLButtonElement>(null);
    const panelId = `country-${mobile ? "mobile" : "desktop"}-${theme.id}`;
    const areas = useQuery({
        queryKey: ["areas", "active", theme.id],
        queryFn: () => listAreasByTheme(theme.id),
        enabled: open,
        staleTime: 5 * 60_000,
    });
    const base = `/theme/${encodeURIComponent(theme.slug)}`;
    return <div className="country-item" data-open={open || undefined}
        onPointerEnter={e => { if (!mobile && e.pointerType === "mouse") setOpen(theme.id); }}
        onPointerLeave={e => { if (!mobile && e.pointerType === "mouse" && !e.currentTarget.contains(document.activeElement)) setOpen(null); }}
        onBlur={e => { if (!mobile && !e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(null); }}
        onKeyDown={e => {
            if (e.key === "Escape" && !mobile && open) { e.stopPropagation(); trigger.current?.focus(); setOpen(null); }
            if (e.key === "ArrowDown" && e.target === trigger.current) {
                e.preventDefault(); setOpen(theme.id);
                requestAnimationFrame(() => document.getElementById(panelId)?.querySelector<HTMLAnchorElement>("a")?.focus());
            }
        }}>
        <button ref={trigger} type="button" className="country-trigger" data-active={active || undefined}
            aria-expanded={open} aria-controls={panelId}
            onFocus={e => { if (!mobile && e.currentTarget.matches(":focus-visible")) setOpen(theme.id); }}
            onClick={() => setOpen(mobile && open ? null : theme.id)}>
            <span>{theme.name}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </button>
        {open && <div id={panelId} className="country-panel">
            <div className="country-panel-inner">
                <Link className="country-all" to={base}><span className="country-overview"><strong>{theme.name}</strong><small>전체보기</small></span><span aria-hidden="true">↗</span></Link>
                {areas.isPending ? <p role="status">지역을 불러오는 중입니다.</p> : areas.isError ?
                    <div className="country-error"><p>지역을 불러오지 못했습니다.</p><button type="button" onClick={() => areas.refetch()}>다시 시도</button></div> :
                    areas.data?.length ? <div className="country-regions">{areas.data.map(area =>
                        <Link key={area.id} to={`${base}?${new URLSearchParams({ area: area.slug })}`}><RegionName name={area.name} /><span className="region-arrow" aria-hidden="true">→</span></Link>
                    )}</div> : <p>등록된 지역이 없습니다.</p>}
            </div>
        </div>}
    </div>;
}

export default function CountryNavigation({ themes, mobile = false }: { themes: ThemeRow[]; mobile?: boolean }) {
    const [open, setOpen] = useState<string | null>(null);
    const root = useRef<HTMLDivElement>(null);
    const location = useLocation();
    useEffect(() => { setOpen(null); }, [location.pathname, location.search]);
    useEffect(() => {
        if (!open) return;
        const outside = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(null); };
        document.addEventListener("pointerdown", outside);
        return () => document.removeEventListener("pointerdown", outside);
    }, [open]);
    return <div ref={root} className={`country-navigation ${mobile ? "country-mobile" : "country-desktop"}`}>
        {themes.map(theme => <CountryItem key={theme.id} theme={theme} mobile={mobile}
            open={open === theme.id} setOpen={setOpen}
            active={decodeURIComponent(location.pathname) === `/theme/${theme.slug}`} />)}
    </div>;
}
