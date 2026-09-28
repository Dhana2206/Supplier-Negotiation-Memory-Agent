import React from "react";
import SearchableSelect from "./SearchableSelect";
import { SparklesIcon, RefreshCwIcon, DatabaseIcon, BoxIcon, UsersIcon } from "./Icons";
import { demoPresets } from "../data/demoData";

export default function QuoteForm({
  quote,
  setQuote,
  onAnalyze,
  isAnalyzing,
  onSelectPreset,
  activePresetIndex,
  products = [],
  suppliers = [],
  onOpenAddProduct,
  onOpenAddSupplier,
  onResetMemory,
}) {
  const handleChange = (field, value) => {
    setQuote((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };
      if ((field === "supplier" || field === "product") && onResetMemory) {
        onResetMemory(next);
      }
      return next;
    });
  };

  const handleSelectSupplier = (selectedSup) => {
    setQuote((prev) => {
      const next = {
        ...prev,
        supplier: selectedSup.name,
      };
      if (onResetMemory) onResetMemory(next);
      return next;
    });
  };

  const handleSelectProduct = (selectedProd) => {
    setQuote((prev) => {
      const next = {
        ...prev,
        product: selectedProd.name,
        unit: selectedProd.unit || prev.unit || "units",
      };
      if (onResetMemory) onResetMemory(next);
      return next;
    });
  };

  return (
    <div className="quote-form-card glass-panel">
      {/* Card Header */}
      <div className="card-top-row">
        <div className="header-title-group">
          <div className="header-icon-chip">
            <SparklesIcon className="chip-icon" />
          </div>
          <div>
            <h3 className="panel-title">New Supplier Quote</h3>
            <p className="panel-subtitle">
              Select or register products &amp; suppliers to trigger memory recall
            </p>
          </div>
        </div>

        {/* Quick Demo Presets */}
        <div className="preset-selector-group">
          <span className="preset-label">Demo Scenario:</span>
          <div className="preset-buttons">
            {demoPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                className={`preset-btn ${activePresetIndex === idx ? "active" : ""}`}
                onClick={() => onSelectPreset(idx)}
              >
                <span>{preset.data.supplier}</span>
                <span className="preset-mini-tag">{preset.badge}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form Grid */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onAnalyze();
        }}
        className="quote-form-grid"
      >
        {/* Searchable Supplier Selector */}
        <div className="input-field-group">
          <SearchableSelect
            id="quote-supplier-select"
            label="Supplier"
            value={quote.supplier}
            items={suppliers}
            placeholder="Search / Select Supplier..."
            searchPlaceholder="Search suppliers (e.g. TechCore, Crompton)..."
            onSelect={handleSelectSupplier}
            onOpenAddModal={onOpenAddSupplier}
            addLabel="+ Add Supplier"
            icon={UsersIcon}
            required
          />
        </div>

        {/* Searchable Product Selector */}
        <div className="input-field-group">
          <SearchableSelect
            id="quote-product-select"
            label="Product"
            value={quote.product}
            items={products}
            placeholder="Search / Select Product..."
            searchPlaceholder="Search products (e.g. Microcontroller, Motor)..."
            onSelect={handleSelectProduct}
            onOpenAddModal={onOpenAddProduct}
            addLabel="+ Add Product"
            icon={BoxIcon}
            required
          />
        </div>

        <div className="input-row-duo">
          <div className="input-field-group">
            <label className="input-label" htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              type="number"
              className="input-control"
              value={quote.quantity}
              onChange={(e) => handleChange("quantity", e.target.value)}
              placeholder="10000"
              required
            />
          </div>

          <div className="input-field-group">
            <label className="input-label" htmlFor="unit">Unit</label>
            <select
              id="unit"
              className="input-control select-control"
              value={quote.unit}
              onChange={(e) => handleChange("unit", e.target.value)}
            >
              <option value="units">units</option>
              <option value="pcs">pcs</option>
              <option value="batches">batches</option>
              <option value="kg">kg</option>
              <option value="tons">tons</option>
              <option value="liters">liters</option>
            </select>
          </div>
        </div>

        <div className="input-row-duo">
          <div className="input-field-group">
            <label className="input-label" htmlFor="price">Price Per Unit (₹)</label>
            <div className="input-prefix-wrapper">
              <span className="input-prefix">₹</span>
              <input
                id="price"
                type="number"
                step="any"
                className="input-control has-prefix"
                value={quote.price_per_unit}
                onChange={(e) => handleChange("price_per_unit", e.target.value)}
                placeholder="185"
                required
              />
            </div>
          </div>

          <div className="input-field-group">
            <label className="input-label" htmlFor="delivery">Delivery Fee (₹)</label>
            <div className="input-prefix-wrapper">
              <span className="input-prefix">₹</span>
              <input
                id="delivery"
                type="number"
                step="any"
                className="input-control has-prefix"
                value={quote.delivery_fee}
                onChange={(e) => handleChange("delivery_fee", e.target.value)}
                placeholder="25000"
                required
              />
            </div>
          </div>
        </div>

        <div className="input-field-group">
          <label className="input-label" htmlFor="terms">Payment Terms</label>
          <input
            id="terms"
            type="text"
            className="input-control"
            value={quote.payment_terms}
            onChange={(e) => handleChange("payment_terms", e.target.value)}
            placeholder="e.g. Net 30 Days"
            required
          />
        </div>

        {/* Submit Action */}
        <div className="form-submit-row">
          <button
            type="submit"
            disabled={isAnalyzing}
            className={`btn-primary btn-analyze-pulse ${isAnalyzing ? "loading" : ""}`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCwIcon className="spin-icon" />
                <span>Recalling Hindsight Memory...</span>
              </>
            ) : (
              <>
                <DatabaseIcon className="btn-icon" />
                <span>Analyze Negotiation</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
