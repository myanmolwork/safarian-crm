import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown, BarChart2 } from "lucide-react";

// ── Custom Tooltip ────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="
      bg-[#1A1A24] border border-white/[0.10]
      rounded-xl px-3 py-2.5
      shadow-xl shadow-black/40
    ">
      <p className="text-[11px] text-white/40 font-medium uppercase tracking-widest mb-1">
        {label}
      </p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-[14px] font-semibold text-white/90 tabular-nums">
          {entry.value}
          <span className="text-[11px] font-normal text-white/35 ml-1">
            {entry.dataKey === "tasks"
              ? "tasks"
              : entry.dataKey === "attendance"
              ? "% present"
              : entry.dataKey === "reports"
              ? "reports"
              : ""}
          </span>
        </p>
      ))}
    </div>
  );
};

// ── Custom Bar shape with rounded top only ────────────────
const RoundedBar = (props) => {
  const { x, y, width, height, fill } = props;
  if (!height || height <= 0) return null;
  const r = 4;
  return (
    <path
      d={`
        M${x},${y + height}
        L${x},${y + r}
        Q${x},${y} ${x + r},${y}
        L${x + width - r},${y}
        Q${x + width},${y} ${x + width},${y + r}
        L${x + width},${y + height}
        Z
      `}
      fill={fill}
    />
  );
};

// ── Delta badge ───────────────────────────────────────────
const DeltaBadge = ({ value }) => {
  if (value === null || value === undefined) return null;
  const isUp = value >= 0;
  return (
    <span className={`
      inline-flex items-center gap-1
      text-[11px] font-medium
      px-2 py-0.5 rounded-md
      ${isUp
        ? "bg-[#22C97B]/10 text-[#22C97B]"
        : "bg-[#F43F5E]/10 text-[#F43F5E]"
      }
    `}>
      {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {isUp ? "+" : ""}{value}% vs last week
    </span>
  );
};

// ── Tab button ────────────────────────────────────────────
const ChartTab = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`
      px-3 py-1.5 rounded-lg text-[12px] font-medium
      transition-all duration-150
      ${active
        ? "bg-[#5B73FF]/15 text-[#5B73FF]"
        : "text-white/30 hover:text-white/60 hover:bg-white/[0.05]"
      }
    `}
  >
    {children}
  </button>
);

// ── Chart configs ─────────────────────────────────────────
const CHART_CONFIGS = {
  tasks: {
    label:    "Task Completion",
    dataKey:  "tasks",
    color:    "#5B73FF",
    dimColor: "rgba(91,115,255,0.25)",
  },
  attendance: {
    label:    "Attendance Rate",
    dataKey:  "attendance",
    color:    "#22C97B",
    dimColor: "rgba(34,201,123,0.25)",
  },
  reports: {
    label:    "Daily Reports",
    dataKey:  "reports",
    color:    "#A78BFA",
    dimColor: "rgba(167,139,250,0.25)",
  },
};

// ── AnalyticsChart ────────────────────────────────────────
const AnalyticsChart = ({
  data       = [],
  delta      = {},
  summary    = {},
  activeTab: defaultTab = "tasks",
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab); // ✅ fixed

  const config   = CHART_CONFIGS[activeTab];
  const maxValue = Math.max(...data.map((d) => d[config.dataKey] ?? 0), 1);

  return (
    <div className="
      bg-[#1A1A24]
      border border-white/[0.07]
      rounded-2xl
      overflow-hidden
    ">
      {/* ── Header ── */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#5B73FF]/15">
            <BarChart2 size={15} className="text-[#5B73FF]" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-white/90 leading-none">
              Productivity Overview
            </h2>
            <p className="text-[11px] text-white/35 mt-0.5 leading-none">
              Weekly performance breakdown
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg p-1 border border-white/[0.05]">
          {Object.entries(CHART_CONFIGS).map(([key, cfg]) => (
            <ChartTab
              key={key}
              active={activeTab === key}
              onClick={() => setActiveTab(key)}
            >
              {cfg.label}
            </ChartTab>
          ))}
        </div>
      </div>

      {/* ── Summary strip ── */}
      <div className="grid grid-cols-3 divide-x divide-white/[0.05] border-b border-white/[0.05]">
        {Object.entries(CHART_CONFIGS).map(([key, cfg]) => (
          <div
            key={key}
            onClick={() => setActiveTab(key)}
            className={`
              flex flex-col gap-1 px-5 py-3 cursor-pointer
              transition-colors duration-150
              ${activeTab === key ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"}
            `}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25">
              {cfg.label}
            </p>
            <p
              className="text-[20px] font-semibold tabular-nums leading-none"
              style={{ color: activeTab === key ? cfg.color : "rgba(255,255,255,0.4)" }}
            >
              {summary[key] ?? "—"}
              {key === "attendance" && (
                <span className="text-[13px] font-normal">%</span>
              )}
            </p>
            <DeltaBadge value={delta[key]} />
          </div>
        ))}
      </div>

      {/* ── Chart ── */}
      <div className="px-5 pt-5 pb-4 h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            barSize={28}
            margin={{ top: 4, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="0"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                fill:       "rgba(255,255,255,0.30)",
                fontSize:   11,
                fontWeight: 500,
              }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill:     "rgba(255,255,255,0.25)",
                fontSize: 11,
              }}
              width={36}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.03)", radius: 6 }}
            />
            <Bar
              dataKey={config.dataKey}
              shape={<RoundedBar />}
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry, index) => {
                const val   = entry[config.dataKey] ?? 0;
                const isMax = val === maxValue;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isMax ? config.color : config.dimColor}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Footer legend ── */}
      <div className="flex items-center justify-between px-5 pb-4">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: config.color }}
          />
          <span className="text-[11px] text-white/30">
            {config.label} · Highest bar highlighted
          </span>
        </div>
        <span className="text-[11px] text-white/20">This week</span>
      </div>
    </div>
  );
};

export default AnalyticsChart;