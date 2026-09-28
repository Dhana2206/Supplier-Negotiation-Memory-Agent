import React from "react";
import { BrainIcon, SparklesIcon } from "./Icons";

const STAGES = [
  { label: "RECALLING MEMORY...", sub: "Querying Hindsight bank for supplier records..." },
  { label: "Analyzing supplier history...", sub: "Retrieving previous price quotes and volume thresholds..." },
  { label: "Comparing previous outcomes...", sub: "Identifying negotiated concessions and agreements..." },
  { label: "Reflecting on negotiation patterns...", sub: "Evaluating behavioral leverage and pricing rigidity..." },
  { label: "Building negotiation strategy...", sub: "Formulating counter-offer and tactical scripts..." },
];

export default function AnalysisLoader({ stageIndex = 0 }) {
  const current = STAGES[Math.min(stageIndex, STAGES.length - 1)];
  const progressPercent = Math.round(((stageIndex + 1) / STAGES.length) * 100);

  return (
    <div className="analysis-loader-card glass-panel">
      <div className="loader-inner-content">
        {/* Pulsing Animated AI Core Icon */}
        <div className="loader-icon-orbit">
          <div className="loader-glow-ring" />
          <div className="loader-center-orb">
            <BrainIcon className="loader-brain-svg" />
          </div>
          <SparklesIcon className="loader-orbit-sparkle" />
        </div>

        {/* Dynamic Reasoning Stage Text */}
        <div className="loader-text-area">
          <span className="loader-stage-tag">AI REASONING IN PROGRESS</span>
          <h3 className="loader-stage-headline">{current.label}</h3>
          <p className="loader-stage-sub">{current.sub}</p>
        </div>

        {/* Progress Bar with Gradient */}
        <div className="loader-progress-track">
          <div
            className="loader-progress-bar"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Stage Step Indicators */}
        <div className="loader-step-dots">
          {STAGES.map((s, idx) => (
            <div
              key={idx}
              className={`loader-step-dot ${
                idx === stageIndex ? "current" : idx < stageIndex ? "completed" : "pending"
              }`}
            >
              <span className="dot-circle" />
              <span className="dot-name">Step {idx + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
