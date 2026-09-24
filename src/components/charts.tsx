import { skillKeys, type Skills } from "@/types/training";
import { skillShortLabels } from "@/data/students";

const labels = [
  "DP",
  "Graph",
  "Math",
  "Greedy",
  "Data Structure",
  "Implementation",
];
const point = (i: number, radius: number) => {
  const angle = (i * Math.PI) / 3 - Math.PI / 2;
  return [180 + Math.cos(angle) * radius, 140 + Math.sin(angle) * radius];
};
const polygon = (values: number[]) =>
  values.map((value, i) => point(i, value).join(",")).join(" ");

export function RadarChart({
  current,
  previous,
  compact = false,
}: {
  current: Skills;
  previous: Skills;
  compact?: boolean;
}) {
  return (
    <figure className={`radar-figure ${compact ? "compact" : ""}`}>
      <svg
        viewBox="0 0 360 285"
        role="img"
        aria-label="六维能力雷达图，实线为当前能力，虚线为 30 天前"
      >
        {[100, 80, 60, 40, 20].map((r) => (
          <polygon
            key={r}
            points={polygon(Array(6).fill(r))}
            fill={r === 100 ? "#f8f9fe" : "none"}
            stroke="#e3e7f1"
          />
        ))}
        {skillKeys.map((key, i) => {
          const [x, y] = point(i, 100);
          const [lx, ly] = point(i, 125);
          return (
            <g key={key}>
              <line x1="180" y1="140" x2={x} y2={y} stroke="#e3e7f1" />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#69738d"
                fontSize="11"
              >
                {labels[i]}
              </text>
            </g>
          );
        })}
        <polygon
          points={polygon(skillKeys.map((key) => previous[key]))}
          fill="none"
          stroke="#aab3c8"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <polygon
          points={polygon(skillKeys.map((key) => current[key]))}
          fill="#7564e5"
          fillOpacity=".18"
          stroke="#7564e5"
          strokeWidth="2.5"
        />
        {skillKeys.map((key, i) => {
          const [x, y] = point(i, current[key]);
          return (
            <circle
              key={key}
              cx={x}
              cy={y}
              r="3.5"
              fill="#7564e5"
              stroke="white"
              strokeWidth="2"
            />
          );
        })}
      </svg>
      <figcaption className="chart-legend">
        <span>
          <i className="dot violet" />
          当前能力
        </span>
        <span>
          <i className="dot muted" />
          30 天前
        </span>
      </figcaption>
      <span className="sr-only">
        {skillKeys
          .map(
            (key) =>
              `${skillShortLabels[key]}：当前 ${current[key]}，30 天前 ${previous[key]}`,
          )
          .join("；")}
      </span>
    </figure>
  );
}

export function TrendChart({ values }: { values: number[] }) {
  const width = 640,
    height = 170;
  const x = (i: number) => 28 + (i * (width - 56)) / (values.length - 1);
  const y = (v: number) => height - 24 - ((v - 15) / 85) * (height - 38);
  const path = values
    .map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`)
    .join(" ");
  return (
    <figure className="trend-figure">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`最近 8 周综合训练指数：${values.join("、")}`}
      >
        {[40, 60, 80].map((v) => (
          <g key={v}>
            <line
              x1="28"
              x2={width - 24}
              y1={y(v)}
              y2={y(v)}
              stroke="#e8ecf4"
              strokeDasharray="4 5"
            />
            <text x="0" y={y(v) + 4} fontSize="10" fill="#8a93a7">
              {v}
            </text>
          </g>
        ))}
        <path
          d={`${path} L${x(values.length - 1)},${height - 24} L28,${height - 24} Z`}
          fill="#7564e5"
          fillOpacity=".07"
        />
        <path
          d={path}
          fill="none"
          stroke="#7564e5"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {values.map((v, i) => (
          <g key={i}>
            <circle
              cx={x(i)}
              cy={y(v)}
              r={i === values.length - 1 ? 5 : 3}
              fill="#7564e5"
              stroke="white"
              strokeWidth="2"
            />
            <text
              x={x(i)}
              y={height - 5}
              fontSize="10"
              textAnchor="middle"
              fill="#8a93a7"
            >
              W{i + 1}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>
        模拟指数由知识掌握、独立完成与训练连续性构成，满分 100。
      </figcaption>
    </figure>
  );
}
