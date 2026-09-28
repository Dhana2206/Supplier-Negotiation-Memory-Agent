import React from "react";
import { DatabaseIcon, SparklesIcon, CheckCircleIcon, RefreshCwIcon, TargetIcon } from "./Icons";

export default function MemoryActivity({ activities = [] }) {
  const getIcon = (type) => {
    switch (type) {
      case "recall":
        return DatabaseIcon;
      case "reflect":
        return SparklesIcon;
      case "strategy":
        return TargetIcon;
      case "retain":
        return CheckCircleIcon;
      default:
        return RefreshCwIcon;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case "recall":
        return "text-blue";
      case "reflect":
        return "text-violet";
      case "strategy":
        return "text-amber";
      case "retain":
        return "text-emerald";
      default:
        return "text-cyan";
    }
  };

  return (
    <div className="activity-panel glass-panel">
      <div className="activity-header">
        <div className="activity-title-row">
          <span className="activity-live-dot" />
          <h4 className="activity-title">Live Memory Activity</h4>
        </div>
        <span className="activity-count-tag">{activities.length} Events</span>
      </div>

      <div className="activity-events-list">
        {activities.map((item) => {
          const Icon = getIcon(item.type);
          const colorClass = getColor(item.type);
          return (
            <div key={item.id} className="activity-event-row">
              <div className="event-icon-cell">
                <Icon className={`event-icon ${colorClass}`} />
              </div>
              <div className="event-content-cell">
                <span className="event-text">{item.text}</span>
                <span className="event-time">{item.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
