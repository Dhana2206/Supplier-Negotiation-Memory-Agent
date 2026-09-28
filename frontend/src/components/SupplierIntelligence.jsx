import React, { useState } from "react";
import { supplierIntelligenceList } from "../data/demoData";
import { DatabaseIcon, SparklesIcon } from "./Icons";
import { getSupplierMemories } from "../services/api";
import { isMemoryRelevant, isExactSupplierProductMatch } from "../utils/memoryRelevance";

export default function SupplierIntelligence({
  supplier = "TechCore Semiconductors",
  product = "Microcontroller (MCU)",
  memories = [],
}) {
  const [memoriesModal, setMemoriesModal] = useState(null);

  const formatName = (str) =>
    !str
      ? ""
      : str
          .split(" ")
          .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
          .join(" ");

  const displaySupplier = formatName(supplier) || "Supplier";
  const displayProduct = formatName(product) || "Product";

  const isTechCoreCanonical =
    supplier?.toLowerCase().includes("techcore") &&
    product?.toLowerCase().includes("microcontroller");

  const relevantMemories = (Array.isArray(memories) ? memories : []).filter((item) => {
    if (isTechCoreCanonical) return true;
    return isMemoryRelevant(item, supplier, product);
  });

  const exactProdMemories = relevantMemories.filter((m) =>
    isExactSupplierProductMatch(m, supplier, product)
  );

  const hasLiveIntelligence = relevantMemories.length > 0;
  const hasExactProductIntelligence = isTechCoreCanonical || exactProdMemories.length > 0;

  // Build active dossier list strictly scoped to CURRENT supplier & product
  let activeSuppliersList = [];

  if (isTechCoreCanonical) {
    activeSuppliersList = supplierIntelligenceList;
  } else if (hasLiveIntelligence) {
    let lastPrice = "No Past Deals";
    let typicalConcession = "Volume-based concession & freight waiver";
    let notes = `Verified negotiation experience stored in Hindsight for ${displaySupplier}.`;

    if (hasExactProductIntelligence) {
      for (const mem of exactProdMemories) {
        const text = typeof mem === "string" ? mem : mem.text || JSON.stringify(mem);
        const fpMatch =
          text.match(/Final Price:\s*₹?([0-9,.]+)/i) ||
          text.match(/(?:agreed|conceded|closed)\s*(?:at|to)?\s*₹([0-9,.]+)/i);
        if (fpMatch) lastPrice = `₹${fpMatch[1]}/unit`;
        const concMatch = text.match(/Successful Concession:\s*(.+)/i);
        if (concMatch) typicalConcession = concMatch[1].trim();
        const lessonMatch =
          text.match(/Lesson:\s*(.+)/i) || text.match(/Negotiation Summary:\s*(.+)/i);
        if (lessonMatch) notes = lessonMatch[1].trim();
      }
    } else {
      // General supplier intelligence from other product lines
      for (const mem of relevantMemories) {
        const text = typeof mem === "string" ? mem : mem.text || JSON.stringify(mem);
        const lessonMatch =
          text.match(/Lesson:\s*(.+)/i) || text.match(/Negotiation Summary:\s*(.+)/i);
        if (lessonMatch) notes = lessonMatch[1].trim();
      }
      lastPrice = "No Past Deals (New Line)";
      typicalConcession = "Concessions established on other lines";
    }

    activeSuppliersList = [
      {
        supplier: displaySupplier,
        product: `${displayProduct} • Memory Profile`,
        pastNegotiations: hasExactProductIntelligence ? exactProdMemories.length : relevantMemories.length,
        lastSuccessfulPrice: lastPrice,
        typicalConcession,
        leverageScore: hasExactProductIntelligence ? "High (Volume-Anchored)" : "Moderate (New Line)",
        lastInteraction: "Active Session",
        notes,
        rawMemories: relevantMemories,
      },
    ];
  }

  const handleViewMemory = async (supplierItem) => {
    if (supplierItem.rawMemories) {
      setMemoriesModal({
        supplier: supplierItem.supplier,
        product: supplierItem.product,
        count: supplierItem.rawMemories.length,
        memories: supplierItem.rawMemories,
        notes: supplierItem.notes,
      });
      return;
    }

    setMemoriesModal({
      supplier: supplierItem.supplier,
      product: supplierItem.product,
      count: 0,
      memories: ["Loading memories from Hindsight bank..."],
      notes: supplierItem.notes,
    });

    const fallbackMemories = [
      `Historical PO with ${supplierItem.supplier}: Last closed at ${supplierItem.lastSuccessfulPrice} with concession: ${supplierItem.typicalConcession}.`,
      `${supplierItem.supplier} behavioral profile: ${supplierItem.notes}`,
      `Total documented negotiations in Hindsight bank: ${supplierItem.pastNegotiations}.`,
    ];

    const { data } = await getSupplierMemories(supplierItem.supplier, {
      supplier: supplierItem.supplier,
      count: fallbackMemories.length,
      memories: fallbackMemories,
    });

    setMemoriesModal({
      supplier: supplierItem.supplier,
      product: supplierItem.product,
      count: data?.count || fallbackMemories.length,
      memories: data?.memories || fallbackMemories,
      notes: supplierItem.notes,
    });
  };

  return (
    <section id="suppliers" className="suppliers-section">
      <div className="section-header-row">
        <div className="section-title-group">
          <div className="section-badge-pill blue">
            <DatabaseIcon className="badge-icon text-blue" />
            <span>ACCUMULATED PROCUREMENT PROFILES</span>
          </div>
          <h2 className="section-title-large">Supplier Intelligence</h2>
          <p className="section-desc-large">
            Memory-driven supplier dossiers that track behavioral tendencies, concession patterns, and pricing elasticity.
          </p>
        </div>
      </div>

      {activeSuppliersList.length > 0 ? (
        <div className="suppliers-grid">
          {activeSuppliersList.map((sup, idx) => (
            <div key={idx} className="supplier-card glass-panel">
              <div className="sup-card-header">
                <div>
                  <h4 className="sup-name">{sup.supplier}</h4>
                  <span className="sup-product">{sup.product}</span>
                </div>
                <span className="sup-pos-pill">{sup.pastNegotiations} Past Deals</span>
              </div>

              <div className="sup-metrics-list">
                <div className="sup-metric-row">
                  <span className="metric-k">Last Successful Price</span>
                  <span className="metric-v text-emerald">{sup.lastSuccessfulPrice}</span>
                </div>
                <div className="sup-metric-row">
                  <span className="metric-k">Typical Concession</span>
                  <span className="metric-v text-blue">{sup.typicalConcession}</span>
                </div>
                <div className="sup-metric-row">
                  <span className="metric-k">Negotiation Leverage</span>
                  <span className="metric-v">{sup.leverageScore}</span>
                </div>
                <div className="sup-metric-row">
                  <span className="metric-k">Last Interaction</span>
                  <span className="metric-v text-muted">{sup.lastInteraction}</span>
                </div>
              </div>

              <div className="sup-notes-box">
                <span className="notes-label">Behavioral Insight:</span>
                <p className="notes-text">"{sup.notes}"</p>
              </div>

              <div className="sup-card-footer">
                <button
                  type="button"
                  className="btn-secondary btn-view-mem"
                  onClick={() => handleViewMemory(sup)}
                >
                  <SparklesIcon className="btn-icon text-violet" />
                  <span>View Memory</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="suppliers-empty-state-panel glass-panel">
          <div className="supplier-empty-icon-box">
            <DatabaseIcon className="supplier-empty-icon" />
          </div>
          <div className="supplier-empty-text-group">
            <h4 className="supplier-empty-title">
              No supplier intelligence available yet for {displaySupplier} + {displayProduct}.
            </h4>
            <p className="supplier-empty-desc">
              Complete this negotiation to build the first supplier profile in the Hindsight memory bank.
            </p>
          </div>
        </div>
      )}

      {/* Memory Details Modal */}
      {memoriesModal && (
        <div className="modal-backdrop" onClick={() => setMemoriesModal(null)}>
          <div className="modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <DatabaseIcon className="modal-icon text-blue" />
                <div>
                  <h3 className="modal-title">{memoriesModal.supplier} Intelligence Bank</h3>
                  <span className="modal-sub">{memoriesModal.product} • {memoriesModal.count} Recorded Memories</span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setMemoriesModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-insight-quote">
                <strong>Profile Summary:</strong> {memoriesModal.notes}
              </div>

              <h4 className="modal-section-title">Verified Hindsight Memories:</h4>
              <div className="modal-memories-list">
                {memoriesModal.memories.map((m, mIdx) => (
                  <div key={mIdx} className="modal-memory-row">
                    <span className="modal-memory-dot">●</span>
                    <span className="modal-memory-text">"{m}"</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setMemoriesModal(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
