import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MetricsStrip from "./components/MetricsStrip";
import QuoteForm from "./components/QuoteForm";
import AnalysisLoader from "./components/AnalysisLoader";
import MemoryRecall from "./components/MemoryRecall";
import MemoryTimeline from "./components/MemoryTimeline";
import AIStrategy from "./components/AIStrategy";
import CounterOffer from "./components/CounterOffer";
import NegotiationJourney from "./components/NegotiationJourney";
import OutcomeRecorder from "./components/OutcomeRecorder";
import SupplierIntelligence from "./components/SupplierIntelligence";
import MemoryActivity from "./components/MemoryActivity";
import Footer from "./components/Footer";
import CatalogManager from "./components/CatalogManager";
import AddProductModal from "./components/AddProductModal";
import AddSupplierModal from "./components/AddSupplierModal";
import CompetitiveQuoteContext from "./components/CompetitiveQuoteContext";
import { demoPresets, initialActivities } from "./data/demoData";
import { checkBackendHealth, analyzeNegotiation, reflectNegotiation, recordNegotiationOutcome } from "./services/api";
import {
  getStoredProducts,
  saveStoredProduct,
  getStoredSuppliers,
  saveStoredSupplier,
} from "./services/catalogService";
import { saveStoredBenchmark } from "./services/quoteComparisonService";
import { isMemoryRelevant, isExactSupplierProductMatch } from "./utils/memoryRelevance";
import { extractBenchmarkFromMemories } from "./utils/benchmarkExtraction";
import "./App.css";

function createFirstInteractionStrategy(currentQuote) {
  const quotedPrice = parseFloat(currentQuote?.price_per_unit) || 0;
  const quotedDelivery = parseFloat(currentQuote?.delivery_fee) || 0;
  const quantity = parseFloat(currentQuote?.quantity) || 1;
  const targetPrice = Math.round(quotedPrice * 0.95);
  const unit = currentQuote?.unit || "units";
  const terms = currentQuote?.payment_terms || "Net 30 Days";
  const displaySup = currentQuote?.supplier
    ? currentQuote.supplier
        .split(" ")
        .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
        .join(" ")
    : "Supplier";
  const displayProd = currentQuote?.product?.trim() || "Product";
  const unitSavings = Math.max(0, quotedPrice - targetPrice);
  const totalSavings = unitSavings * quantity + quotedDelivery;

  return {
    hasMemories: false,
    benchmarkTitle: "Contextual Baseline",
    patternTitle: "First-Interaction Profile",
    benchmark: `No prior historical benchmarks for ${displaySup} (${displayProd}) in Hindsight bank. Incoming asking rate is ₹${quotedPrice}/unit with ₹${quotedDelivery.toLocaleString()} delivery.`,
    pattern: `First interaction on record. No observed historical concessions yet. Anchor to volume (${quantity.toLocaleString()} ${unit}) to establish concession pattern.`,
    suggestedCounter: `₹${targetPrice}/unit + Free Delivery`,
    calloutSubtext: `Formulated from current quote economics and ${quantity.toLocaleString()} ${unit} volume leverage`,
    badgeText: "FIRST-INTERACTION AI STRATEGY",
    subtext: "No prior memories on record — strategy formulated from current quote terms and batch volume",
    recommendedMoveTitle: "Current-Context Strategy Recommendation",
    levers: [
      { label: "Unit Price", value: `Push from ₹${quotedPrice} to ₹${targetPrice}/unit target` },
      { label: "Delivery Fee", value: `Demand logistics fee waiver (₹${quotedDelivery.toLocaleString()} → FREE)` },
      { label: "Volume Leverage", value: `${quantity.toLocaleString()} ${unit} commitment for ${displayProd}` },
      { label: "Payment Terms", value: `Commit to ${terms} terms` },
    ],
    recommendedMove: `Anchor firmly at ₹${targetPrice}/unit with free delivery citing ${quantity.toLocaleString()} ${unit} order volume. Reject the initial ₹${quotedPrice}/unit asking rate and freight surcharge.`,
    comparison: {
      isMemoryBacked: false,
      counterBadge: "Context-Derived",
      quotedPrice,
      counterPrice: targetPrice,
      quotedDelivery,
      counterDelivery: 0,
      unitSavings,
      totalSavings,
    },
    isLive: false,
  };
}

function createFirstInteractionTimeline(currentQuote) {
  const quotedPrice = parseFloat(currentQuote?.price_per_unit) || 0;
  const quotedDelivery = parseFloat(currentQuote?.delivery_fee) || 0;
  const quantity = parseFloat(currentQuote?.quantity) || 1;
  const unit = currentQuote?.unit || "units";
  const terms = currentQuote?.payment_terms || "Net 30 Days";
  const displaySup = currentQuote?.supplier
    ? currentQuote.supplier
        .split(" ")
        .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
        .join(" ")
    : "Supplier";
  const displayProd = currentQuote?.product?.trim() || "Product";

  return [
    {
      date: "Past",
      title: "Historical Benchmark",
      tag: "No History",
      price: "No Past Deals",
      delivery: "—",
      note: `No prior negotiation history recorded for ${displaySup} in Hindsight bank.`,
    },
    {
      date: "Today",
      title: "Current Quote",
      tag: "Active",
      price: `₹${quotedPrice}/unit`,
      delivery: quotedDelivery === 0 ? "FREE delivery" : `₹${quotedDelivery.toLocaleString()} delivery`,
      note: `Incoming quote from ${displaySup} for ${quantity.toLocaleString()} ${unit} of ${displayProd} on ${terms} terms.`,
    },
  ];
}

export default function App() {
  // Persistent Products & Suppliers Directory
  const [products, setProducts] = useState(getStoredProducts);
  const [suppliers, setSuppliers] = useState(getStoredSuppliers);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [modalInitialSearch, setModalInitialSearch] = useState("");

  // Demo Preset & Form State
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const [quote, setQuote] = useState(demoPresets[0].data);
  const [historyData, setHistoryData] = useState(demoPresets[0].history);
  const [strategyData, setStrategyData] = useState(demoPresets[0].strategy);
  const [timelineData, setTimelineData] = useState(demoPresets[0].timeline);
  const [memoriesList, setMemoriesList] = useState(demoPresets[0].memories);
  const [isMemoryLive, setIsMemoryLive] = useState(false);

  // UI Flow & Analysis States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState(0);
  const [hasAnalyzed, setHasAnalyzed] = useState(true); // default true for immediate rich demo preview
  const [activeStageId, setActiveStageId] = useState(4); // Default to Strategy stage in Journey
  const [activeSection, setActiveSection] = useState("workspace");
  const [isSavingOutcome, setIsSavingOutcome] = useState(false);
  const [activities, setActivities] = useState(initialActivities);
  const [isBackendLive, setIsBackendLive] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Mouse Parallax & Radial Glow State
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Check Backend Live Status on mount
  useEffect(() => {
    let isMounted = true;
    checkBackendHealth().then((isLive) => {
      if (isMounted) setIsBackendLive(isLive);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Mouse move listener for subtle ambient radial glow and parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (window.innerWidth < 768) return; // Disable on mobile
      setMousePos({ x: e.clientX, y: e.clientY });

      // Normalized coordinates from -1 to 1
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;
      setMouseOffset({ x: normX, y: normY });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Show temporary toast notification
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Reset memory and strategy to clean first-interaction baseline when switching supplier/product
  const handleResetMemory = (targetQuote) => {
    const q = targetQuote || quote;
    const isTechCore =
      Boolean(q.supplier?.toLowerCase().includes("techcore")) &&
      Boolean(q.product?.toLowerCase().includes("microcontroller"));
    if (!isTechCore) {
      setMemoriesList([]);
      setIsMemoryLive(false);
      setHistoryData(null);
      setStrategyData(createFirstInteractionStrategy(q));
      setTimelineData(createFirstInteractionTimeline(q));
    }
  };

  // Preset Selection Handler
  const handleSelectPreset = (index) => {
    setActivePresetIndex(index);
    const selected = demoPresets[index];
    setQuote(selected.data);
    setHistoryData(selected.history);
    setStrategyData(selected.strategy);
    setTimelineData(selected.timeline);
    setMemoriesList(selected.memories);
    setIsMemoryLive(false);

    // Add to activity feed
    setActivities((prev) => [
      {
        id: Date.now(),
        supplier: selected.data.supplier,
        product: selected.data.product,
        text: `Loaded scenario for ${selected.data.supplier} (${selected.data.product})`,
        time: "Just now",
        type: "system",
      },
      ...prev.slice(0, 15),
    ]);
  };

  // Directory & Modal Handlers
  const handleOpenAddProduct = (initialText = "") => {
    setModalInitialSearch(initialText || "");
    setIsAddProductModalOpen(true);
  };

  const handleOpenAddSupplier = (initialText = "") => {
    setModalInitialSearch(initialText || "");
    setIsAddSupplierModalOpen(true);
  };

  const handleAddProduct = (newProduct) => {
    const updated = saveStoredProduct(newProduct);
    const productList = Array.isArray(updated) ? updated : getStoredProducts();
    setProducts(productList);
    const nextQuote = {
      ...quote,
      product: newProduct.name,
      unit: newProduct.unit || quote.unit || "units",
    };
    setQuote(nextQuote);
    handleResetMemory(nextQuote);
    setIsAddProductModalOpen(false);
    showToast(`Product "${newProduct.name}" registered and selected.`);
  };

  const handleAddSupplier = (newSupplier) => {
    const updated = saveStoredSupplier(newSupplier);
    const supplierList = Array.isArray(updated) ? updated : getStoredSuppliers();
    setSuppliers(supplierList);
    const nextQuote = {
      ...quote,
      supplier: newSupplier.name,
    };
    setQuote(nextQuote);
    handleResetMemory(nextQuote);
    setIsAddSupplierModalOpen(false);
    showToast(`Supplier "${newSupplier.name}" registered and selected.`);
  };

  const handleSelectProductFromCatalog = (prod) => {
    const nextQuote = {
      ...quote,
      product: prod.name,
      unit: prod.unit || quote.unit || "units",
    };
    setQuote(nextQuote);
    handleResetMemory(nextQuote);
    showToast(`Selected "${prod.name}" for negotiation.`);
    scrollToSection("workspace");
  };

  const handleSelectSupplierFromCatalog = (sup) => {
    const nextQuote = {
      ...quote,
      supplier: sup.name,
    };
    setQuote(nextQuote);
    handleResetMemory(nextQuote);
    showToast(`Selected "${sup.name}" for negotiation.`);
    scrollToSection("workspace");
  };

  // Multi-stage Analysis Workflow
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisStage(0);
    setActiveStageId(2); // RECALL stage

    // Advance reasoning stages smoothly to visually communicate AI cognition
    const stageTimer = setInterval(() => {
      setAnalysisStage((prev) => {
        if (prev < 4) {
          if (prev === 1) setActiveStageId(3); // REFLECT
          if (prev === 3) setActiveStageId(4); // STRATEGY
          return prev + 1;
        }
        clearInterval(stageTimer);
        return 4;
      });
    }, 380);

    const currentPreset = demoPresets[activePresetIndex] || demoPresets[0];
    const isTechCore =
      Boolean(quote.supplier?.toLowerCase().includes("techcore")) &&
      Boolean(quote.product?.toLowerCase().includes("microcontroller"));
    const fallbackMemories = isTechCore ? currentPreset.memories : [];
    const fallbackStrategy = isTechCore
      ? currentPreset.strategy.recommendedMove
      : `Anchor to order volume (${quote.quantity} ${quote.unit}) and negotiate price and freight concessions for ${quote.supplier}.`;

    // Reset UI state immediately when starting analysis for non-demo combinations
    if (!isTechCore) {
      setMemoriesList([]);
      setIsMemoryLive(false);
      setHistoryData(null);
      setStrategyData(createFirstInteractionStrategy(quote));
      setTimelineData(createFirstInteractionTimeline(quote));
    }

    // Trigger backend RECALL & REFLECT (with graceful fallback to preset only for demo scenario)
    try {
      const [recallRes, reflectRes] = await Promise.all([
        analyzeNegotiation(quote, {
          supplier: quote.supplier,
          product: quote.product,
          memories: fallbackMemories,
        }),
        reflectNegotiation(quote, {
          supplier: quote.supplier,
          product: quote.product,
          strategy: fallbackStrategy,
        }),
      ]);

      const isRecallLive = Boolean(recallRes?.isLive);
      const isReflectLive = Boolean(reflectRes?.isLive);

      if (isRecallLive || isReflectLive) {
        setIsBackendLive(true);
      }

      // 1. Process Recall with strict relevance filter
      const rawMemories = (isRecallLive && Array.isArray(recallRes?.data?.memories))
        ? recallRes.data.memories
        : (isTechCore ? currentPreset.memories : []);

      const relevantRecalled = isTechCore
        ? rawMemories
        : rawMemories.filter((m) => isMemoryRelevant(m, quote.supplier, quote.product));

      const exactProductRecalled = isTechCore
        ? rawMemories
        : relevantRecalled.filter((m) => isExactSupplierProductMatch(m, quote.supplier, quote.product));

      const matchedCount = relevantRecalled.length;
      const exactProductCount = exactProductRecalled.length;
      const hasProductMemoriesNow = isTechCore ? true : (isRecallLive && exactProductCount > 0);
      const hasSupplierMemoriesNow = isTechCore ? true : (isRecallLive && matchedCount > 0);

      setMemoriesList(relevantRecalled);
      setIsMemoryLive(isRecallLive);

      // 2. Process Reflect & Strategy
      const liveStrategyText = reflectRes?.data?.strategy || reflectRes?.data?.recommendation;
      const displaySup = quote.supplier
        ? quote.supplier
            .split(" ")
            .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
            .join(" ")
        : "Supplier";

      if (isTechCore) {
        setStrategyData({
          ...currentPreset.strategy,
          hasMemories: true,
          recommendedMove: isReflectLive && liveStrategyText ? liveStrategyText : currentPreset.strategy.recommendedMove,
          isLive: isReflectLive,
        });
        setTimelineData(currentPreset.timeline);
        setHistoryData(currentPreset.history);
      } else {
        setHistoryData(null);
        const quotedPrice = parseFloat(quote.price_per_unit) || 0;
        const quotedDelivery = parseFloat(quote.delivery_fee) || 0;
        const quantity = parseFloat(quote.quantity) || 1;
        let targetPrice = Math.round(quotedPrice * 0.95);
        let pastBenchmarkPrice = "No Past Deals";
        let pastBenchmarkDelivery = "—";
        let pastBenchmarkNote = hasSupplierMemoriesNow
          ? `No prior negotiation history recorded for ${displaySup} on ${quote.product}. (Supplier context on record)`
          : `No prior negotiation history recorded for ${displaySup} in Hindsight bank.`;

        if (hasProductMemoriesNow && exactProductRecalled.length > 0) {
          const benchmark = extractBenchmarkFromMemories(exactProductRecalled, null, displaySup, quote.product, false);
          if (benchmark.numericPrice && benchmark.numericPrice > 0) {
            if (benchmark.numericPrice < quotedPrice) {
              targetPrice = benchmark.numericPrice;
            }
            pastBenchmarkPrice = benchmark.successfulPrice;
          } else if (benchmark.successfulPrice && benchmark.successfulPrice !== "No Historical Benchmark") {
            pastBenchmarkPrice = benchmark.successfulPrice;
          }

          if (benchmark.previousDelivery === "FREE") {
            pastBenchmarkDelivery = "FREE delivery";
          } else if (benchmark.previousDelivery && benchmark.previousDelivery !== "No Concession Recorded") {
            pastBenchmarkDelivery = `${benchmark.previousDelivery} delivery`;
          }

          if (benchmark.timelineNote) {
            pastBenchmarkNote = benchmark.timelineNote;
          }
        }

        const unitSavings = Math.max(0, quotedPrice - targetPrice);
        const totalSavings = unitSavings * quantity + quotedDelivery;

        setStrategyData({
          hasMemories: hasProductMemoriesNow,
          benchmarkTitle: hasProductMemoriesNow ? "Historical Benchmark" : "Contextual Baseline",
          patternTitle: hasSupplierMemoriesNow ? "Supplier Behavioral Pattern" : "First-Interaction Profile",
          benchmark: hasProductMemoriesNow
            ? `Historical benchmark retrieved from Hindsight for ${displaySup} (${quote.product}).`
            : `No prior historical benchmarks for ${displaySup} (${quote.product}) in Hindsight bank. Incoming asking rate is ₹${quotedPrice}/unit with ₹${quotedDelivery.toLocaleString()} delivery.`,
          pattern: hasSupplierMemoriesNow
            ? (hasProductMemoriesNow
                ? `${displaySup} has recorded concessions in Hindsight memory bank.`
                : `${displaySup} has recorded negotiations in Hindsight memory bank (concessions observed on other lines). For ${quote.product}, establish concession baseline.`)
            : `First interaction on record. No observed historical concessions yet. Anchor to volume (${quantity.toLocaleString()} ${quote.unit}) to establish concession pattern.`,
          suggestedCounter: `₹${targetPrice}/unit + Free Delivery`,
          calloutSubtext: hasProductMemoriesNow
            ? "Anchored to verified historical concessions and current batch volume"
            : `Formulated from current quote economics and ${quantity.toLocaleString()} ${quote.unit} volume leverage`,
          badgeText: hasProductMemoriesNow
            ? "LIVE HINDSIGHT REFLECTION"
            : (hasSupplierMemoriesNow ? "SUPPLIER-INFORMED STRATEGY" : "FIRST-INTERACTION AI STRATEGY"),
          subtext: hasProductMemoriesNow
            ? "Synthesized in real-time from Hindsight memory bank via autonomous REFLECT engine"
            : (hasSupplierMemoriesNow
                ? "Informed by supplier tendencies on record — pricing target formulated from current quote economics"
                : "No prior memories on record — strategy formulated from current quote terms and batch volume"),
          recommendedMoveTitle: hasProductMemoriesNow
            ? "Live Hindsight Tactical Strategy & Recommendation"
            : (hasSupplierMemoriesNow ? "Supplier-Informed Strategy Recommendation" : "Current-Context Strategy Recommendation"),
          levers: [
            { label: "Unit Price", value: `Push from ₹${quotedPrice} to ₹${targetPrice}/unit target` },
            { label: "Delivery Fee", value: `Demand logistics fee waiver (₹${quotedDelivery.toLocaleString()} → FREE)` },
            { label: "Volume Leverage", value: `${quantity.toLocaleString()} ${quote.unit} commitment for ${quote.product}` },
            { label: "Payment Terms", value: `Commit to ${quote.payment_terms || "Net 30 Days"} terms` },
          ],
          recommendedMove: isReflectLive && liveStrategyText
            ? liveStrategyText
            : `Anchor firmly at ₹${targetPrice}/unit with free delivery citing ${quantity.toLocaleString()} ${quote.unit} order volume. Reject the initial ₹${quotedPrice}/unit asking rate and freight surcharge.`,
          comparison: {
            isMemoryBacked: hasProductMemoriesNow,
            counterBadge: hasProductMemoriesNow ? "Memory-Backed" : "Context-Derived",
            quotedPrice,
            counterPrice: targetPrice,
            quotedDelivery,
            counterDelivery: 0,
            unitSavings,
            totalSavings,
          },
          isLive: isReflectLive,
        });

        setTimelineData([
          {
            date: "Past",
            title: "Historical Benchmark",
            tag: hasProductMemoriesNow ? "Agreed Benchmark" : "No History",
            price: pastBenchmarkPrice,
            delivery: pastBenchmarkDelivery,
            note: pastBenchmarkNote,
          },
          {
            date: "Today",
            title: "Current Quote",
            tag: "Active",
            price: `₹${quotedPrice}/unit`,
            delivery: quotedDelivery === 0 ? "FREE delivery" : `₹${quotedDelivery.toLocaleString()} delivery`,
            note: `Incoming quote from ${displaySup} for ${quantity.toLocaleString()} ${quote.unit} of ${quote.product} on ${quote.payment_terms || "Net 30 Days"} terms.`,
          },
        ]);
      }

      // Complete analysis sequence
      setTimeout(() => {
        clearInterval(stageTimer);
        setIsAnalyzing(false);
        setHasAnalyzed(true);
        setActiveStageId(4);

        const currentSuggested = isTechCore
          ? "₹178/unit + Free Delivery"
          : `₹${Math.round((parseFloat(quote.price_per_unit) || 0) * 0.95)}/unit + Free Delivery`;

        if (isRecallLive || isReflectLive) {
          setActivities((prev) => [
            {
              id: Date.now() + 1,
              supplier: quote.supplier,
              product: quote.product,
              text: isReflectLive
                ? (hasProductMemoriesNow
                    ? `Live Hindsight REFLECT synthesized strategy for ${displaySup} (${quote.product})`
                    : (hasSupplierMemoriesNow
                        ? `Live strategy formulated for ${displaySup} (Informed by supplier tendencies)`
                        : `Current-context strategy formulated for ${displaySup} (First Interaction)`))
                : `Generated strategy for ${displaySup}: ${currentSuggested}`,
              time: "Just now",
              type: "strategy",
            },
            {
              id: Date.now(),
              supplier: quote.supplier,
              product: quote.product,
              text: exactProductCount > 0
                ? `Hindsight RECALL matched ${exactProductCount} memories for ${displaySup} (${quote.product})`
                : (matchedCount > 0
                    ? `Hindsight RECALL found ${matchedCount} supplier memories for ${displaySup} (0 for ${quote.product})`
                    : `Hindsight RECALL matched 0 memories for ${displaySup}`),
              time: "Just now",
              type: "recall",
            },
            ...prev.slice(0, 15),
          ]);

          showToast("Analysis complete using live Hindsight data!");
        } else {
          setActivities((prev) => [
            {
              id: Date.now() + 1,
              supplier: quote.supplier,
              product: quote.product,
              text: `Generated strategy for ${displaySup}: ${currentSuggested}`,
              time: "Just now",
              type: "strategy",
            },
            {
              id: Date.now(),
              supplier: quote.supplier,
              product: quote.product,
              text: `Searched memory bank for ${displaySup} (Offline Mode)`,
              time: "Just now",
              type: "recall",
            },
            ...prev.slice(0, 15),
          ]);

          showToast("Analysis complete (Demo mode - Backend offline).");
        }
      }, 2000);
    } catch (err) {
      console.warn("Analysis fallback applied:", err);
      clearInterval(stageTimer);
      setIsAnalyzing(false);
      setHasAnalyzed(true);
      setIsMemoryLive(false);
      setMemoriesList(isTechCore ? currentPreset.memories : []);
      if (!isTechCore) {
        setStrategyData(createFirstInteractionStrategy(quote));
        setTimelineData(createFirstInteractionTimeline(quote));
      } else {
        setStrategyData((prev) => ({
          ...prev,
          isLive: false,
        }));
      }
      showToast("Backend unavailable. Loaded offline state.");
    }
  };

  // Use Counter Offer CTA (Bridges to Outcome section)
  const handleUseCounterOffer = () => {
    const outcomeEl = document.getElementById("outcome");
    if (outcomeEl) {
      outcomeEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    showToast(`Counter offer: ${strategyData.suggestedCounter} ready for deal closing.`);
  };

  // Outcome Save Workflow: ALWAYS construct payload from CURRENT quote state + recorder form data
  const handleSaveOutcome = async (recorderData) => {
    setIsSavingOutcome(true);

    const actualSupplier = quote.supplier?.trim() || "Supplier";
    const actualProduct = quote.product?.trim() || "Product";
    const finalPrice =
      parseFloat(recorderData.final_price) || parseFloat(quote.price_per_unit) || 0;
    const finalDelivery =
      parseFloat(recorderData.final_delivery_fee) || 0;

    // Guard against stale cross-supplier text leakage in summary / concession / lessons
    let cleanSummary = recorderData.negotiation_summary?.trim() || "";
    let cleanConcession = recorderData.successful_concession?.trim() || "";
    let cleanLessons = recorderData.lessons?.trim() || "";

    const isTechCoreSupplier = actualSupplier.toLowerCase().includes("techcore");
    const isMicrocontrollerProduct = actualProduct.toLowerCase().includes("microcontroller");

    // If current quote is NOT TechCore, sanitize any accidental stale TechCore demo text
    if (!isTechCoreSupplier) {
      if (
        cleanSummary.toLowerCase().includes("techcore") ||
        (!isMicrocontrollerProduct && cleanSummary.toLowerCase().includes("microcontroller"))
      ) {
        cleanSummary = `Negotiated terms with ${actualSupplier} for ${quote.quantity} ${quote.unit} of ${actualProduct}. Final price: ₹${finalPrice}/unit.`;
      }
      if (
        cleanConcession.toLowerCase().includes("techcore") ||
        (!isMicrocontrollerProduct && cleanConcession.toLowerCase().includes("microcontroller")) ||
        cleanConcession.includes("178")
      ) {
        cleanConcession = `Agreed terms on ${actualProduct} at ₹${finalPrice}/unit with ₹${finalDelivery} delivery.`;
      }
      if (
        cleanLessons.toLowerCase().includes("techcore") ||
        (!isMicrocontrollerProduct && cleanLessons.toLowerCase().includes("microcontroller"))
      ) {
        cleanLessons = `${actualSupplier} agreed to ₹${finalPrice}/unit for ${actualProduct}.`;
      }
    }

    const concession =
      cleanConcession || `Agreed terms at ₹${finalPrice}/unit`;
    const summary =
      cleanSummary ||
      `Negotiated ${actualProduct} with ${actualSupplier}. Final agreed price ₹${finalPrice}/unit.`;
    const lessons =
      cleanLessons ||
      `${actualSupplier} agreed to ₹${finalPrice}/unit for ${actualProduct}.`;

    const outcomePayload = {
      supplier: actualSupplier,
      product: actualProduct,
      quantity: parseFloat(quote.quantity) || 1,
      unit: quote.unit || "units",
      price_per_unit: parseFloat(quote.price_per_unit) || 0,
      delivery_fee: parseFloat(quote.delivery_fee) || 0,
      payment_terms: quote.payment_terms || "Immediate",
      negotiation_summary: summary,
      outcome: recorderData.outcome || "success",
      successful_concession: concession,
      final_price: finalPrice,
      final_delivery_fee: finalDelivery,
      lessons: lessons,
    };

    try {
      const res = await recordNegotiationOutcome(outcomePayload, {
        message: "Negotiation outcome recorded",
        supplier: actualSupplier,
        product: actualProduct,
      });

      const isLive = Boolean(res?.isLive || (res?.data && res.data.message && res.data.message.includes("Hindsight")));

      // Advance journey stage to 6 (LEARN)
      setActiveStageId(6);

      // Add to activities truthfully with actual supplier and outcome details
      setActivities((prev) => [
        {
          id: Date.now(),
          supplier: actualSupplier,
          product: actualProduct,
          text: isLive
            ? `Outcome retained in Hindsight: ${actualSupplier} agreed to ₹${finalPrice}/unit (${concession})`
            : `Outcome saved (Demo mode): ${actualSupplier} agreed to ₹${finalPrice}/unit (${concession})`,
          time: "Just now",
          type: "retain",
        },
        ...prev.slice(0, 15),
      ]);

      if (isLive) {
        setIsBackendLive(true);
        showToast(`Outcome for ${actualSupplier} successfully encoded into Hindsight memory!`);
      } else {
        showToast("Outcome saved locally (Demo mode - Backend offline).");
      }

      // Update timeline to reflect the closed outcome
      setTimelineData((prev) => [
        ...prev,
        {
          date: "Closed",
          title: "Negotiation Outcome",
          tag: "Success",
          price: `₹${finalPrice}/unit`,
          delivery: finalDelivery === 0 ? "FREE delivery" : `₹${finalDelivery.toLocaleString()} delivery`,
          note: `Closed at ₹${finalPrice}/unit with ${concession} on ${quote.quantity} ${quote.unit} of ${actualProduct}.`,
        },
      ]);

      // Save as cross-supplier benchmark for future comparisons on the same product
      saveStoredBenchmark({
        supplier: actualSupplier,
        product: actualProduct,
        final_price: finalPrice,
        final_delivery_fee: finalDelivery,
        quantity: quote.quantity,
        unit: quote.unit,
        payment_terms: quote.payment_terms,
      });

      return res;
    } catch (err) {
      console.warn("Error in handleSaveOutcome:", err);
      showToast("Could not save outcome to backend. Saved locally.");
      return { isLive: false, error: err.message };
    } finally {
      setIsSavingOutcome(false);
    }
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 60);
  };

  const isTechCoreCanonical =
    Boolean(quote.supplier?.toLowerCase().includes("techcore")) &&
    Boolean(quote.product?.toLowerCase().includes("microcontroller"));

  const activeMemories = isTechCoreCanonical
    ? (memoriesList || [])
    : (memoriesList || []).filter((m) => isMemoryRelevant(m, quote.supplier, quote.product));

  const exactProductMemories = isTechCoreCanonical
    ? (memoriesList || [])
    : (activeMemories || []).filter((m) => isExactSupplierProductMatch(m, quote.supplier, quote.product));

  const hasProductMemories = isTechCoreCanonical
    ? true
    : Boolean(isMemoryLive && exactProductMemories && exactProductMemories.length > 0);


  const currentSupplierClean = quote.supplier?.trim().toLowerCase() || "";

  const displayedActivities = activities.filter((act) => {
    if (!act.supplier) return true; // Global system events apply everywhere
    if (isTechCoreCanonical) {
      return act.supplier.toLowerCase().includes("techcore");
    }
    return act.supplier.toLowerCase() === currentSupplierClean;
  });

  const finalActivities =
    displayedActivities.length > 0
      ? displayedActivities
      : [
          {
            id: "system-ready",
            text: `Negotiation cockpit active for ${quote.supplier || "Supplier"} (${quote.product || "Product"})`,
            time: "Now",
            type: "system",
          },
          {
            id: "system-online",
            text: "Hindsight Bank 'Supplier-Negotiation-Memory-Agent' online",
            time: "Active",
            type: "system",
          },
        ];

  return (
    <div className="app-container">
      {/* Ambient Mouse-following radial glow */}
      <div
        className="ambient-cursor-glow"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
        }}
      />

      {/* Subtle Background Gradients */}
      <div className="bg-ambient-blob blob-top-left" />
      <div className="bg-ambient-blob blob-bottom-right" />
      <div className="bg-grid-overlay" />

      {/* Sticky Navigation */}
      <Navbar
        isBackendLive={isBackendLive}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="app-toast-pill">
          <span className="toast-dot" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Sections */}
      <main className="main-content">
        {activeSection === "catalog" ? (
          <CatalogManager
            products={products}
            suppliers={suppliers}
            onSelectProduct={handleSelectProductFromCatalog}
            onSelectSupplier={handleSelectSupplierFromCatalog}
            onOpenAddProduct={handleOpenAddProduct}
            onOpenAddSupplier={handleOpenAddSupplier}
            currentProduct={quote.product}
            currentSupplier={quote.supplier}
            onBackToWorkspace={() => scrollToSection("workspace")}
          />
        ) : (
          <>
            {/* Hero Area with AI Memory Core */}
            <Hero
              mouseOffset={mouseOffset}
              quote={quote}
              memories={exactProductMemories}
              hasMemories={hasProductMemories}
              historyData={historyData}
              onStartNegotiation={() => scrollToSection("workspace")}
              onExploreMemory={() => scrollToSection("memory-recall")}
            />

            {/* Dashboard Metrics Strip */}
            <MetricsStrip />

            {/* Main Application Dashboard: Negotiation Workspace */}
            <section id="workspace" className="workspace-section">
              <div className="workspace-header-block">
                <div className="section-badge-pill violet">
                  <span>INTELLIGENT NEGOTIATION COCKPIT</span>
                </div>
                <h2 className="section-title-large">Negotiation Workspace</h2>
                <p className="section-desc-large">
                  Give the agent the current quote. It will bring the relevant history back and formulate tactical counter-offers.
                </p>
              </div>

              <div className="workspace-layout-grid">
                {/* Left Column: Form & Activity */}
                <div className="workspace-col-left">
                  <QuoteForm
                    quote={quote}
                    setQuote={setQuote}
                    onAnalyze={handleAnalyze}
                    isAnalyzing={isAnalyzing}
                    onSelectPreset={handleSelectPreset}
                    activePresetIndex={activePresetIndex}
                    products={products}
                    suppliers={suppliers}
                    onOpenAddProduct={handleOpenAddProduct}
                    onOpenAddSupplier={handleOpenAddSupplier}
                    onResetMemory={handleResetMemory}
                  />

                  {/* Analysis Loading Experience */}
                  {isAnalyzing && (
                    <div className="analysis-loader-container">
                      <AnalysisLoader stageIndex={analysisStage} />
                    </div>
                  )}

                  {/* Live Memory Activity Feed */}
                  <MemoryActivity activities={finalActivities} />
                </div>

                {/* Right Column: Memory Recall & Timeline */}
                <div className="workspace-col-right">
                  {hasAnalyzed ? (
                    <>
                      {/* 1. Live Memory Recall */}
                      <MemoryRecall
                        history={historyData}
                        memories={activeMemories}
                        supplierName={quote.supplier}
                        productName={quote.product}
                        isLive={isMemoryLive}
                      />

                      {/* 2. Memory Timeline */}
                      <MemoryTimeline
                        timeline={timelineData}
                        supplierName={quote.supplier}
                        productName={quote.product}
                        hasMemories={hasProductMemories}
                        currentQuote={quote}
                        memories={activeMemories}
                      />
                    </>
                  ) : (
                    <div className="workspace-empty-placeholder glass-panel">
                      <div className="empty-state-icon">🧠</div>
                      <h3 className="empty-state-title">No Active Negotiation Loaded</h3>
                      <p className="empty-state-desc">
                        Click <strong>"Analyze Negotiation"</strong> above or select a demo scenario to recall Hindsight memories and formulate counter-offers.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {hasAnalyzed && (
                <div className="workspace-analysis-wide">
                  <AIStrategy
                    strategy={strategyData}
                    hasMemories={hasProductMemories}
                    onUseCounterOffer={handleUseCounterOffer}
                  />
                  <CounterOffer
                    comparison={strategyData?.comparison}
                    hasMemories={hasProductMemories}
                    onUseCounter={handleUseCounterOffer}
                    onEditCounter={() => scrollToSection("workspace")}
                  />
                  <CompetitiveQuoteContext
                    currentQuote={quote}
                    memories={memoriesList}
                  />
                </div>
              )}
            </section>

            {/* Draggable Negotiation Journey Section */}
            <NegotiationJourney
              activeStageId={activeStageId}
              onSelectStage={(id) => setActiveStageId(id)}
            />

            {/* Outcome Recording Section (Close the Deal) */}
            <OutcomeRecorder
              key={`${quote.supplier?.trim() || ""}-${quote.product?.trim() || ""}-${quote.quantity ?? ""}-${quote.unit ?? ""}-${quote.price_per_unit ?? ""}-${quote.delivery_fee ?? ""}`}
              quote={quote}
              supplier={quote.supplier}
              product={quote.product}
              onSaveOutcome={handleSaveOutcome}
              isSaving={isSavingOutcome}
            />

            {/* Supplier Intelligence Dossiers */}
            <SupplierIntelligence
              supplier={quote.supplier}
              product={quote.product}
              memories={activeMemories}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onAddProduct={handleAddProduct}
        initialName={modalInitialSearch}
      />

      {/* Add Supplier Modal */}
      <AddSupplierModal
        isOpen={isAddSupplierModalOpen}
        onClose={() => setIsAddSupplierModalOpen(false)}
        onAddSupplier={handleAddSupplier}
        initialName={modalInitialSearch}
      />
    </div>
  );
}
