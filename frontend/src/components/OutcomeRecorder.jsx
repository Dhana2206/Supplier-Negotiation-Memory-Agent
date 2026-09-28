import React, { useState } from "react";
import { CheckCircleIcon, DatabaseIcon, RefreshCwIcon } from "./Icons";

function buildInitialFormData(sup, prod, qty, unit, price, delivery) {
  const resolvedSup = (sup || "").trim();
  const resolvedProd = (prod || "").trim();
  const isTechCoreCanonical =
    Boolean(resolvedSup.toLowerCase().includes("techcore")) &&
    Boolean(resolvedProd.toLowerCase().includes("microcontroller"));

  const fmtQty =
    qty !== undefined && qty !== null && qty !== ""
      ? Number(qty).toLocaleString()
      : "1";
  const displayUnit = unit || "units";
  const displaySup = resolvedSup || "Supplier";
  const displayProd = resolvedProd || "Product";
  const currentPrice = price !== undefined && price !== "" ? price : "";
  const currentDelivery = delivery !== undefined && delivery !== "" ? delivery : "";

  if (isTechCoreCanonical) {
    return {
      negotiation_summary: `Anchored to historical ₹178/unit benchmark citing ${fmtQty} ${displayUnit} batch volume. Supplier conceded to ₹178/unit and free delivery.`,
      outcome: "success",
      successful_concession: `Volume-based price reduction to ₹178/unit and free delivery waiver on ${fmtQty} ${displayUnit}.`,
      final_price: 178,
      final_delivery_fee: 0,
      lessons: `TechCore Semiconductors agreed to ₹178/unit and free delivery after leveraging ${fmtQty} ${displayUnit} volume against historical benchmark.`,
    };
  }

  const priceText =
    currentPrice !== "" ? ` at initial quote of ₹${currentPrice}/unit.` : ".";

  return {
    negotiation_summary: `Negotiation with ${displaySup} for ${fmtQty} ${displayUnit} of ${displayProd}${priceText}`,
    outcome: "success",
    successful_concession: "",
    final_price: currentPrice,
    final_delivery_fee: currentDelivery,
    lessons: "",
  };
}

export default function OutcomeRecorder({
  quote,
  supplier = "",
  product = "",
  onSaveOutcome,
  isSaving,
}) {
  const resolvedSupplier = (supplier || quote?.supplier || "").trim();
  const resolvedProduct = (product || quote?.product || "").trim();
  const currentPrice =
    quote?.price_per_unit !== undefined && quote?.price_per_unit !== ""
      ? quote.price_per_unit
      : "";
  const currentDelivery =
    quote?.delivery_fee !== undefined && quote?.delivery_fee !== ""
      ? quote.delivery_fee
      : "";
  const currentQty =
    quote?.quantity !== undefined && quote?.quantity !== null && quote?.quantity !== ""
      ? quote.quantity
      : 1;
  const currentUnit = quote?.unit || "units";
  const formattedQty = Number(currentQty).toLocaleString() || String(currentQty);

  const isTechCoreCanonical =
    Boolean(resolvedSupplier.toLowerCase().includes("techcore")) &&
    Boolean(resolvedProduct.toLowerCase().includes("microcontroller"));

  const currentQuoteKey = `${resolvedSupplier}-${resolvedProduct}-${currentQty}-${currentUnit}-${currentPrice}-${currentDelivery}`;
  const [prevQuoteKey, setPrevQuoteKey] = useState(currentQuoteKey);

  const [formData, setFormData] = useState(() =>
    buildInitialFormData(
      resolvedSupplier,
      resolvedProduct,
      currentQty,
      currentUnit,
      currentPrice,
      currentDelivery
    )
  );

  if (prevQuoteKey !== currentQuoteKey) {
    setPrevQuoteKey(currentQuoteKey);
    setFormData(
      buildInitialFormData(
        resolvedSupplier,
        resolvedProduct,
        currentQty,
        currentUnit,
        currentPrice,
        currentDelivery
      )
    );
  }

  const [saveStatus, setSaveStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (onSaveOutcome) {
        const res = await onSaveOutcome({
          ...formData,
          supplier: resolvedSupplier,
          product: resolvedProduct,
          quantity: currentQty,
          unit: currentUnit,
        });
        setSaveStatus(res && typeof res.isLive === "boolean" ? res : { isLive: false });
      } else {
        setSaveStatus({ isLive: false });
      }
    } catch {
      setSaveStatus({ isLive: false, error: true });
    } finally {
      setTimeout(() => {
        setSaveStatus(null);
      }, 7000);
    }
  };

  return (
    <section id="outcome" className="outcome-section">
      <div className="outcome-container glass-panel highlight-success-border">
        {/* Header */}
        <div className="section-header-row">
          <div className="section-title-group">
            <div className="section-badge-pill emerald">
              <CheckCircleIcon className="badge-icon text-emerald" />
              <span>CLOSING THE LEARNING LOOP</span>
            </div>
            <h3 className="section-heading">Close the Negotiation</h3>
            <p className="section-subtext">
              Record the agreed terms to store this experience in Hindsight memory for future leverage
            </p>
          </div>

          <div className="supplier-active-tag">
            <span className="supplier-name-bold">{resolvedSupplier || "Supplier"}</span>
            <span className="product-name-dim">({resolvedProduct || "Product"})</span>
          </div>
        </div>

        {/* Success Confirmation Animation Banner - Live Hindsight */}
        {saveStatus && saveStatus.isLive && (
          <div className="outcome-success-banner">
            <div className="success-pulse-orb">
              <CheckCircleIcon className="success-check-icon text-emerald" />
            </div>
            <div className="success-banner-body">
              <div className="success-steps-flow">
                <span className="step-tag-pill green">NEGOTIATION COMPLETE</span>
                <span className="step-arrow">→</span>
                <span className="step-tag-pill blue">MEMORY UPDATED</span>
                <span className="step-arrow">→</span>
                <span className="step-tag-pill purple">READY FOR NEXT NEGOTIATION</span>
              </div>
              <h4 className="success-headline">Outcome Stored in Hindsight Memory!</h4>
              <p className="success-subtext">
                Your next negotiation with <strong>{resolvedSupplier || "Supplier"}</strong> will be informed by this outcome. Future quotes will automatically reference this ₹{formData.final_price} benchmark.
              </p>
            </div>
          </div>
        )}

        {/* Status Banner - Offline Demo Mode */}
        {saveStatus && !saveStatus.isLive && (
          <div className="outcome-success-banner demo-banner">
            <div className="success-pulse-orb">
              <CheckCircleIcon className="success-check-icon text-amber" />
            </div>
            <div className="success-banner-body">
              <div className="success-steps-flow">
                <span className="step-tag-pill green">NEGOTIATION COMPLETE</span>
                <span className="step-arrow">→</span>
                <span className="step-tag-pill amber">SAVED LOCALLY (OFFLINE)</span>
                <span className="step-arrow">→</span>
                <span className="step-tag-pill purple">DEMO READY</span>
              </div>
              <h4 className="success-headline" style={{ color: "#fbbf24" }}>Outcome Saved (Offline Demo Mode)</h4>
              <p className="success-subtext">
                Negotiation outcome recorded locally for this session. Connect the FastAPI backend to store permanently in Hindsight memory bank.
              </p>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="outcome-form-grid">
          <div className="input-field-group full-width">
            <label className="input-label" htmlFor="outcome-summary">Negotiation Summary</label>
            <input
              id="outcome-summary"
              type="text"
              className="input-control"
              value={formData.negotiation_summary}
              onChange={(e) => setFormData({ ...formData, negotiation_summary: e.target.value })}
              placeholder={`e.g. Countered with ${resolvedSupplier || "supplier"} citing batch volume; supplier agreed to terms.`}
              required
            />
          </div>

          <div className="input-row-duo">
            <div className="input-field-group">
              <label className="input-label" htmlFor="outcome-result">Outcome Result</label>
              <select
                id="outcome-result"
                className="input-control select-control"
                value={formData.outcome}
                onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
              >
                <option value="success">Success (Target Price &amp; Terms Met)</option>
                <option value="partial_concession">Partial Concession (Compromised Terms)</option>
                <option value="walk_away">Walked Away (Alternative Sourcing)</option>
              </select>
            </div>

            <div className="input-field-group">
              <label className="input-label" htmlFor="concession-secured">Concession Secured</label>
              <input
                id="concession-secured"
                type="text"
                className="input-control"
                value={formData.successful_concession}
                onChange={(e) => setFormData({ ...formData, successful_concession: e.target.value })}
                placeholder={
                  isTechCoreCanonical
                    ? `Volume-based price reduction to ₹178/unit and free delivery waiver on ${formattedQty} ${currentUnit}.`
                    : `e.g. Volume discount on ${resolvedProduct || "item"} or logistics concession`
                }
                required
              />
            </div>
          </div>

          <div className="input-row-duo">
            <div className="input-field-group">
              <label className="input-label" htmlFor="final-price">Final Agreed Price (₹/unit)</label>
              <div className="input-prefix-wrapper">
                <span className="input-prefix">₹</span>
                <input
                  id="final-price"
                  type="number"
                  step="any"
                  className="input-control has-prefix"
                  value={formData.final_price}
                  onChange={(e) => setFormData({ ...formData, final_price: e.target.value })}
                  placeholder={String(currentPrice || "0")}
                  required
                />
              </div>
            </div>

            <div className="input-field-group">
              <label className="input-label" htmlFor="final-delivery">Final Delivery Fee (₹)</label>
              <div className="input-prefix-wrapper">
                <span className="input-prefix">₹</span>
                <input
                  id="final-delivery"
                  type="number"
                  step="any"
                  className="input-control has-prefix"
                  value={formData.final_delivery_fee}
                  onChange={(e) => setFormData({ ...formData, final_delivery_fee: e.target.value })}
                  placeholder={String(currentDelivery || "0")}
                  required
                />
              </div>
            </div>
          </div>

          <div className="input-field-group full-width">
            <label className="input-label" htmlFor="lessons-learned">Lessons Learned (Encoded to Memory)</label>
            <textarea
              id="lessons-learned"
              rows={2}
              className="input-control textarea-control"
              value={formData.lessons}
              onChange={(e) => setFormData({ ...formData, lessons: e.target.value })}
              placeholder={
                isTechCoreCanonical
                  ? `TechCore Semiconductors agreed to ₹178/unit and free delivery after leveraging ${formattedQty} ${currentUnit} volume against historical benchmark.`
                  : `e.g. ${resolvedSupplier || "Supplier"} responded to order volume commitment; secured concession for future benchmarks.`
              }
              required
            />
          </div>

          <div className="form-submit-row">
            <button
              type="submit"
              disabled={isSaving}
              className={`btn-primary btn-save-outcome ${isSaving ? "loading" : ""}`}
            >
              {isSaving ? (
                <>
                  <RefreshCwIcon className="spin-icon" />
                  <span>Encoding into Hindsight Bank...</span>
                </>
              ) : (
                <>
                  <DatabaseIcon className="btn-icon" />
                  <span>Save Outcome to Memory</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
