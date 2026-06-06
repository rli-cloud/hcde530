import { useEffect, useRef, useState } from "react";
import { WidgetDemo } from "@/components/WidgetDemo";
import { Dashboard } from "@/components/Dashboard";
import { hydrateFromChromeStorage } from "@/lib/storage";

const CENTER_SELECTOR =
  '[aria-label="Open Brain Bank dashboard"], [aria-label="Collapse menu"]';
const DRAG_THRESHOLD = 4; // px before a pointerdown becomes a drag

/**
 * Top-level widget mounted by the Chrome extension content script.
 * Defaults to the top-right corner; the user can drag the central node
 * anywhere on the page. Click (without dragging) opens the dashboard.
 */
export function ExtensionRoot() {
  const [dashboardOpen, setDashboardOpen] = useState(false);
  // `null` = use default top-right anchor. Otherwise absolute viewport coords.
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [centerPos, setCenterPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    moved: boolean;
  } | null>(null);

  useEffect(() => {
    void hydrateFromChromeStorage();
  }, []);

  // When expanded, compute and hold a centered position. Recompute on resize.
  useEffect(() => {
    if (!expanded) {
      setCenterPos(null);
      return;
    }
    const compute = () => {
      const el = wrapRef.current;
      const w = el?.offsetWidth ?? 56;
      const h = el?.offsetHeight ?? 56;
      setCenterPos({
        x: Math.round((window.innerWidth - w) / 2),
        y: Math.round((window.innerHeight - h) / 2),
      });
    };
    // Seed `pos` from the current rect so the transition animates
    // left/top consistently instead of jumping from a `right`-anchored
    // layout (which can't interpolate to `left`). When seeding, commit
    // the seed on this frame and the center on the next so the browser
    // has a "from" left/top to animate from.
    let raf = 0;
    if (pos === null) {
      const rect = wrapRef.current?.getBoundingClientRect();
      if (rect) setPos({ x: Math.round(rect.left), y: Math.round(rect.top) });
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(compute);
      });
    } else {
      compute();
    }
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("resize", compute);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [expanded]);

  const clamp = (x: number, y: number) => {
    const el = wrapRef.current;
    const w = el?.offsetWidth ?? 56;
    const h = el?.offsetHeight ?? 56;
    const maxX = window.innerWidth - w - 4;
    const maxY = window.innerHeight - h - 4;
    return {
      x: Math.min(Math.max(4, x), Math.max(4, maxX)),
      y: Math.min(Math.max(4, y), Math.max(4, maxY)),
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target?.closest(CENTER_SELECTOR)) return;
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: rect.left,
      origY: rect.top,
      moved: false,
    };

    const onMove = (ev: PointerEvent) => {
      const s = dragState.current;
      if (!s) return;
      const dx = ev.clientX - s.startX;
      const dy = ev.clientY - s.startY;
      if (!s.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      if (!s.moved) setDragging(true);
      s.moved = true;
      // Dragging breaks out of the centered anchor and sets a user position.
      setCenterPos(null);
      setPos(clamp(s.origX + dx, s.origY + dy));
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      const moved = dragState.current?.moved;
      dragState.current = null;
      setDragging(false);
      if (moved) {
        const swallow = (ev: MouseEvent) => {
          ev.stopPropagation();
          ev.preventDefault();
          window.removeEventListener("click", swallow, true);
        };
        window.addEventListener("click", swallow, true);
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // Priority: while expanded, sit centered. Otherwise, user-dragged position,
  // falling back to the default top-right anchor.
  const activePos = expanded ? centerPos ?? pos : pos;
  const transition = dragging
    ? "none"
    : "top 300ms cubic-bezier(0.25, 1, 0.5, 1), left 300ms cubic-bezier(0.25, 1, 0.5, 1), right 300ms cubic-bezier(0.25, 1, 0.5, 1)";
  const style: React.CSSProperties = activePos
    ? { top: activePos.y, left: activePos.x, transition }
    : { top: 24, right: 24, transition };

  return (
    <>
      {!dashboardOpen && (
        <div
          ref={wrapRef}
          onPointerDown={onPointerDown}
          style={style}
          className="pointer-events-auto fixed z-[2147483646] cursor-grab active:cursor-grabbing select-none touch-none"
        >
          <WidgetDemo
            embedded={false}
            onOpenDashboard={() => setDashboardOpen(true)}
            onExpandedChange={setExpanded}
          />
        </div>
      )}
      {dashboardOpen && (
        <Dashboard windowed onClose={() => setDashboardOpen(false)} />
      )}
    </>
  );
}


