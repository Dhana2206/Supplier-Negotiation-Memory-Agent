// Local persistence service for Products and Suppliers

export const initialProducts = [
  { id: "prod-1", name: "Microcontroller (MCU)", category: "Semiconductors", unit: "units" },
  { id: "prod-2", name: "Industrial Motor", category: "Electromechanical", unit: "units" },
  { id: "prod-3", name: "PCB Assembly", category: "Electronics", unit: "units" },
  { id: "prod-4", name: "Memory Chip", category: "Semiconductors", unit: "units" },
  { id: "prod-5", name: "Power IC", category: "Semiconductors", unit: "units" },
  { id: "prod-6", name: "MOSFET", category: "Discrete Components", unit: "units" },
  { id: "prod-7", name: "Automotive Sensor", category: "Sensors", unit: "units" },
  { id: "prod-8", name: "Li-ion Battery Cell", category: "Energy Storage", unit: "units" },
];

export const initialSuppliers = [
  { id: "sup-1", name: "TechCore Semiconductors", category: "Semiconductors", rating: "Tier 1 Partner" },
  { id: "sup-2", name: "Crompton", category: "Industrial Equipment", rating: "Verified Vendor" },
  { id: "sup-3", name: "ABC Components", category: "Electronic Components", rating: "Active Supplier" },
  { id: "sup-4", name: "Apex Power Solutions", category: "Power Electronics", rating: "Specialized Vendor" },
  { id: "sup-5", name: "Apex Motion Technologies", category: "Precision Mechanics & Semiconductors", rating: "Verified Vendor" },
  { id: "sup-6", name: "Nova Industrial Systems", category: "Industrial Automation", rating: "Active Supplier" },
];

const PRODUCTS_STORAGE_KEY = "snma_catalog_products";
const SUPPLIERS_STORAGE_KEY = "snma_catalog_suppliers";

/**
 * Retrieve all products from localStorage, initializing with seed products if absent.
 */
export function getStoredProducts() {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(initialProducts));
      return initialProducts;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const existingNames = new Set(parsed.map((p) => p.name.toLowerCase()));
      const missingSeeds = initialProducts.filter((p) => !existingNames.has(p.name.toLowerCase()));
      if (missingSeeds.length > 0) {
        const merged = [...parsed, ...missingSeeds];
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    }
    return initialProducts;
  } catch (err) {
    console.warn("Failed to read products from localStorage:", err);
    return initialProducts;
  }
}

/**
 * Save a new product to localStorage, avoiding duplicates (case-insensitive).
 * Returns the updated array of all products.
 */
export function saveStoredProduct(productData) {
  const products = getStoredProducts();
  const trimmedName = (productData.name || "").trim();
  if (!trimmedName) return products;

  // Check for case-insensitive duplicate
  const existing = products.find(
    (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
  );
  if (existing) {
    return products;
  }

  const newProduct = {
    id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: trimmedName,
    category: (productData.category || "General").trim(),
    unit: productData.unit || "units",
  };

  const updated = [newProduct, ...products];
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to save product to localStorage:", err);
  }
  return updated;
}

/**
 * Retrieve all suppliers from localStorage, initializing with seed suppliers if absent.
 */
export function getStoredSuppliers() {
  try {
    const raw = localStorage.getItem(SUPPLIERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SUPPLIERS_STORAGE_KEY, JSON.stringify(initialSuppliers));
      return initialSuppliers;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const existingNames = new Set(parsed.map((s) => s.name.toLowerCase()));
      const missingSeeds = initialSuppliers.filter((s) => !existingNames.has(s.name.toLowerCase()));
      if (missingSeeds.length > 0) {
        const merged = [...parsed, ...missingSeeds];
        localStorage.setItem(SUPPLIERS_STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    }
    return initialSuppliers;
  } catch (err) {
    console.warn("Failed to read suppliers from localStorage:", err);
    return initialSuppliers;
  }
}

/**
 * Save a new supplier to localStorage, avoiding duplicates (case-insensitive).
 * Returns the updated array of all suppliers.
 */
export function saveStoredSupplier(supplierData) {
  const suppliers = getStoredSuppliers();
  const trimmedName = (supplierData.name || "").trim();
  if (!trimmedName) return suppliers;

  // Check for case-insensitive duplicate
  const existing = suppliers.find(
    (s) => s.name.toLowerCase() === trimmedName.toLowerCase()
  );
  if (existing) {
    return suppliers;
  }

  const newSupplier = {
    id: `sup-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: trimmedName,
    category: (supplierData.category || "General").trim(),
    rating: supplierData.rating || "Active Vendor",
  };

  const updated = [newSupplier, ...suppliers];
  try {
    localStorage.setItem(SUPPLIERS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to save supplier to localStorage:", err);
  }
  return updated;
}
