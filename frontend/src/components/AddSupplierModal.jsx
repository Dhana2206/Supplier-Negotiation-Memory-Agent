import React, { useState } from "react";
import { UsersIcon, XIcon, PlusIcon } from "./Icons";

const QUICK_SUPPLIER_DOMAINS = [
  "Semiconductors",
  "Industrial Equipment",
  "Electronic Components",
  "Power Systems",
  "Raw Materials",
  "Logistics & Freight",
];

export default function AddSupplierModal({
  isOpen,
  onClose,
  onAddSupplier,
  initialName = "",
}) {
  if (!isOpen) return null;

  return (
    <AddSupplierModalContent
      onClose={onClose}
      onAddSupplier={onAddSupplier}
      initialName={initialName}
    />
  );
}

function AddSupplierModalContent({
  onClose,
  onAddSupplier,
  initialName = "",
}) {
  const [name, setName] = useState(initialName || "");
  const [category, setCategory] = useState("Semiconductors");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddSupplier({
      name: name.trim(),
      category: category.trim(),
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge purple">
              <UsersIcon className="modal-icon text-violet" />
            </div>
            <div>
              <h3 className="modal-title">+ Add New Supplier</h3>
              <p className="modal-sub">Register a reusable vendor entity for future negotiations</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <XIcon />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="modal-form-body">
          <div className="input-field-group">
            <label className="input-label" htmlFor="new-supplier-name">
              Supplier / Company Name <span className="text-emerald">*</span>
            </label>
            <input
              id="new-supplier-name"
              type="text"
              className="input-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. XYZ Industrial Systems, Test Industrial Supplies"
              autoFocus
              required
            />
          </div>

          <div className="input-field-group">
            <label className="input-label" htmlFor="new-supplier-category">
              Domain / Industry
            </label>
            <input
              id="new-supplier-category"
              type="text"
              className="input-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Industrial Equipment, Power Systems"
            />
            {/* Quick chips */}
            <div className="modal-quick-chips">
              {QUICK_SUPPLIER_DOMAINS.map((cat) => (
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

          {/* Modal Actions */}
          <div className="modal-actions-row">
            <button type="button" className="btn-secondary modal-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary modal-btn-submit">
              <PlusIcon className="btn-icon" />
              <span>Add Supplier</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
