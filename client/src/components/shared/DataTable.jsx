import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ── Sort icon ─────────────────────────────────────────────
const SortIcon = ({ state }) => {
  if (state === "asc")  return <ChevronUp   size={12} className="text-[#5B73FF]" />;
  if (state === "desc") return <ChevronDown  size={12} className="text-[#5B73FF]" />;
  return <ChevronsUpDown size={12} className="text-white/20 group-hover:text-white/40" />;
};

// ── Empty state ───────────────────────────────────────────
const EmptyState = ({ query }) => (
  <tr>
    <td colSpan={100}>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="
          w-10 h-10 rounded-xl mb-3
          bg-white/[0.04] border border-white/[0.06]
          flex items-center justify-center
        ">
          <Search size={16} className="text-white/20" />
        </div>
        <p className="text-[13px] font-medium text-white/40">
          {query ? `No results for "${query}"` : "No data available"}
        </p>
        <p className="text-[12px] text-white/20 mt-1">
          {query ? "Try adjusting your search" : "Data will appear here once added"}
        </p>
      </div>
    </td>
  </tr>
);

// ── DataTable ─────────────────────────────────────────────
// Props:
//   columns   — array of { key, label, sortable?, width? }
//   data      — array of row objects
//   pageSize  — rows per page (default 10)
//   searchable — show search bar (default true)
//   title     — optional table title
//   subtitle  — optional subtitle
const DataTable = ({
  columns    = [],
  data       = [],
  pageSize   = 10,
  searchable = true,
  title,
  subtitle,
}) => {
  const [query,       setQuery]       = useState("");
  const [sortKey,     setSortKey]     = useState(null);
  const [sortDir,     setSortDir]     = useState("asc");
  const [page,        setPage]        = useState(1);

  // ── Search filter ──
  const filtered = data.filter((row) => {
    if (!query.trim()) return true;
    return Object.values(row).some((val) =>
      String(val ?? "").toLowerCase().includes(query.toLowerCase())
    );
  });

  // ── Sort ──
  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const aVal = a[sortKey] ?? "";
        const bVal = b[sortKey] ?? "";
        const cmp  = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      })
    : filtered;

  // ── Pagination ──
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const paginated  = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSort = (key) => {
    if (!key) return;
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const handleSearch = (e) => {
    setQuery(e.target.value);
    setPage(1);
  };

  return (
    <div className="
      bg-[#1A1A24]
      border border-white/[0.07]
      rounded-2xl
      overflow-hidden
    ">
      {/* ── Header ── */}
      {(title || searchable) && (
        <div className="
          flex items-center justify-between gap-4
          px-5 py-4
          border-b border-white/[0.05]
        ">
          {/* Title */}
          {title && (
            <div className="flex-1 min-w-0">
              <h3 className="text-[14px] font-semibold text-white/90 leading-none truncate">
                {title}
              </h3>
              {subtitle && (
                <p className="text-[11px] text-white/35 mt-0.5 leading-none">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Right: search + count */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Row count badge */}
            <span className="
              text-[11px] font-medium tabular-nums
              text-white/30
              hidden sm:block
            ">
              {filtered.length} {filtered.length === 1 ? "row" : "rows"}
            </span>

            {/* Search */}
            {searchable && (
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
                />
                <input
                  type="text"
                  value={query}
                  onChange={handleSearch}
                  placeholder="Search..."
                  className="
                    h-8 pl-8 pr-3 w-48
                    bg-[#111118] border border-white/[0.07]
                    rounded-lg
                    text-[12px] text-white/70
                    placeholder:text-white/20
                    outline-none
                    focus:border-[#5B73FF]/50
                    focus:ring-2 focus:ring-[#5B73FF]/10
                    transition-all duration-150
                  "
                />
              </div>
            )}

            {/* Filter icon — wire to your filter panel */}
            <button
              aria-label="Filter"
              className="
                flex items-center justify-center
                w-8 h-8 rounded-lg
                text-white/25 hover:text-white/60
                hover:bg-white/[0.06]
                border border-white/[0.06]
                transition-colors duration-150
              "
            >
              <SlidersHorizontal size={13} />
            </button>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Head */}
          <thead>
            <tr className="border-b border-white/[0.05]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`
                    group
                    px-5 py-3 text-left
                    text-[11px] font-semibold
                    text-white/30
                    uppercase tracking-widest
                    select-none whitespace-nowrap
                    ${col.sortable
                      ? "cursor-pointer hover:text-white/60 transition-colors duration-150"
                      : ""
                    }
                  `}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && (
                      <SortIcon
                        state={sortKey === col.key ? sortDir : null}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            <AnimatePresence mode="wait">
              {paginated.length === 0 ? (
                <EmptyState key="empty" query={query} />
              ) : (
                paginated.map((row, rowIdx) => (
                  <motion.tr
                    key={rowIdx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15, delay: rowIdx * 0.02 }}
                    className="
                      group
                      border-b border-white/[0.04]
                      last:border-b-0
                      hover:bg-white/[0.03]
                      transition-colors duration-100
                    "
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="
                          px-5 py-3.5
                          text-[13px] text-white/60
                          group-hover:text-white/80
                          transition-colors duration-100
                          whitespace-nowrap
                        "
                      >
                        {row[col.key] ?? (
                          <span className="text-white/20">—</span>
                        )}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="
          flex items-center justify-between
          px-5 py-3
          border-t border-white/[0.05]
          bg-white/[0.01]
        ">
          {/* Info */}
          <p className="text-[11px] text-white/25 tabular-nums">
            Showing{" "}
            <span className="text-white/50 font-medium">
              {(safePage - 1) * pageSize + 1}–
              {Math.min(safePage * pageSize, sorted.length)}
            </span>
            {" "}of{" "}
            <span className="text-white/50 font-medium">{sorted.length}</span>
          </p>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              aria-label="Previous page"
              className="
                flex items-center justify-center
                w-7 h-7 rounded-lg
                text-white/30 hover:text-white/70
                hover:bg-white/[0.06]
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-colors duration-150
              "
            >
              <ChevronLeft size={14} />
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) =>
                p === 1 ||
                p === totalPages ||
                Math.abs(p - safePage) <= 1
              )
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) {
                  acc.push("…");
                }
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "…" ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-7 text-center text-[12px] text-white/20"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`
                      w-7 h-7 rounded-lg text-[12px] font-medium
                      transition-all duration-150
                      ${safePage === p
                        ? "bg-[#5B73FF]/15 text-[#5B73FF]"
                        : "text-white/30 hover:text-white/70 hover:bg-white/[0.06]"
                      }
                    `}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              aria-label="Next page"
              className="
                flex items-center justify-center
                w-7 h-7 rounded-lg
                text-white/30 hover:text-white/70
                hover:bg-white/[0.06]
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-colors duration-150
              "
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;