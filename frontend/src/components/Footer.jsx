import React from "react";
import { BrainIcon } from "./Icons";

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-top-row">
          <div className="footer-brand-column">
            <div className="footer-brand-title">
              <BrainIcon className="footer-brand-icon" />
              <span>Supplier Negotiation Memory Agent</span>
            </div>
            <p className="footer-brand-desc">
              Transforming every supplier conversation into compounding procurement leverage using Hindsight long-term AI memory.
            </p>
          </div>

          <div className="footer-stack-column">
            <span className="stack-label">ARCHITECTURE STACK</span>
            <div className="stack-badges">
              <span className="stack-badge">Hindsight Cloud Memory</span>
              <span className="stack-badge">FastAPI Co-Pilot Backend</span>
              <span className="stack-badge">Autonomous RECALL / REFLECT</span>
              <span className="stack-badge">React 19 Workspace</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom-row">
          <span className="footer-copy">
            Built for Hackathon MVP • Powered by Hindsight Memory Bank
          </span>
          <div className="footer-status-pill">
            <span className="footer-status-dot" />
            <span>Bank: Supplier-Negotiation-Memory-Agent</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
