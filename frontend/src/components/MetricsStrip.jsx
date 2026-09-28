import React from "react";
import { DatabaseIcon, TargetIcon, CheckCircleIcon, TrendingDownIcon } from "./Icons";

export default function MetricsStrip() {
  const metrics = [
    {
      label: "Supplier Memories",
      value: "12",
      sub: "Active memory units",
      icon: DatabaseIcon,
      color: "blue",
    },
    {
      label: "Negotiations Analyzed",
      value: "08",
      sub: "Repeat quotes processed",
      icon: TargetIcon,
      color: "violet",
    },
    {
      label: "Successful Concessions",
      value: "05",
      sub: "Discounts & free freight",
      icon: CheckCircleIcon,
      color: "emerald",
    },
    {
      label: "Negotiation Value Tracked",
      value: "₹2,45,000",
      sub: "Cumulative cost savings",
      icon: TrendingDownIcon,
      color: "amber",
    },
  ];

  return (
    <div className="metrics-strip-wrapper">
      <div className="metrics-context-bar">
        <span className="metrics-context-badge">
          <span className="metrics-context-dot" />
          Demo Workspace Metrics
        </span>
      </div>
      <div className="metrics-grid">
        {metrics.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="metric-cell">
              <div className={`metric-icon-box ${item.color}`}>
                <Icon className="metric-icon" />
              </div>
              <div className="metric-data-group">
                <span className="metric-value">{item.value}</span>
                <span className="metric-label">{item.label}</span>
                <span className="metric-sub">{item.sub}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
