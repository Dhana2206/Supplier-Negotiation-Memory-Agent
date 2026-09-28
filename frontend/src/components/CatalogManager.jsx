import React, { useState } from "react";
import { BoxIcon, UsersIcon, SearchIcon, PlusIcon, ArrowRightIcon } from "./Icons";

export default function CatalogManager({
  products = [],
  suppliers = [],
  onSelectProduct,
  onSelectSupplier,
  onOpenAddProduct,
  onOpenAddSupplier,
  currentProduct,
  currentSupplier,
  onBackToWorkspace,
}) {
  const [activeTab, setActiveTab] = useState("products");
  const [searchQuery, setSearchQuery] = useState("");

  const safeProducts = Array.isArray(products) ? products : [];
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];

  const filteredProducts = safeProducts.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q)
    );
  });

  const filteredSuppliers = safeSuppliers.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.category || "").toLowerCase().includes(q)
    );
  });

  return (
    <section id="catalog" className="catalog-section dedicated-catalog-view">
      <div className="catalog-container glass-panel">
        {/* Section Header */}
        <div className="section-header-row catalog-header-row">
          <div className="section-title-group">
            <div className="section-badge-pill blue">
              <BoxIcon className="badge-icon text-blue" />
              <span>ENTERPRISE PROCUREMENT DIRECTORY</span>
            </div>
            <h3 className="section-heading">Reusable Products &amp; Suppliers</h3>
            <p className="section-subtext">
              Select or register persistent business entities. Avoid repeatedly typing products and vendors.
            </p>
          </div>

          <div className="catalog-header-actions">
            {onBackToWorkspace && (
              <button
                type="button"
                className="btn-secondary btn-back-workspace"
                onClick={onBackToWorkspace}
              >
                <span>← Back to Negotiation Cockpit</span>
              </button>
            )}

            {/* Tab Switcher */}
            <div className="catalog-tab-switcher">
              <button
                type="button"
                className={`catalog-tab-btn ${activeTab === "products" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("products");
                  setSearchQuery("");
                }}
              >
                <BoxIcon className="tab-icon" />
                <span>Products ({safeProducts.length})</span>
              </button>
              <button
                type="button"
                className={`catalog-tab-btn ${activeTab === "suppliers" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("suppliers");
                  setSearchQuery("");
                }}
              >
                <UsersIcon className="tab-icon" />
                <span>Suppliers ({safeSuppliers.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Action Bar */}
        <div className="catalog-search-action-bar">
          <div className="catalog-search-box">
            <SearchIcon className="catalog-search-icon" />
            <input
              type="text"
              className="catalog-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === "products"
                  ? "Search products by name or category (e.g. motor, sensor, pcb)..."
                  : "Search suppliers by name or domain (e.g. techcore, crompton)..."
              }
            />
            {searchQuery && (
              <button
                type="button"
                className="catalog-search-clear"
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>

          {activeTab === "products" ? (
            <button
              type="button"
              className="btn-primary btn-add-entity"
              onClick={() => onOpenAddProduct(searchQuery)}
            >
              <PlusIcon className="btn-icon" />
              <span>+ Add Product</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary btn-add-entity"
              onClick={() => onOpenAddSupplier(searchQuery)}
            >
              <PlusIcon className="btn-icon" />
              <span>+ Add Supplier</span>
            </button>
          )}
        </div>

        {/* Products Grid */}
        {activeTab === "products" && (
          <div className="catalog-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((prod) => {
                const isSelected =
                  (currentProduct || "").toLowerCase() === (prod.name || "").toLowerCase();
                return (
                  <div
                    key={prod.id || prod.name}
                    className={`catalog-entity-card ${isSelected ? "active-selected" : ""}`}
                  >
                    <div className="entity-card-top">
                      <div className="entity-avatar-box blue">
                        <BoxIcon className="entity-avatar-icon text-blue" />
                      </div>
                      <div className="entity-meta-header">
                        <h4 className="entity-name">{prod.name}</h4>
                        <span className="entity-category-chip">{prod.category || "General"}</span>
                      </div>
                    </div>

                    <div className="entity-card-details">
                      <div className="entity-detail-pill">
                        <span className="pill-k">Default Unit:</span>
                        <span className="pill-v">{prod.unit || "units"}</span>
                      </div>
                      {isSelected && (
                        <div className="entity-active-indicator">
                          <span className="indicator-pulse green" />
                          <span>Active in Workspace</span>
                        </div>
                      )}
                    </div>

                    <div className="entity-card-footer">
                      <button
                        type="button"
                        className={`btn-select-entity ${isSelected ? "btn-selected-current" : ""}`}
                        onClick={() => onSelectProduct(prod)}
                      >
                        <span>{isSelected ? "Currently Selected" : "Select for Negotiation"}</span>
                        <ArrowRightIcon className="btn-icon" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="catalog-empty-search-panel">
                <BoxIcon className="empty-icon text-muted" />
                <h4 className="empty-title">No products found for "{searchQuery}"</h4>
                <p className="empty-desc">
                  Try adjusting your search query, or register "{searchQuery}" directly as a new product entity.
                </p>
                <button
                  type="button"
                  className="btn-primary btn-create-empty"
                  onClick={() => onOpenAddProduct(searchQuery)}
                >
                  <PlusIcon className="btn-icon" />
                  <span>Add "{searchQuery}" to Product Catalog</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Suppliers Grid */}
        {activeTab === "suppliers" && (
          <div className="catalog-grid">
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((sup) => {
                const isSelected =
                  (currentSupplier || "").toLowerCase() === (sup.name || "").toLowerCase();
                return (
                  <div
                    key={sup.id || sup.name}
                    className={`catalog-entity-card ${isSelected ? "active-selected" : ""}`}
                  >
                    <div className="entity-card-top">
                      <div className="entity-avatar-box purple">
                        <UsersIcon className="entity-avatar-icon text-violet" />
                      </div>
                      <div className="entity-meta-header">
                        <h4 className="entity-name">{sup.name}</h4>
                        <span className="entity-category-chip">{sup.category || "Vendor"}</span>
                      </div>
                    </div>

                    <div className="entity-card-details">
                      <div className="entity-detail-pill">
                        <span className="pill-k">Status:</span>
                        <span className="pill-v">{sup.rating || "Active Vendor"}</span>
                      </div>
                      {isSelected && (
                        <div className="entity-active-indicator">
                          <span className="indicator-pulse green" />
                          <span>Active in Workspace</span>
                        </div>
                      )}
                    </div>

                    <div className="entity-card-footer">
                      <button
                        type="button"
                        className={`btn-select-entity ${isSelected ? "btn-selected-current" : ""}`}
                        onClick={() => onSelectSupplier(sup)}
                      >
                        <span>{isSelected ? "Currently Selected" : "Select for Negotiation"}</span>
                        <ArrowRightIcon className="btn-icon" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="catalog-empty-search-panel">
                <UsersIcon className="empty-icon text-muted" />
                <h4 className="empty-title">No suppliers found for "{searchQuery}"</h4>
                <p className="empty-desc">
                  Try adjusting your search query, or register "{searchQuery}" directly as a new vendor profile.
                </p>
                <button
                  type="button"
                  className="btn-primary btn-create-empty"
                  onClick={() => onOpenAddSupplier(searchQuery)}
                >
                  <PlusIcon className="btn-icon" />
                  <span>Add "{searchQuery}" to Supplier Catalog</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
