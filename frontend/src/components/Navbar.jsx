import React, { useState, useEffect } from "react";
import { BrainIcon } from "./Icons";

export default function Navbar({ isBackendLive, activeSection, onSelectSection }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    onSelectSection?.(id);

    // Catalog switches the rendered view, so wait for its target (or the
    // workspace being restored) to mount before resolving the scroll target.
    const needsViewTransition = activeSection === "catalog" || id === "catalog";
    const scrollToTarget = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    if (needsViewTransition) {
      window.setTimeout(scrollToTarget, 100);
    } else {
      scrollToTarget();
    }
  };

  return (
    <header className={`sticky-nav ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        {/* Left: Brand */}
        <div className="nav-brand" onClick={() => scrollTo("workspace")}>
          <div className="brand-icon-wrapper">
            <BrainIcon className="brand-icon" />
            <span className="brand-pulse-ring" />
          </div>
          <div className="brand-text-group">
            <span className="brand-title">Negotiation Memory</span>
            <span className="brand-badge">AI AGENT</span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="nav-links">
          <button
            type="button"
            className={`nav-link ${activeSection === "workspace" || activeSection === "analyze" ? "active" : ""}`}
            onClick={() => scrollTo("workspace")}
          >
            Analyze
          </button>
          <button
            type="button"
            className={`nav-link ${activeSection === "catalog" ? "active" : ""}`}
            onClick={() => scrollTo("catalog")}
          >
            Catalog
          </button>
          <button
            type="button"
            className={`nav-link ${activeSection === "memory-recall" ? "active" : ""}`}
            onClick={() => scrollTo("memory-recall")}
          >
            Memory
          </button>
          <button
            type="button"
            className={`nav-link ${activeSection === "journey" ? "active" : ""}`}
            onClick={() => scrollTo("journey")}
          >
            Journey
          </button>
          <button
            type="button"
            className={`nav-link ${activeSection === "suppliers" ? "active" : ""}`}
            onClick={() => scrollTo("suppliers")}
          >
            Intelligence
          </button>
          <button
            type="button"
            className={`nav-link ${activeSection === "outcome" ? "active" : ""}`}
            onClick={() => scrollTo("outcome")}
          >
            Close Deal
          </button>
        </nav>

        {/* Right: Status Indicator */}
        <div className="nav-status-badge">
          <span className={`status-dot ${isBackendLive ? "live" : "ready"}`} />
          <span className="status-text">
            {isBackendLive ? "HINDSIGHT LIVE" : "MEMORY ONLINE"}
          </span>
        </div>
      </div>
    </header>
  );
}
