import React from "react";
import { SparklesIcon, TargetIcon, ShieldCheckIcon } from "./Icons";

export default function AIStrategy({ strategy, hasMemories = true, onUseCounterOffer }) {
  if (!strategy) return null;

  const isMemoryBacked = Boolean(strategy.hasMemories ?? hasMemories);

  return (
    <div className="ai-strategy-card glass-panel highlight-border">
      {/* Header */}
      <div className="strategy-header-row">
        <div className="strategy-title-group">
          <div className={`section-badge-pill ${isMemoryBacked ? "emerald" : "blue"}`}>
            <SparklesIcon className={`badge-icon ${isMemoryBacked ? "text-emerald" : "text-blue"}`} />
            <span>
              {strategy.badgeText || (isMemoryBacked ? "LIVE HINDSIGHT REFLECTION" : "FIRST-INTERACTION AI STRATEGY")}
            </span>
          </div>
          <h3 className="section-heading">AI Negotiation Strategy</h3>
          <p className="section-subtext">
            {strategy.subtext ||
              (isMemoryBacked
                ? "Synthesized in real-time from Hindsight memory bank via autonomous REFLECT engine"
                : "No prior memories on record — strategy formulated from current quote economics and volume commitment")}
          </p>
        </div>

        <div className={`strategy-ai-pill ${strategy.isLive ? "live" : ""}`}>
          <span className={`ai-status-pulse ${strategy.isLive ? "live" : ""}`} />
          <span>
            {strategy.isLive
              ? (isMemoryBacked ? "Live Hindsight Engine" : "Current-Context Engine")
              : "AI Strategy Engine"}
          </span>
        </div>
      </div>

      {/* Suggested Counter-Offer Feature Callout */}
      <div className="counter-callout-hero">
        <div className="callout-left">
          <span className="callout-label">
            {isMemoryBacked ? "SUGGESTED COUNTER-OFFER" : "PROPOSED OPENING COUNTER"}
          </span>
          <div className="callout-main-price">
            {strategy.suggestedCounter}
          </div>
          <p className="callout-subtext">
            {strategy.calloutSubtext ||
              (isMemoryBacked
                ? "Anchored to verified historical concessions and current batch volume"
                : "Formulated from current quote economics and volume leverage")}
          </p>
        </div>

        <div className="callout-right">
          <button
            type="button"
            className="btn-primary btn-use-counter"
            onClick={onUseCounterOffer}
          >
            <span>Use Counter Offer</span>
          </button>
        </div>
      </div>

      {/* Strategy Content Blocks Grid */}
      <div className="strategy-grid-blocks">
        {/* Block 1: Historical Benchmark / Contextual Baseline */}
        <div className="strategy-block-card">
          <div className="block-title-row">
            <span className="block-number">01</span>
            <span className="block-title">
              {strategy.benchmarkTitle || (isMemoryBacked ? "Historical Benchmark" : "Contextual Baseline")}
            </span>
          </div>
          <p className="block-content-text">{strategy.benchmark}</p>
        </div>

        {/* Block 2: Supplier Behavioral Pattern / First-Interaction Profile */}
        <div className="strategy-block-card">
          <div className="block-title-row">
            <span className="block-number">02</span>
            <span className="block-title">
              {strategy.patternTitle || (isMemoryBacked ? "Supplier Behavioral Pattern" : "First-Interaction Profile")}
            </span>
          </div>
          <p className="block-content-text">{strategy.pattern}</p>
        </div>
      </div>

      {/* Block 3: Negotiation Levers */}
      <div className="strategy-levers-section">
        <div className="levers-header">
          <TargetIcon className="mini-icon text-blue" />
          <span className="levers-title">Actionable Negotiation Levers</span>
        </div>

        <div className="levers-chips-grid">
          {strategy.levers &&
            strategy.levers.map((lever, idx) => (
              <div key={idx} className="lever-chip-card">
                <span className="lever-name">{lever.label}</span>
                <span className="lever-desc">{lever.value}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Block 4: Recommended Next Move (Tactical Script / Reflection) */}
      <div className={`recommended-move-box ${strategy.isLive ? "live" : ""}`}>
        <div className="move-title-row">
          <ShieldCheckIcon className="move-icon text-emerald" />
          <span className="move-heading">
            {strategy.recommendedMoveTitle ||
              (isMemoryBacked
                ? (strategy.isLive ? "Live Hindsight Tactical Strategy & Recommendation" : "Recommended Next Move (Tactical Script)")
                : "Current-Context Strategy Recommendation")}
          </span>
          {strategy.isLive && (
            <span
              className={`step-tag-pill ${isMemoryBacked ? "green" : "blue"}`}
              style={{ marginLeft: "auto", fontSize: "11px" }}
            >
              {isMemoryBacked ? "LIVE HINDSIGHT REFLECT" : "CURRENT-CONTEXT REFLECT"}
            </span>
          )}
        </div>
        <p className="move-body-text" style={{ whiteSpace: "pre-line" }}>
          {strategy.recommendedMove}
        </p>
      </div>
    </div>
  );
}
