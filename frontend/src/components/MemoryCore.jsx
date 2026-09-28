import React from "react";
import { BrainIcon, SparklesIcon, CheckCircleIcon, DatabaseIcon } from "./Icons";

function extractHeroBenchmark(memories, historyData, isTechCore) {
  if (isTechCore && historyData?.successfulPrice) {
    return {
      previousQuote: historyData.previousQuote || "₹192/unit",
      successfulPrice: historyData.successfulPrice || "₹178/unit",
      concession: "Volume-Based Concession",
      deliveryConcession: "100% Free Delivery",
      deliverySub: historyData.orderSize
        ? `Waived on orders ≥ ${historyData.orderSize}`
        : "Waived on volume orders",
    };
  }

  let finalPrice = null;
  let prevQuote = null;
  let concession = null;
  let deliveryConcession = null;
  let deliverySub = null;

  for (const item of memories || []) {
    const text = typeof item === "string" ? item : item.text || JSON.stringify(item);

    const fpMatch =
      text.match(/Final Price:\s*₹?([0-9,.]+)/i) ||
      text.match(/(?:agreed|conceded|closed)\s*(?:at|to)?\s*₹([0-9,.]+)/i) ||
      text.match(/(?:at|price of)\s*₹\s*([0-9,.]+)/i) ||
      text.match(/₹\s*([0-9,.]+)\s*(?:per|\/)\s*unit/i);
    if (fpMatch && !finalPrice) finalPrice = `₹${fpMatch[1]}/unit`;

    const pqMatch =
      text.match(/Previous Quote:\s*₹?([0-9,.]+)/i) ||
      text.match(/initial quote was\s*₹?([0-9,.]+)/i) ||
      text.match(/(?:quoted|asking)\s*(?:.*?at)?\s*₹([0-9,.]+)/i);
    if (pqMatch && !prevQuote) prevQuote = `₹${pqMatch[1]}/unit`;

    if (/free delivery|free freight|waive.*freight|delivery fee:\s*₹?0/i.test(text)) {
      deliveryConcession = "100% Free Delivery";
      deliverySub = "Logistics fee waiver secured";
    }

    const concMatch =
      text.match(/Successful Concession:\s*(.+)/i) || text.match(/concession:\s*(.+)/i);
    if (concMatch && !concession) concession = concMatch[1].trim();
  }

  return {
    previousQuote: prevQuote,
    successfulPrice:
      finalPrice ||
      (historyData?.successfulPrice && isTechCore ? historyData.successfulPrice : null),
    concession: concession || "Historical Concession",
    deliveryConcession: deliveryConcession || (finalPrice ? "Price Reduction Secured" : null),
    deliverySub: deliverySub || (finalPrice ? "Agreed in previous negotiation" : null),
  };
}

export default function MemoryCore({
  mouseOffset = { x: 0, y: 0 },
  quote,
  memories = [],
  hasMemories = false,
  historyData,
}) {
  // Parallax offsets
  const coreX = mouseOffset.x * 20;
  const coreY = mouseOffset.y * 20;
  const card1X = mouseOffset.x * -25;
  const card1Y = mouseOffset.y * -20;
  const card2X = mouseOffset.x * 30;
  const card2Y = mouseOffset.y * -15;
  const card3X = mouseOffset.x * -20;
  const card3Y = mouseOffset.y * 25;
  const card4X = mouseOffset.x * 25;
  const card4Y = mouseOffset.y * 20;

  const displaySupplier = quote?.supplier?.trim() || "Supplier";
  const displayProduct = quote?.product?.trim() || "Product";
  const formattedQty = Number(quote?.quantity || 1).toLocaleString();
  const displayUnit = quote?.unit
    ? quote.unit.charAt(0).toUpperCase() + quote.unit.slice(1)
    : "Units";

  const isTechCore =
    Boolean(quote?.supplier?.toLowerCase().includes("techcore")) &&
    Boolean(quote?.product?.toLowerCase().includes("microcontroller"));

  const benchmarkInfo = hasMemories
    ? extractHeroBenchmark(memories, historyData, isTechCore)
    : null;

  const memoryCount = memories?.length || (isTechCore ? 3 : 0);

  return (
    <div className="memory-core-wrapper">
      {/* Ambient background glow inside the core */}
      <div className="core-ambient-glow" />

      {/* SVG Circuit Lines connecting core to memory nodes */}
      <svg className="core-connection-svg" viewBox="0 0 500 440">
        <defs>
          <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="lineGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Lines from center (250, 220) to orbital nodes */}
        <path
          d="M250,220 Q160,140 100,90"
          stroke="url(#lineGrad1)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="4 4"
          className="circuit-line"
        />
        <path
          d="M250,220 Q360,130 400,80"
          stroke="url(#lineGrad2)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="4 4"
          className="circuit-line delay-1"
        />
        <path
          d="M250,220 Q150,300 90,340"
          stroke="url(#lineGrad1)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="4 4"
          className="circuit-line delay-2"
        />
        <path
          d="M250,220 Q370,310 410,340"
          stroke="url(#lineGrad2)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="4 4"
          className="circuit-line delay-3"
        />
      </svg>

      {/* Central Pulsing AI Brain Core */}
      <div
        className="central-ai-node"
        style={{
          transform: `translate3d(${coreX}px, ${coreY}px, 0)`,
        }}
      >
        <div className="node-orbit ring-outer" />
        <div className="node-orbit ring-mid" />
        <div className="node-orbit ring-inner" />
        <div className="node-core-sphere">
          <BrainIcon className="node-brain-icon" />
          <div className="node-reflection-light" />
        </div>
        <div className="node-pulse-halo" />
        <div className="node-core-label">
          <span className="node-tag">HINDSIGHT BANK</span>
          <span className="node-name">{displaySupplier} Memory</span>
        </div>
      </div>

      {/* Floating Memory Node 1: Top-Left (Supplier Identity & Volume) */}
      <div
        className="floating-memory-card card-top-left"
        style={{
          transform: `translate3d(${card1X}px, ${card1Y}px, 0)`,
        }}
      >
        <div className="card-header-mini">
          <DatabaseIcon className="mini-icon text-blue" />
          <span className="mini-label">RECALLED ENTITY</span>
        </div>
        <div className="card-title-bold">{displaySupplier}</div>
        <div className="card-sub-pill">
          {displayProduct} • {formattedQty} {displayUnit}
        </div>
      </div>

      {/* Floating Memory Node 2: Top-Right (Previous Benchmark) */}
      <div
        className="floating-memory-card card-top-right"
        style={{
          transform: `translate3d(${card2X}px, ${card2Y}px, 0)`,
        }}
      >
        <div className="card-header-mini">
          <DatabaseIcon className={`mini-icon ${hasMemories ? "text-emerald" : "text-amber"}`} />
          <span className="mini-label">AGREED BENCHMARK</span>
        </div>
        {hasMemories && benchmarkInfo?.successfulPrice ? (
          <>
            <div className="card-price-row">
              {benchmarkInfo.previousQuote && (
                <>
                  <span className="old-price">{benchmarkInfo.previousQuote}</span>
                  <span className="arrow-sep">→</span>
                </>
              )}
              <span className="win-price">{benchmarkInfo.successfulPrice}</span>
            </div>
            <div className="card-tag-green">
              {benchmarkInfo.concession || "Historical Benchmark"}
            </div>
          </>
        ) : (
          <>
            <div className="card-price-row">
              <span
                className="win-price text-dim"
                style={{ fontSize: "14px", fontWeight: 600, color: "#94a3b8" }}
              >
                No Historical Benchmark
              </span>
            </div>
            <div className="card-sub-muted" style={{ marginTop: "3px" }}>
              First interaction on record
            </div>
          </>
        )}
      </div>

      {/* Floating Memory Node 3: Bottom-Left (Key Concession) */}
      <div
        className="floating-memory-card card-bottom-left"
        style={{
          transform: `translate3d(${card3X}px, ${card3Y}px, 0)`,
        }}
      >
        <div className="card-header-mini">
          <CheckCircleIcon className={`mini-icon ${hasMemories ? "text-emerald" : "text-muted"}`} />
          <span className="mini-label">ESTABLISHED CONCESSION</span>
        </div>
        {hasMemories && benchmarkInfo?.deliveryConcession ? (
          <>
            <div className="card-concession-text">
              <span className="highlight-emerald">{benchmarkInfo.deliveryConcession}</span>
            </div>
            <div className="card-sub-muted">
              {benchmarkInfo.deliverySub || "Retained in Hindsight bank"}
            </div>
          </>
        ) : (
          <>
            <div className="card-concession-text">
              <span
                className="highlight-muted"
                style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 600 }}
              >
                No Concession Recorded
              </span>
            </div>
            <div className="card-sub-muted">Baseline terms to be established</div>
          </>
        )}
      </div>

      {/* Floating Memory Node 4: Bottom-Right (Active Memory Status) */}
      <div
        className="floating-memory-card card-bottom-right"
        style={{
          transform: `translate3d(${card4X}px, ${card4Y}px, 0)`,
        }}
      >
        <div className="card-header-mini">
          <SparklesIcon className={`mini-icon ${hasMemories ? "text-violet" : "text-muted"}`} />
          <span className="mini-label">MEMORY CONFIDENCE</span>
        </div>
        {hasMemories ? (
          <>
            <div
              className="card-metric-num"
              style={{ fontSize: "15px", color: "#c084fc", fontWeight: 700 }}
            >
              {memoryCount} {memoryCount === 1 ? "Memory Anchor" : "Memory Anchors"}
            </div>
            <div className="card-metric-sub">Synthesized from Hindsight bank</div>
          </>
        ) : (
          <>
            <div
              className="card-metric-num"
              style={{ fontSize: "15px", color: "#94a3b8", fontWeight: 700 }}
            >
              First Interaction
            </div>
            <div className="card-metric-sub">Zero prior memories found</div>
          </>
        )}
      </div>
    </div>
  );
}
