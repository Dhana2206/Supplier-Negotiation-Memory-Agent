import React, { useState, useRef, useEffect } from "react";
import { SearchIcon, ChevronDownIcon, PlusIcon, CheckCircleIcon, XIcon } from "./Icons";

export default function SearchableSelect({
  id,
  label,
  value,
  items = [],
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  onSelect,
  onOpenAddModal,
  addLabel = "+ Add New",
  icon: Icon,
  required = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const closeDropdown = () => {
    setIsOpen(false);
    setSearchQuery("");
  };

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const safeItems = Array.isArray(items) ? items : [];

  // Filter items case-insensitively by name and category
  const filteredItems = safeItems.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = (item.name || "").toLowerCase().includes(q);
    const catMatch = (item.category || "").toLowerCase().includes(q);
    return nameMatch || catMatch;
  });

  const selectedItem = safeItems.find(
    (item) => (item.name || "").toLowerCase() === (value || "").toLowerCase()
  );

  const handleSelect = (item) => {
    if (onSelect) {
      onSelect(item);
    }
    closeDropdown();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      closeDropdown();
    } else if (e.key === "Enter" && filteredItems.length > 0) {
      e.preventDefault();
      handleSelect(filteredItems[0]);
    }
  };

  return (
    <div className="searchable-select-container" ref={dropdownRef}>
      {/* Label and Quick Add action */}
      <div className="searchable-label-row">
        <label className="input-label" htmlFor={id}>
          {label}
        </label>
        {onOpenAddModal && (
          <button
            type="button"
            className="btn-quick-add-link"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenAddModal();
            }}
          >
            <PlusIcon className="quick-add-icon" />
            <span>{addLabel}</span>
          </button>
        )}
      </div>

      {/* Main Select Trigger Box */}
      <button
        id={id}
        type="button"
        className={`searchable-trigger-btn input-control ${isOpen ? "active-open" : ""} ${value ? "has-value" : ""}`}
        onClick={() => (isOpen ? closeDropdown() : setIsOpen(true))}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="trigger-left-group">
          {Icon && <Icon className="trigger-icon" />}
          {selectedItem ? (
            <div className="trigger-value-group">
              <span className="trigger-selected-name">{selectedItem.name}</span>
              {selectedItem.category && (
                <span className="trigger-category-badge">{selectedItem.category}</span>
              )}
            </div>
          ) : value ? (
            <span className="trigger-selected-name">{value}</span>
          ) : (
            <span className="trigger-placeholder">{placeholder}</span>
          )}
        </div>
        <ChevronDownIcon className={`trigger-chevron ${isOpen ? "rotated" : ""}`} />
      </button>

      {/* Hidden input for HTML form validation */}
      {required && (
        <input
          type="text"
          value={value || ""}
          required
          tabIndex={-1}
          className="visually-hidden-validator"
          onChange={() => {}}
        />
      )}

      {/* Dropdown Floating Popover */}
      {isOpen && (
        <div className="searchable-dropdown-popover glass-panel">
          {/* Search Box Header */}
          <div className="searchable-search-wrapper">
            <SearchIcon className="searchable-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="searchable-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
            />
            {searchQuery && (
              <button
                type="button"
                className="searchable-clear-btn"
                onClick={() => setSearchQuery("")}
              >
                <XIcon className="clear-icon" />
              </button>
            )}
          </div>

          {/* Results List */}
          <div className="searchable-results-list" role="listbox">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const isSelected =
                  (value || "").toLowerCase() === (item.name || "").toLowerCase();
                return (
                  <div
                    key={item.id || item.name}
                    className={`searchable-option-item ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelect(item)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="option-name-group">
                      <span className="option-name">{item.name}</span>
                      <div className="option-badges">
                        {item.category && (
                          <span className="option-category-pill">{item.category}</span>
                        )}
                        {item.unit && (
                          <span className="option-unit-pill">{item.unit}</span>
                        )}
                        {item.rating && (
                          <span className="option-rating-pill">{item.rating}</span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircleIcon className="option-selected-check text-emerald" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="searchable-no-results">
                <span className="no-results-title">No matches found for "{searchQuery}"</span>
                <span className="no-results-desc">
                  Try a different search or add it as a new {label.toLowerCase()}.
                </span>
                {onOpenAddModal && (
                  <button
                    type="button"
                    className="btn-create-inline"
                    onClick={(e) => {
                      e.preventDefault();
                      const currentQ = searchQuery;
                      closeDropdown();
                      onOpenAddModal(currentQ);
                    }}
                  >
                    <PlusIcon className="inline-plus-icon" />
                    <span>Add "{searchQuery}" as new {label.toLowerCase()}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Dropdown Footer Action */}
          {onOpenAddModal && (
            <div className="searchable-dropdown-footer">
              <button
                type="button"
                className="btn-dropdown-footer-add"
                onClick={() => {
                  const currentQ = searchQuery;
                  closeDropdown();
                  onOpenAddModal(currentQ);
                }}
              >
                <PlusIcon className="footer-add-icon" />
                <span>{addLabel}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
