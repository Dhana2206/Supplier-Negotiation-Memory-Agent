import React from "react";
import MemoryCore from "./MemoryCore";
import { SparklesIcon, ArrowRightIcon, DatabaseIcon } from "./Icons";

export default function Hero({
  mouseOffset,
  quote,
  memories = [],
  hasMemories = false,
  historyData,
  onStartNegotiation,
  onExploreMemory,
}) {
  return (
    <section className="hero-section">
      <div className="hero-content-grid">
        {/* Left Side: Headline & Value Proposition */}
        <div className="hero-text-column">
          <div className="copilot-badge">
            <SparklesIcon className="badge-sparkle-icon" />
            <span>AI PROCUREMENT COPILOT</span>
          </div>

          <h1 className="hero-main-title">
            Negotiate with <span className="title-gradient">memory.</span>
          </h1>

          <h2 className="hero-sub-title">
            Every supplier conversation becomes intelligence for the next negotiation.
          </h2>

          <p className="hero-description">
            Recall what worked. Understand supplier behavior. Negotiate with context.
            Transform repeat quotes into compounding procurement leverage powered by Hindsight.
          </p>

          <div className="hero-cta-group">
            <button
              type="button"
              className="btn-primary hero-btn-main"
              onClick={onStartNegotiation}
            >
              <span>Start Negotiation</span>
              <ArrowRightIcon className="btn-icon" />
            </button>

            <button
              type="button"
              className="btn-secondary hero-btn-sub"
              onClick={onExploreMemory}
            >
              <DatabaseIcon className="btn-icon" />
              <span>Explore Memory</span>
            </button>
          </div>

          {/* Micro trust indicators */}
          <div className="hero-trust-bar">
            <div className="trust-item">
              <span className="trust-dot" />
              <span>Continuous Hindsight RETAIN</span>
            </div>
            <div className="trust-item">
              <span className="trust-dot" />
              <span>Semantic Supplier RECALL</span>
            </div>
            <div className="trust-item">
              <span className="trust-dot" />
              <span>Behavioral REFLECT</span>
            </div>
          </div>
        </div>

        {/* Right Side: Visual Memory Core */}
        <div className="hero-visual-column">
          <MemoryCore
            mouseOffset={mouseOffset}
            quote={quote}
            memories={memories}
            hasMemories={hasMemories}
            historyData={historyData}
          />
        </div>
      </div>
    </section>
  );
}
