import React, { useRef, useState } from "react";
import { journeyStages } from "../data/demoData";
import { SparklesIcon, LayersIcon, TargetIcon, CheckCircleIcon, RefreshCwIcon, DatabaseIcon } from "./Icons";

export default function NegotiationJourney({ activeStageId = 4, onSelectStage }) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const getStageIcon = (type) => {
    switch (type) {
      case "quote":
        return LayersIcon;
      case "brain":
        return DatabaseIcon;
      case "sparkle":
        return SparklesIcon;
      case "target":
        return TargetIcon;
      case "check":
        return CheckCircleIcon;
      case "loop":
        return RefreshCwIcon;
      default:
        return SparklesIcon;
    }
  };

  const handleMouseDown = (e) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // multiplier for smooth speed
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <section id="journey" className="journey-section">
      <div className="journey-header-block">
        <div className="section-badge-pill">
          <RefreshCwIcon className="badge-icon text-blue" />
          <span>CONTINUOUS LEARNING LOOP</span>
        </div>
        <h2 className="section-title-large">The Negotiation Memory Journey</h2>
        <p className="section-desc-large">
          Drag horizontally or click any stage to explore how single conversations compound into persistent procurement intelligence.
        </p>
        <span className="drag-hint-badge">↔ DRAG TO EXPLORE STAGES</span>
      </div>

      {/* Draggable Track Container */}
      <div
        ref={containerRef}
        className={`journey-draggable-track ${isDragging ? "is-dragging" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="journey-cards-strip">
          {journeyStages.map((stage, idx) => {
            const Icon = getStageIcon(stage.icon);
            const isActive = stage.id === activeStageId;
            const isPassed = stage.id < activeStageId;

            return (
              <div
                key={stage.id}
                className={`journey-stage-card ${isActive ? "active-glow" : ""} ${
                  isPassed ? "completed-stage" : ""
                }`}
                onClick={() => onSelectStage && onSelectStage(stage.id)}
              >
                {/* Connecting Arrow between stages */}
                {idx < journeyStages.length - 1 && (
                  <div className="stage-connector-arrow">
                    <span className="arrow-line" />
                    <span className="arrow-head">›</span>
                  </div>
                )}

                <div className="stage-number-tag">
                  <span className="stage-num">0{stage.id}</span>
                  <span className="stage-tag-badge">{stage.tag}</span>
                </div>

                <div className={`stage-icon-circle ${isActive ? "active-orb" : ""}`}>
                  <Icon className="stage-icon" />
                </div>

                <h4 className="stage-card-title">{stage.title}</h4>
                <p className="stage-card-desc">{stage.desc}</p>

                {isActive && (
                  <div className="stage-active-indicator">
                    <span className="indicator-pulse" />
                    <span>Current Active Stage</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
