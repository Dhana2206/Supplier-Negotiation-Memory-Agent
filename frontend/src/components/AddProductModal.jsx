import React, { useState } from "react";
import { BoxIcon, XIcon, PlusIcon } from "./Icons";

const QUICK_CATEGORIES = [
  "Semiconductors",
  "Electromechanical",
  "Electronics",
  "Sensors",
  "Energy Storage",
  "Discrete Components",
];

export default function AddProductModal({
  isOpen,
  onClose,
  onAddProduct,
  initialName = "",
}) {
  if (!isOpen) return null;

  return (
    <AddProductModalContent
      onClose={onClose}
      onAddProduct={onAddProduct}
      initialName={initialName}
    />
  );
}

function AddProductModalContent({
  onClose,
  onAddProduct,
  initialName = "",
}) {
  const [name, setName] = useState(initialName || "");
  const [category, setCategory] = useState("Semiconductors");
  const [unit, setUnit] = useState("units");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddProduct({
      name: name.trim(),
      category: category.trim(),
      unit,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge blue">
              <BoxIcon className="modal-icon text-blue" />
            </div>
            <div>
              <h3 className="modal-title">+ Add New Product</h3>
              <p className="modal-sub">Register a reusable product entity for future negotiations</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <XIcon />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="modal-form-body">
          <div className="input-field-group">
            <label className="input-label" htmlFor="new-product-name">
              Product Name <span className="text-emerald">*</span>
            </label>
            <input
              id="new-product-name"
              type="text"
              className="input-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. High Voltage Relay, Test Sensor Module"
              autoFocus
              required
            />
          </div>

          <div className="input-field-group">
            <label className="input-label" htmlFor="new-product-category">
              Category
            </label>
            <input
              id="new-product-category"
              type="text"
              className="input-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Electromechanical, Sensors"
            />
            {/* Quick chips */}
            <div className="modal-quick-chips">
              {QUICK_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`modal-chip ${category === cat ? "active" : ""}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="input-field-group">
            <label className="input-label" htmlFor="new-product-unit">
              Default Unit of Measure
            </label>
            <select
              id="new-product-unit"
              className="input-control select-control"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="units">units</option>
              <option value="pcs">pcs</option>
              <option value="batches">batches</option>
              <option value="kg">kg</option>
              <option value="tons">tons</option>
              <option value="liters">liters</option>
            </select>
          </div>

          {/* Modal Actions */}
          <div className="modal-actions-row">
            <button type="button" className="btn-secondary modal-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary modal-btn-submit">
              <PlusIcon className="btn-icon" />
              <span>Add Product</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
