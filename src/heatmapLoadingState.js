import { cancerDisplayNames } from './constants/cancerTypes.js';

const heatmapCoreLoadingListeners = new Set();
const heatmapLoadingFadeOutListeners = new Set();
const heatmapLoadingProgressListeners = new Set();
let heatmapCoreLoadingActive = false;

const defaultHeatmapLoadingProgress = {
  loadKind: "",
  label: "",
  percent: 0,
  status: "",
};

let heatmapLoadingProgress = Object.assign({}, defaultHeatmapLoadingProgress);

export const HEATMAP_LOADING_FADE_MS = 400;

function getCancerLoadingDisplayName(cancerType) {
  if (!cancerType) {
    return "";
  }
  var code = String(cancerType).toUpperCase();
  return cancerDisplayNames[code] || String(cancerType);
}

var LOADING_SIGNATURE_TOKEN_LABELS = {
  dt: "default tumor",
  bt: "broad tumor",
  da: "default all",
};

function formatLoadingSignatureToken(token) {
  if (!token) {
    return "";
  }
  var lower = String(token).toLowerCase();
  if (LOADING_SIGNATURE_TOKEN_LABELS[lower]) {
    return LOADING_SIGNATURE_TOKEN_LABELS[lower];
  }
  if (/^r\d+$/i.test(token) || /^v\d+$/i.test(token)) {
    return token.toUpperCase();
  }
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

export function formatLoadingSignatureDisplay(signature) {
  if (!signature) {
    return "";
  }
  var value = String(signature).trim();
  if (!value || value === "None") {
    return "";
  }

  value = value.replace(/^psi_/i, "");
  value = value.replace(/_vs_others$/i, "");
  value = value.replace(/-vs-others$/i, "");

  var tokens = value.split(/[_-]+/).filter(Boolean);
  if (!tokens.length) {
    return "";
  }

  return tokens.map(formatLoadingSignatureToken).join(" ");
}

function getLoadingEventKindLabel(eventType) {
  if (eventType === "Genes") {
    return "Genes";
  }
  if (eventType === "Coordinates") {
    return "Coordinates";
  }
  return "Signature";
}

function buildHeatmapLoadingFocus(arg) {
  if (!arg) {
    return "";
  }
  var eventType = arg.eventType || "Signature";
  var focus = "";
  if (eventType === "Genes" && arg.genes && arg.genes.length) {
    focus = arg.genes.filter(Boolean).join(", ");
  } else if (eventType === "Coordinates" && arg.coords && arg.coords.length) {
    focus = arg.coords.filter(Boolean).join(", ");
  } else if (eventType === "Signature") {
    if (arg.oncocluster && arg.oncocluster.length) {
      focus = arg.oncocluster
        .filter(function (entry) {
          return entry && entry !== "None";
        })
        .map(formatLoadingSignatureDisplay)
        .join(", ");
    }
    if (!focus && arg.signature && arg.signature.length) {
      focus = arg.signature
        .filter(function (entry) {
          return entry && entry !== "None";
        })
        .map(formatLoadingSignatureDisplay)
        .join(", ");
    }
  } else if (arg.signature && arg.signature.length) {
    focus = arg.signature
      .filter(function (entry) {
        return entry && entry !== "None";
      })
      .map(formatLoadingSignatureDisplay)
      .join(", ");
  }
  if (arg.sample) {
    focus = focus ? focus + " (" + arg.sample + ")" : String(arg.sample);
  }
  return focus;
}

export function buildHeatmapLoadingLabel(arg) {
  if (!arg) {
    return "heatmap";
  }
  var parts = [];
  if (arg.cancerType) {
    parts.push(getCancerLoadingDisplayName(arg.cancerType));
  }
  var focus = buildHeatmapLoadingFocus(arg);
  if (focus) {
    parts.push(focus);
  }
  return parts.join(" — ") || "heatmap";
}

export function buildHeatmapLoadingProgress(arg) {
  if (!arg) {
    return {
      loadKind: "Signature",
      label: "heatmap",
    };
  }
  return {
    loadKind: getLoadingEventKindLabel(arg.eventType),
    label: buildHeatmapLoadingLabel(arg),
  };
}

export function getHeatmapLoadingProgress() {
  return heatmapLoadingProgress;
}

export function setHeatmapLoadingProgress(update) {
  heatmapLoadingProgress = Object.assign({}, heatmapLoadingProgress, update);
  heatmapLoadingProgressListeners.forEach(function (listener) {
    listener(heatmapLoadingProgress);
  });
}

export function resetHeatmapLoadingProgress() {
  heatmapLoadingProgress = Object.assign({}, defaultHeatmapLoadingProgress);
}

export function registerHeatmapLoadingProgressListener(listener) {
  heatmapLoadingProgressListeners.add(listener);
}

export function unregisterHeatmapLoadingProgressListener(listener) {
  heatmapLoadingProgressListeners.delete(listener);
}

export function beginHeatmapLoadingSession(arg) {
  resetHeatmapLoadingProgress();
  var loadingMeta = buildHeatmapLoadingProgress(arg);
  setHeatmapLoadingProgress({
    loadKind: loadingMeta.loadKind,
    label: loadingMeta.label,
    percent: 5,
    status: "Fetching heatmap data...",
  });
  setHeatmapCoreLoading(true);
  hideHeatmapChromeForLoading();
}

export function setHeatmapCoreLoading(loading) {
  heatmapCoreLoadingActive = !!loading;
  heatmapCoreLoadingListeners.forEach(function (listener) {
    listener(loading);
  });
}

export function isHeatmapCoreLoadingActive() {
  return heatmapCoreLoadingActive;
}

export function registerHeatmapCoreLoadingListener(listener) {
  heatmapCoreLoadingListeners.add(listener);
}

export function unregisterHeatmapCoreLoadingListener(listener) {
  heatmapCoreLoadingListeners.delete(listener);
}

export function registerHeatmapLoadingFadeOutListener(listener) {
  heatmapLoadingFadeOutListeners.add(listener);
}

export function unregisterHeatmapLoadingFadeOutListener(listener) {
  heatmapLoadingFadeOutListeners.delete(listener);
}

export function hideHeatmapChromeForLoading() {
  try {
    document.getElementById("HEATMAP_LABEL").style.visibility = "hidden";
    document.getElementById("HEATMAP_CC").style.visibility = "hidden";
    document.getElementById("HEATMAP_OncospliceClusters").style.visibility = "hidden";
    document.getElementById("HEATMAP_ROW_LABEL").style.visibility = "hidden";
  } catch (err) {
    console.log(err);
  }
}

export function showHeatmapChrome() {
  try {
    document.getElementById("HEATMAP_LABEL").style.visibility = "visible";
    document.getElementById("HEATMAP_CC").style.visibility = "visible";
    document.getElementById("HEATMAP_OncospliceClusters").style.visibility = "visible";
    document.getElementById("HEATMAP_ROW_LABEL").style.visibility = "visible";
  } catch (err) {
    console.log(err);
  }
}

export function finishHeatmapLoadingUI() {
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      showHeatmapChrome();
      if (heatmapLoadingFadeOutListeners.size === 0) {
        completeHeatmapLoadingUI();
        return;
      }
      heatmapLoadingFadeOutListeners.forEach(function (listener) {
        listener();
      });
    });
  });
}

export function completeHeatmapLoadingUI() {
  setHeatmapCoreLoading(false);
  resetHeatmapLoadingProgress();
}
