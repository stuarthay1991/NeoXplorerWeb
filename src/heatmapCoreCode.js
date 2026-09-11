import React from 'react';
import { createPortal } from 'react-dom';
import * as d3 from 'd3';
import axios from 'axios';
import DeckGL from '@deck.gl/react';
import { COORDINATE_SYSTEM, OrthographicView } from '@deck.gl/core';
import { SolidPolygonLayer } from '@deck.gl/layers';
import { global_colors, apiBaseUrl } from './utilities/constants.js';
import { downloadHeatmapFunction } from './downloadDataFile.js';
import { showNavLoading } from './components/NavBarDropdown';
import { gtexSend } from './plots/gtexPlotPanel.js';
import {
  completeHeatmapLoadingUI,
  finishHeatmapLoadingUI,
  getHeatmapLoadingProgress,
  HEATMAP_LOADING_FADE_MS,
  isHeatmapCoreLoadingActive,
  registerHeatmapCoreLoadingListener,
  registerHeatmapLoadingFadeOutListener,
  setHeatmapLoadingProgress,
  unregisterHeatmapCoreLoadingListener,
  unregisterHeatmapLoadingFadeOutListener,
} from './heatmapLoadingState.js';

var routeurl = apiBaseUrl;

let metarepostFn = null;

export function configureHeatmapCore({ metarepost }) {
  metarepostFn = metarepost;
}

function metarepost(name, setFilterState, setOkmapLabelState) {
  if (metarepostFn) {
    metarepostFn(name, setFilterState, setOkmapLabelState);
  }
}

function createOkmapTableCell(name, value) {
  return { name, value };
}

function oldLinkOuts(instuff) {
  var [chr1, chr2] = instuff.split("|");
  var [flatchr1, twor1_split] = chr1.split(":");
  var [flatchr2, twor2_split] = chr2.split(":");

  var link = "http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg38&lastVirtModeType=default&lastVirtModeExtraState=&virtModeType=default&virtMode=0&nonVirtPosition=&position=";

  return (
    <div>
      <a href={`${link}${flatchr1}%3A${twor1_split}%2D${twor1_split[1]}&hgsid=765996783_dwaxAIrKY42kyCWOzQ3yL51ATzgG`} target="_blank">{chr1}</a>
      <br />
      <a href={`${link}${flatchr2}%3A${twor2_split}%2D${twor2_split[1]}&hgsid=765996783_dwaxAIrKY42kyCWOzQ3yL51ATzgG`} target="_blank">{chr2}</a>
    </div>
  );
}

function makeLinkOuts(chrm, c1, c2, c3, c4){
  var full1 = chrm.concat(":").concat(c1).concat("-").concat(c2);
  var full2 = chrm.concat(":").concat(c3).concat("-").concat(c4);
  var link1 = "http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg38&lastVirtModeType=default&lastVirtModeExtraState=&virtModeType=default&virtMode=0&nonVirtPosition=&position=";
  var link2 = "http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg38&lastVirtModeType=default&lastVirtModeExtraState=&virtModeType=default&virtMode=0&nonVirtPosition=&position=";

  return(
    <div>
    <a href={link1.concat(chrm).concat("%3A").concat(c1).concat("%2D").concat(c2).concat("&hgsid=765996783_dwaxAIrKY42kyCWOzQ3yL51ATzgG")} target="_blank">{full1}</a>
    <br />
    <a href={link2.concat(chrm).concat("%3A").concat(c3).concat("%2D").concat(c4).concat("&hgsid=765996783_dwaxAIrKY42kyCWOzQ3yL51ATzgG")} target="_blank">{full2}</a>
    </div>
  );
}

function updateOkmapTable(data, okmapTable, setOkmapTable){
  var chrm = data["chromosome"];
  var newcoord = chrm == undefined ? oldLinkOuts(data["coordinates"]) : makeLinkOuts(chrm, data["coord1"], data["coord2"], data["coord3"], data["coord4"]);
  var new_row = [
  createOkmapTableCell("Altexons", data["altexons"]),
  createOkmapTableCell("Protein Predictions", data["proteinpredictions"]),
  createOkmapTableCell("Cluster ID", data["clusterid"]),
  createOkmapTableCell("Coordinates", newcoord),
  createOkmapTableCell("Event Annotation", data["eventannotation"]),
  ];
  setOkmapTable({curAnnots: new_row});
}

function uidConvertForHeatmap(uid) {
  var parts = uid.split(":");
  var secondComp = parts[2].split("|")[0];
  return parts[0] + ":" + secondComp + "|" + parts[3];
}

const HEATMAP_ROW_LABEL_DIV = "HEATMAP_ROW_LABEL";
let currentHeatmapRowLabelSelection = null;
let heatmapRowLabelStyleRefresh = null;

function registerHeatmapRowLabelRefresh(fn) {
  heatmapRowLabelStyleRefresh = fn;
}

function heatmapValueToRgb(cur_square_val) {
  if (cur_square_val < 0.05 && cur_square_val > -0.05) {
    return [0, 0, 0];
  }

  var isNegative = cur_square_val <= -0.05;
  var multiplier = isNegative ? -210 * 3 : 210 * 3;
  var integerval = Math.min(Math.max(10 + multiplier * cur_square_val, 0), 255);
  var magic_others = Math.min(
    Math.max(Math.floor(cur_square_val * (isNegative ? 100 : 10)), 0),
    255,
  );
  var r = isNegative ? magic_others : integerval;
  var g = isNegative ? integerval : integerval;
  var b = isNegative ? integerval : magic_others;
  return [r, g, b];
}

function heatmapValueToCss(cur_square_val) {
  var rgb = heatmapValueToRgb(cur_square_val);
  return "rgb(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ")";
}

const HEATMAP_DRAW_YSCALE = 15;
const HEATMAP_CELL_PULSE_MS = 2000;
const HEATMAP_CELL_BRIGHTEN_AMOUNT = 0.28;
const HEATMAP_BUILD_ROWS_PER_CHUNK = 50;
const HEATMAP_DECK_STABLE_FRAMES = 3;
const HEATMAP_LOADING_SCROLL_PX_PER_SEC = 180;
const HEATMAP_LOADING_BAR_HEIGHT = 12;
const HEATMAP_SAMPLE_BAR_HEIGHT = 115;
const HEATMAP_CLUSTER_BAR_HEIGHT = 16;
const HEATMAP_ROW_LABEL_WIDTH = 280;
const HEATMAP_LOADING_PLACEHOLDER_ROWS = 40;

function computeHeatmapXscale(colCount) {
  if (!colCount) {
    return 0;
  }
  var base_re_wid = window.innerWidth;
  var standard_width = 1438;
  var adjust_width = (base_re_wid / standard_width) * 1.5;
  return (500 / colCount) * adjust_width;
}

function getMockLayoutMetrics(colCount, rowCount, xscale, chromeLayout) {
  var safeColCount = Math.max(1, colCount || 1);
  var safeRowCount = Math.max(1, rowCount || 40);
  var scale = xscale > 0 ? xscale : computeHeatmapXscale(safeColCount);
  var cellWidth = Math.max(1, scale);
  var stepSize = cellWidth - 0.1;
  var heatmapWidth = safeColCount * stepSize;
  var heatmapHeight = safeRowCount * HEATMAP_DRAW_YSCALE;
  var chrome = chromeLayout || getDefaultChromeLayout(heatmapWidth, heatmapHeight);
  var totalHeight = chrome.heatmap.y + chrome.heatmap.height;
  var rowLabelRight = chrome.rowLabel
    ? chrome.rowLabel.x + chrome.rowLabel.width
    : heatmapWidth + HEATMAP_ROW_LABEL_WIDTH;
  return {
    colCount: safeColCount,
    rowCount: safeRowCount,
    cellWidth: cellWidth,
    stepSize: stepSize,
    heatmapWidth: heatmapWidth,
    heatmapHeight: heatmapHeight,
    chrome: chrome,
    totalWidth: Math.max(heatmapWidth + HEATMAP_ROW_LABEL_WIDTH, rowLabelRight),
    totalHeight: totalHeight,
  };
}

function measureChromeLayout(sectionId) {
  var section = document.getElementById(sectionId);
  if (!section) {
    return null;
  }
  var sectionRect = section.getBoundingClientRect();

  function measureHost(hostId) {
    var el = document.getElementById(hostId);
    if (!el) {
      return null;
    }
    var rect = el.getBoundingClientRect();
    var height = rect.height > 0 ? rect.height : el.offsetHeight;
    var width = rect.width > 0 ? rect.width : el.offsetWidth;
    if (height <= 0) {
      return null;
    }
    return {
      x: rect.left - sectionRect.left,
      y: rect.top - sectionRect.top,
      width: width,
      height: height,
    };
  }

  var label = measureHost("HEATMAP_LABEL");
  var cc = measureHost("HEATMAP_CC");
  var onco = measureHost("HEATMAP_OncospliceClusters");
  var heatmap = measureHost("HEATMAP_0");
  var rowLabel = measureHost("HEATMAP_ROW_LABEL");
  if (!label || !cc || !onco) {
    return null;
  }

  return {
    label: label,
    cc: cc,
    onco: onco,
    heatmap: heatmap || {
      x: 0,
      y: onco.y + onco.height,
      width: label.width,
      height: 0,
    },
    rowLabel: rowLabel,
  };
}

function getDefaultChromeLayout(heatmapWidth, heatmapHeight) {
  var y = 0;
  var label = { x: 0, y: y, width: heatmapWidth, height: HEATMAP_SAMPLE_BAR_HEIGHT };
  y += HEATMAP_SAMPLE_BAR_HEIGHT;
  var cc = { x: 0, y: y, width: heatmapWidth, height: HEATMAP_CLUSTER_BAR_HEIGHT };
  y += HEATMAP_CLUSTER_BAR_HEIGHT;
  var onco = { x: 0, y: y, width: heatmapWidth, height: HEATMAP_CLUSTER_BAR_HEIGHT };
  y += HEATMAP_CLUSTER_BAR_HEIGHT;
  var heatmap = { x: 0, y: y, width: heatmapWidth, height: heatmapHeight };
  var rowLabel = {
    x: heatmapWidth,
    y: y,
    width: HEATMAP_ROW_LABEL_WIDTH,
    height: heatmapHeight,
  };
  return { label: label, cc: cc, onco: onco, heatmap: heatmap, rowLabel: rowLabel };
}

function buildLoadingSnapshot(props) {
  return {
    cols: (props.cols || []).slice(),
    cc: (props.cc || []).slice(),
    oncospliceClusters: props.oncospliceClusters || {},
    labelState: props.labelState,
    rowUids: (props.rowData || []).map(function (row) {
      return uidConvertForHeatmap(row.uid);
    }),
    clusterName: props.clusterName || "",
    xscale: props.xscale > 0 ? props.xscale : computeHeatmapXscale((props.cols || []).length),
    chromeLayout: measureChromeLayout(props.sectionId),
  };
}

function getLoadingPlaceholderColCount() {
  if (typeof window === "undefined") {
    return 100;
  }
  return Math.max(60, Math.min(150, Math.floor(window.innerWidth / 7)));
}

function withLoadingPlaceholder(snapshot) {
  if (snapshot.cols && snapshot.cols.length > 0) {
    return snapshot;
  }
  var colCount = getLoadingPlaceholderColCount();
  var cols = [];
  var cc = [];
  var oncospliceClusters = Object.assign({}, snapshot.oncospliceClusters || {});
  for (var i = 0; i < colCount; i++) {
    var colName = "loading_col_" + i;
    cols.push(colName);
    cc.push(String((i % 3) + 1));
    oncospliceClusters[colName] = String(i % 2);
  }
  var rowUids = [];
  for (var r = 0; r < HEATMAP_LOADING_PLACEHOLDER_ROWS; r++) {
    rowUids.push("");
  }
  var xscale = computeHeatmapXscale(colCount);
  var stepSize = Math.max(1, xscale > 0 ? xscale - 0.1 : 1);
  var heatmapWidth = colCount * stepSize;
  var heatmapHeight = HEATMAP_LOADING_PLACEHOLDER_ROWS * HEATMAP_DRAW_YSCALE;
  var chromeLayout =
    snapshot.chromeLayout || getDefaultChromeLayout(heatmapWidth, heatmapHeight);
  return Object.assign({}, snapshot, {
    cols: cols,
    cc: cc,
    oncospliceClusters: oncospliceClusters,
    rowUids: rowUids,
    xscale: xscale,
    chromeLayout: chromeLayout,
  });
}

function getLoadingScreenLayout(props) {
  var snapshot = withLoadingPlaceholder(buildLoadingSnapshot(props || {}));
  var layout = getMockLayoutMetrics(
    snapshot.cols.length,
    snapshot.rowUids.length,
    snapshot.xscale,
    snapshot.chromeLayout,
  );
  if (layout.chrome.heatmap.height <= 0) {
    layout.chrome.heatmap.height = layout.heatmapHeight;
    layout.totalHeight = layout.chrome.heatmap.y + layout.heatmapHeight;
    if (layout.chrome.rowLabel) {
      layout.chrome.rowLabel.height = layout.heatmapHeight;
    }
  }
  return layout;
}

function truncateCanvasText(ctx, text, maxWidth) {
  var value = String(text || "");
  if (!value || ctx.measureText(value).width <= maxWidth) {
    return value;
  }
  var truncated = value;
  while (truncated.length > 1 && ctx.measureText(truncated + "\u2026").width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + "\u2026";
}

function drawLoadingTitle(ctx, x, y, width, progress) {
  var loadingProgress = progress || getHeatmapLoadingProgress();
  var loadKind = loadingProgress.loadKind || "Signature";
  var label = loadingProgress.label || "heatmap";
  var percent = typeof loadingProgress.percent === "number" ? loadingProgress.percent : 0;
  var status = loadingProgress.status || "Loading...";
  var maxTextWidth = Math.max(80, width - 16);

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#0F6A8B";
  ctx.font = "bold 20px Arial";
  ctx.fillText("Loading " + loadKind, x + 8, y + 8);
  ctx.font = "bold 17px Arial";
  ctx.fillText(truncateCanvasText(ctx, label, maxTextWidth), x + 8, y + 30);
  ctx.font = "bold 18px Arial";
  ctx.fillText(Math.round(percent) + "%", x + 8, y + 52);
  ctx.font = "14px Arial";
  ctx.fillStyle = "#333333";
  ctx.fillText(truncateCanvasText(ctx, status, maxTextWidth), x + 8, y + 74);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
}

function drawSimpleScrollingBar(ctx, x, y, width, elapsed, percent) {
  var barHeight = HEATMAP_LOADING_BAR_HEIGHT;
  var trackPadX = 8;
  var trackX = x + trackPadX;
  var trackWidth = Math.max(40, width - trackPadX * 2);
  var radius = barHeight / 2;

  function fillRoundRect(rx, ry, rw, rh, rr) {
    var r = Math.min(rr, rh / 2, rw / 2);
    ctx.beginPath();
    ctx.moveTo(rx + r, ry);
    ctx.arcTo(rx + rw, ry, rx + rw, ry + rh, r);
    ctx.arcTo(rx + rw, ry + rh, rx, ry + rh, r);
    ctx.arcTo(rx, ry + rh, rx, ry, r);
    ctx.arcTo(rx, ry, rx + rw, ry, r);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = "#E6EEF2";
  fillRoundRect(trackX, y, trackWidth, barHeight, radius);

  var fillRatio = Math.max(0, Math.min(1, (typeof percent === "number" ? percent : 0) / 100));
  if (fillRatio > 0) {
    ctx.fillStyle = "#0F6A8B";
    fillRoundRect(trackX, y, Math.max(radius * 2, trackWidth * fillRatio), barHeight, radius);
  }

  var shimmerWidth = Math.max(48, trackWidth * 0.22);
  var travel = trackWidth + shimmerWidth;
  var scrollPx = (elapsed / 1000) * HEATMAP_LOADING_SCROLL_PX_PER_SEC;
  var shimmerX = trackX + (scrollPx % travel) - shimmerWidth;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(trackX + radius, y);
  ctx.arcTo(trackX + trackWidth, y, trackX + trackWidth, y + barHeight, radius);
  ctx.arcTo(trackX + trackWidth, y + barHeight, trackX, y + barHeight, radius);
  ctx.arcTo(trackX, y + barHeight, trackX, y, radius);
  ctx.arcTo(trackX, y, trackX + trackWidth, y, radius);
  ctx.closePath();
  ctx.clip();

  var gradient = ctx.createLinearGradient(shimmerX, y, shimmerX + shimmerWidth, y);
  gradient.addColorStop(0, "rgba(255,255,255,0)");
  gradient.addColorStop(0.45, "rgba(255,255,255,0.65)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(shimmerX, y, shimmerWidth, barHeight);
  ctx.restore();
}

function brightenHeatmapColor(color) {
  return [
    Math.min(255, Math.round(color[0] + (255 - color[0]) * HEATMAP_CELL_BRIGHTEN_AMOUNT)),
    Math.min(255, Math.round(color[1] + (255 - color[1]) * HEATMAP_CELL_BRIGHTEN_AMOUNT)),
    Math.min(255, Math.round(color[2] + (255 - color[2]) * HEATMAP_CELL_BRIGHTEN_AMOUNT)),
    color[3] != null ? color[3] : 255,
  ];
}

function getPulsedCellColor(baseColor, brightColor, progress) {
  var blend = progress <= 0.5 ? progress * 2 : (1 - progress) * 2;
  return [
    Math.round(baseColor[0] + (brightColor[0] - baseColor[0]) * blend),
    Math.round(baseColor[1] + (brightColor[1] - baseColor[1]) * blend),
    Math.round(baseColor[2] + (brightColor[2] - baseColor[2]) * blend),
    baseColor[3],
  ];
}

function buildHeatmapCellsChunked(dataset, col_list, xscale, yscale, onComplete, onProgress) {
  var rect_width = 1 * xscale;
  var step_size = rect_width - 0.1;
  var cells = [];
  var farthestX = 0;
  var plotHeight = dataset.length * yscale;
  var rowIdx = 0;

  function reportProgress() {
    if (onProgress && dataset.length > 0) {
      onProgress(rowIdx / dataset.length);
    }
  }

  function processChunk() {
    var endRow = Math.min(rowIdx + HEATMAP_BUILD_ROWS_PER_CHUNK, dataset.length);

    for (; rowIdx < endRow; rowIdx++) {
      var data = dataset[rowIdx];
      var x_pointer = 0;
      var yTop = rowIdx * yscale;

      for (var colIdx = 0; colIdx < col_list.length; colIdx++) {
        var cur_square_val = parseFloat(data[col_list[colIdx]]);
        var rgb = heatmapValueToRgb(cur_square_val);
        var baseColor = [rgb[0], rgb[1], rgb[2], 255];
        var brightColor = brightenHeatmapColor(baseColor);

        cells.push({
          rowIdx: rowIdx,
          colIdx: colIdx,
          x: x_pointer,
          y: yTop,
          width: rect_width,
          height: yscale,
          polygon: [
            [x_pointer, yTop],
            [x_pointer + rect_width, yTop],
            [x_pointer + rect_width, yTop + yscale],
            [x_pointer, yTop + yscale],
          ],
          baseColor: baseColor,
          brightColor: brightColor,
        });

        x_pointer += step_size;
      }

      farthestX = x_pointer;
    }

    reportProgress();

    if (rowIdx < dataset.length) {
      requestAnimationFrame(processChunk);
      return;
    }

    onComplete({
      cells: cells,
      farthestX: farthestX,
      canvasWidth: farthestX,
      canvasHeight: plotHeight,
      plotHeight: plotHeight,
    });
  }

  requestAnimationFrame(processChunk);
}

function highlightHeatmapRowLabel(convertedUid) {
  if (convertedUid == null) {
    return;
  }

  currentHeatmapRowLabelSelection = convertedUid;

  if (heatmapRowLabelStyleRefresh) {
    heatmapRowLabelStyleRefresh();
  }
}

function exonRequest(GENE, in_data, setViewState, viewState, exonPlotState, setExonPlotState) {
  var postedData = {"data": {"gene": GENE}}
  axios({
    method: "post",
    url: routeurl.concat("/api/datasets/exonViewerData"),
    data: postedData,
    headers: { "Content-Type": "application/json" },
  })
  .then(function (response) {
      var resp = response["data"];
      setViewState({
        toDownloadExon: resp["blob"]["trans"],
        toDownloadGeneModel: resp["blob"]["genemodel"],
        toDownloadJunc: resp["blob"]["junc"]
      });
      setExonPlotState({
        exons: resp["gene"],
        transcripts: resp["transcript"],
        junctions: resp["junc"],
        in_data: in_data,
        scaled: exonPlotState.scaled,
        targetdiv: "supp1",
        downscale: 1
      });
  })
}

export function applyHeatmapRowSelection(data, handlers, options = {}) {
  if (data == null || handlers == null) {
    return false;
  }

  updateOkmapTable(data, handlers.okmapTable, handlers.setOkmapTable);
  handlers.setSelectionState({ selection: data.uid });
  gtexSend(data.examined_junction, handlers.setGtexState, handlers.gtexState);
  var toex = data.examined_junction.split(":");
  exonRequest(
    toex[0],
    data,
    handlers.setViewState,
    handlers.viewState,
    handlers.exonPlotState,
    handlers.setExonPlotState,
  );
  handlers.setPlotUIDstate({ fulldat: data });

  const convertedUid =
    options.convertedUid != null ? options.convertedUid : uidConvertForHeatmap(data.uid);
  highlightHeatmapRowLabel(convertedUid);

  return true;
}

function okmapSelectionHandlersFromProps(props) {
  return {
    setSelectionState: props.setSelectionState,
    setGtexState: props.setGtexState,
    gtexState: props.gtexState,
    setViewState: props.setViewState,
    viewState: props.viewState,
    exonPlotState: props.exonPlotState,
    setExonPlotState: props.setExonPlotState,
    setPlotUIDstate: props.setPlotUIDstate,
    okmapTable: props.okmapTable,
    setOkmapTable: props.setOkmapTable,
  };
}

function updateOkmapLabelState(data){
  this.setState({
    retcols: data
  });
}

let updateOkmapLabel = updateOkmapLabelState;

let updateOkmap = function () {};


class OKMAP_LABEL extends React.Component {
  constructor(props)
  {
    super(props);
    this.target_div = this.props.target_div_id;
    this.col_names = this.props.column_names;
    this.SVG = "None";
    this.SVG_main_group = "";
    this.doc = this.props.doc;
    this.xscale = this.props.xscale;
    this.state = {
      retcols: this.props.okmapLabelState
    };
    updateOkmapLabel = updateOkmapLabelState.bind(this);
  }

  requestUpdate()
  {

  }

  baseSVG(w="120%", h="100%")
  {
    this.SVG = d3.select("#" + this.target_div)
      .append("svg")
      .attr("width", w)
      .attr("height", h)
      .attr("id", this.target_div + "_svg")
      .attr("class", this.target_div + "_svg_class");

    this.SVG_main_group = this.SVG.append("g").attr("id", this.target_div + "_group");

    this.SVG_main_group.append("rect")
      .attr("width", w)
      .attr("height", h)
      .style("stroke", "White")
      .attr("type", "canvas")
      .style("opacity", 0.0)
      .attr("fill", "White");
  }

  writeBase(cols, yscale, xscale)
  {
    // Pre-calculate values to avoid repeated calculations
    var baseWidth = cols.length * (xscale - 0.1) + 75;
    var downloadX = baseWidth;
    var textX = downloadX + 20;
    
    // Batch create base elements
    var baseElements = [
      {
        type: "rect",
        attrs: {
          width: baseWidth,
          height: yscale,
          fill: "White",
          "stroke-width": 0,
          opacity: 0.0
        }
      },
      {
        type: "rect", 
        attrs: {
          x: downloadX,
          y: 0,
          width: 108,
          height: 28,
          fill: "#0F6A8B",
          stroke: "#0F6A8B",
          "stroke-width": 2,
          "float": "right"
        }
      }
    ];

    // Create base rectangles
    baseElements.forEach(element => {
      this.SVG_main_group.append(element.type)
        .each(function() {
          Object.entries(element.attrs).forEach(([key, value]) => {
            if (key.includes("-")) {
              d3.select(this).style(key, value);
            } else {
              d3.select(this).attr(key, value);
            }
          });
        });
    });

    // Create download text with optimized event handlers
    this.SVG_main_group.append("text")
      .attr("x", textX)
      .attr("y", 20)
      .attr("text-anchor", "start")
      .style("font-size", "15px")
      .style('fill', 'white')
      .text("Download")
      .on("mouseover", function(){
            d3.select(this).style("fill", "#EFAD18").style("cursor", "pointer");
      })
      .on("mouseout", function(){
            d3.select(this).style("fill", "white").style("cursor", "default");
      })
      .on("click", function(){
            downloadHeatmapFunction("heatmap");
      });
  }

  writeBlocks(retcols, xscale, writecols)
  {
    var legend_y = 24;
    var legend_y_increment = 18;
    var legend_x = 0;
    var maxcharlen = 0;
    const maxchardef = 13;
    console.log("Legend Column names", retcols);
    var textToUse = retcols["sampleFilterName"];
    
    // Add sample filter name text
    this.SVG_main_group.append("text")
      .attr("x", 0)
      .attr("y", 14)
      .attr("text-anchor", "start")
      .style("font-size", "14px")
      .style('fill', 'black')
      .text(textToUse);
    
    // Pre-calculate legend items for batch rendering
    var legendItems = [];
    var filterRects = [];
    
    for(var p = 0; p < retcols["set"].length; p++)
    {
      if(p != 0 && p % 4 == 0)
      {
        var makedisfunc = 70 * (maxcharlen / maxchardef);
        if(makedisfunc < 50)
        {
          makedisfunc = 50;
        }
        legend_x = legend_x + makedisfunc + 20;
        legend_y = 24;
        maxcharlen = 0;
      }
      
      var colortake = retcols["color"][retcols["set"][p]];
      colortake = parseInt(colortake);
      var color = global_colors[colortake];
      var curchars = retcols["set"][p];
      
      legendItems.push({
        x: legend_x,
        y: legend_y,
        color: color,
        text: curchars,
        textX: legend_x + 20,
        textY: legend_y + 10
      });

      if(curchars != null && curchars.length > maxcharlen)
      {
        maxcharlen = curchars.length;
      }
      legend_y = legend_y + legend_y_increment;
    }

    // Batch render legend rectangles
    this.SVG_main_group.selectAll(null)
      .data(legendItems)
      .enter()
      .append("rect")
      .style("stroke-width", 0)
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", d => d.color);

    // Batch render legend text
    this.SVG_main_group.selectAll(null)
      .data(legendItems)
      .enter()
      .append("text")
      .attr("x", d => d.textX)
      .attr("y", d => d.textY)
      .attr("text-anchor", "start")
      .style("font-size", "11px")
      .style('fill', 'black')
      .text(d => d.text);

    // Add "No annotation" if needed
    if(retcols["set"].length != 0 && retcols["set"].length % 4 == 0)
    {
        legend_x = legend_x + 50;
        legend_y = 24;
    }
    else
    {
      this.SVG_main_group.append("rect")
          .style("stroke-width", 0)
          .attr("x", legend_x)
          .attr("y", legend_y)
          .attr("width", 15)
          .attr("height", 15)
          .attr("fill", 'black');

      this.SVG_main_group.append("text")
          .attr("x", (legend_x+20))
          .attr("y", (legend_y+10))
          .attr("text-anchor", "start")
          .style("font-size", "11px")
          .style('fill', 'black')
          .text("No annotation");
    }
    
    console.log("Write Column names", writecols);
    
    // Pre-calculate filter rectangles for batch rendering
    var x_pointer = 0;
    var rect_length = 1 * xscale;
    var step_size = rect_length - 0.1;
    
    for(var p = 0; p < writecols.length; p++)
    {
      var coledit = writecols[p];
      
      // Optimized column name processing
      let parts = coledit.split("_");
      var newcoledit = parts.slice(0, 4).join("_");
      if(newcoledit.slice(-4) != "_bed")
      {
        coledit = newcoledit + "_bed";
      }
      
      var type = retcols["out"][coledit];
      var colortake = retcols["color"][type];
      colortake = parseInt(colortake);
      var color = global_colors[colortake];
      
      filterRects.push({
        x: x_pointer,
        y: 100,
        width: rect_length,
        height: 20,
        fill: color
      });

      x_pointer += step_size;
    }

    // Batch render filter rectangles
    this.SVG_main_group.selectAll(null)
      .data(filterRects)
      .enter()
      .append("rect")
      .style("stroke-width", 0)
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .attr("width", d => d.width)
      .attr("height", d => d.height)
      .attr("fill", d => d.fill);

    x_pointer = x_pointer + 6;
    this.SVG_main_group.append("text")
        .attr("x", x_pointer)
        .attr("y", 112)
        .attr("text-anchor", "start")
        .style("font-size", "11px")
        .style('fill', 'black')
        .text("Filter Samples");
  }

  componentDidUpdate (prevProps){
    var prevDict = prevProps.uifielddict && prevProps.uifielddict.dict;
    var nextDict = this.props.uifielddict && this.props.uifielddict.dict;
    if(this.props.column_names !== prevProps.column_names || nextDict !== prevDict)
    {
      var tempnode = document.getElementById(this.target_div);
      tempnode.innerHTML = "";
      this.baseSVG("100%", 115);
      this.writeBase(this.props.column_names, 115, this.props.xscale);

      var firstDictKey = nextDict ? Object.entries(nextDict)[0]?.[0] : null;
      if (firstDictKey == null) {
        return null;
      }

      if(this.props.okmapLabelState != "NULL")
      {
        this.writeBlocks(this.props.okmapLabelState, this.props.xscale, this.props.column_names);
      }

      var filterName = this.props.okmapLabelState != "NULL"
        ? this.props.okmapLabelState["sampleFilterName"]
        : firstDictKey;
      var shouldUseFilterName = firstDictKey === "fusion";

      metarepost(
        shouldUseFilterName ? filterName : firstDictKey,
        this.props.setFilterState,
        this.props.setOkmapLabelState
      );
      return null;
    }
  }

  componentDidMount() {
    this.baseSVG("100%", 20);
    this.writeBase(20);

    var dict = this.props.uifielddict && this.props.uifielddict.dict;
    if (!dict) {
      return;
    }
    var dictEntries = Object.entries(dict);
    if (!dictEntries.length) {
      return;
    }

    var firstDictKey = dictEntries[0][0];
    var filterName =
      this.props.okmapLabelState != "NULL" && this.props.okmapLabelState
        ? this.props.okmapLabelState["sampleFilterName"]
        : firstDictKey;
    var shouldUseFilterName = firstDictKey === "fusion";

    metarepost(
      shouldUseFilterName ? filterName : firstDictKey,
      this.props.setFilterState,
      this.props.setOkmapLabelState
    );
  }

  render (){
    var retval = null;
    var tempnode = document.getElementById(this.target_div);
    tempnode.innerHTML = "";
    this.baseSVG("100%", 115);
    this.writeBase(this.props.column_names, 115, this.props.xscale);
    //console.log("3 this.props.column_names", this.props.column_names);
    //console.log("this.state.retcols", this.state.retcols);
    //console.log("this.props.okmapLabelState", this.props.okmapLabelState);
    if(this.props.okmapLabelState != "NULL")
    {
      this.writeBlocks(this.props.okmapLabelState, this.props.xscale, this.props.column_names);
    }
    return(
      null
    );
  }

}

function updateOkmapZoom(y) {
  this.setState({ zoom_level: y, labelsRevision: this.state.labelsRevision + 1 });
}

class OKMAP extends React.Component {
  constructor(props) {
    super(props);
    this.target_div = this.props.target_div_id;
    this.target_row_label_div = HEATMAP_ROW_LABEL_DIV;
    this.CURRENT_SELECTED_UID = null;
    this.farthestX = 0;
    this.buildGeneration = 0;
    this.state = {
      zoom_level: this.props.yscale,
      labelsRevision: 0,
      heatmapReady: false,
      cells: [],
      canvasWidth: 0,
      canvasHeight: 0,
      plotHeight: 0,
      hoveredLabel: null,
      cellPulseProgress: null,
    };
    this.cellPulseFrame = null;
    this.deckRef = null;
    this.waitingForDeckPaint = false;
    this.deckRevealed = false;
    this.deckPaintFrames = 0;
    this.pendingSelectFirstRow = null;
    this.pendingPostReveal = false;
    updateOkmap = updateOkmapZoom.bind(this);
    this.handleRowLabelRefresh = this.handleRowLabelRefresh.bind(this);
    this.handleRowLabelClick = this.handleRowLabelClick.bind(this);
    this.handleDeckAfterRender = this.handleDeckAfterRender.bind(this);
    this.handleHeatmapCoreLoading = this.handleHeatmapCoreLoading.bind(this);
  }

  componentDidMount() {
    registerHeatmapRowLabelRefresh(this.handleRowLabelRefresh);
    registerHeatmapCoreLoadingListener(this.handleHeatmapCoreLoading);
    this.initializeHeatmap(true);
  }

  componentWillUnmount() {
    this.buildGeneration += 1;
    this.waitingForDeckPaint = false;
    this.deckRevealed = false;
    this.deckPaintFrames = 0;
    this.stopCellPulseAnimation();
    unregisterHeatmapCoreLoadingListener(this.handleHeatmapCoreLoading);
    if (heatmapRowLabelStyleRefresh === this.handleRowLabelRefresh) {
      registerHeatmapRowLabelRefresh(null);
    }
  }

  componentDidUpdate(prevProps) {
    var dataChanged =
      this.props.dataset !== prevProps.dataset ||
      this.props.column_names !== prevProps.column_names ||
      this.props.xscale !== prevProps.xscale ||
      this.props.signatureName !== prevProps.signatureName;

    if (dataChanged) {
      showNavLoading(true);
      this.initializeHeatmap(true);
    }
  }

  handleHeatmapCoreLoading(loading) {
    if (loading) {
      this.waitingForDeckPaint = false;
      this.deckRevealed = false;
      this.deckPaintFrames = 0;
      this.pendingSelectFirstRow = null;
      this.pendingPostReveal = false;
      this.preserveHeatmapHostSize();
      this.forceUpdate();
      return;
    }
    this.runPostRevealActions();
  }

  preserveHeatmapHostSize() {
    var host = document.getElementById(this.target_div);
    if (!host) {
      return;
    }
    if (this.state.plotHeight > 0) {
      host.style.height = this.state.plotHeight + "px";
      host.style.minHeight = this.state.plotHeight + "px";
    }
    if (this.state.canvasWidth > 0) {
      host.style.width = this.state.canvasWidth + "px";
      host.style.minWidth = this.state.canvasWidth + "px";
    }
  }

  runPostRevealActions() {
    if (!this.pendingPostReveal) {
      return;
    }
    this.pendingPostReveal = false;
    var row = this.pendingSelectFirstRow;
    this.pendingSelectFirstRow = null;
    var parent = this;
    requestAnimationFrame(function () {
      parent.startCellPulseAnimation();
      if (row) {
        parent.selectRow(row, 0);
      }
    });
  }

  handleRowLabelRefresh() {
    this.forceUpdate();
  }

  stopCellPulseAnimation() {
    if (this.cellPulseFrame != null) {
      cancelAnimationFrame(this.cellPulseFrame);
      this.cellPulseFrame = null;
    }
  }

  startCellPulseAnimation() {
    var parent = this;
    parent.stopCellPulseAnimation();
    var startTime = performance.now();

    var tick = function (now) {
      var elapsed = now - startTime;
      var progress = Math.min(elapsed / HEATMAP_CELL_PULSE_MS, 1);
      parent.setState({ cellPulseProgress: progress });
      if (progress < 1) {
        parent.cellPulseFrame = requestAnimationFrame(tick);
      } else {
        parent.cellPulseFrame = null;
        parent.setState({ cellPulseProgress: null });
      }
    };

    parent.setState({ cellPulseProgress: 0 }, function () {
      parent.cellPulseFrame = requestAnimationFrame(tick);
    });
  }

  getCellDisplayColor(cell) {
    var progress = this.state.cellPulseProgress;
    if (progress == null) {
      return cell.baseColor;
    }
    return getPulsedCellColor(cell.baseColor, cell.brightColor, progress);
  }

  finishHeatmapSwap(selectFirstRow, dataset) {
    showNavLoading(false);
    if (isHeatmapCoreLoadingActive()) {
      this.pendingPostReveal = true;
      this.pendingSelectFirstRow = selectFirstRow && dataset.length > 0 ? dataset[0] : null;
      return;
    }
    var parent = this;
    requestAnimationFrame(function () {
      parent.startCellPulseAnimation();
      if (selectFirstRow && dataset.length > 0) {
        parent.selectRow(dataset[0], 0);
      }
    });
  }

  handleDeckAfterRender() {
    if (!this.waitingForDeckPaint || !isHeatmapCoreLoadingActive()) {
      return;
    }
    if (!this.state.cells.length) {
      return;
    }

    this.deckPaintFrames += 1;
    if (this.deckPaintFrames < HEATMAP_DECK_STABLE_FRAMES) {
      return;
    }

    this.deckPaintFrames = 0;
    this.deckRevealed = true;
    this.waitingForDeckPaint = false;
    setHeatmapLoadingProgress({
      percent: 100,
      status: "Complete",
    });
    var parent = this;
    parent.forceUpdate(function () {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          finishHeatmapLoadingUI();
        });
      });
    });
  }

  initializeHeatmap(selectFirstRow) {
    var parent = this;
    var dataset = this.props.dataset;
    var col_list = this.props.column_names;
    var xscale = this.props.xscale;
    var buildGeneration = ++this.buildGeneration;

    if (!dataset || !dataset.length || !col_list || !col_list.length || !xscale) {
      this.stopCellPulseAnimation();
      this.setState({ heatmapReady: false, cells: [], cellPulseProgress: null });
      showNavLoading(false);
      if (isHeatmapCoreLoadingActive()) {
        finishHeatmapLoadingUI();
      }
      return;
    }

    this.stopCellPulseAnimation();

    buildHeatmapCellsChunked(
      dataset,
      col_list,
      xscale,
      HEATMAP_DRAW_YSCALE,
      function (heatmapLayout) {
      if (buildGeneration !== parent.buildGeneration) {
        return;
      }

      if (isHeatmapCoreLoadingActive()) {
        parent.waitingForDeckPaint = true;
        parent.deckPaintFrames = 0;
        setHeatmapLoadingProgress({
          percent: 90,
          status: "Rendering heatmap...",
        });
      }

      parent.farthestX = heatmapLayout.farthestX;
      parent.setState(
        {
          cells: heatmapLayout.cells,
          canvasWidth: heatmapLayout.canvasWidth,
          canvasHeight: heatmapLayout.canvasHeight,
          plotHeight: heatmapLayout.plotHeight,
          heatmapReady: true,
          labelsRevision: parent.state.labelsRevision + 1,
        },
        function () {
          parent.preserveHeatmapHostSize();
          parent.finishHeatmapSwap(selectFirstRow, dataset);
        },
      );
    },
      function (fraction) {
        if (isHeatmapCoreLoadingActive()) {
          setHeatmapLoadingProgress({
            percent: Math.round(55 + fraction * 30),
            status: "Building heatmap...",
          });
        }
      },
    );
  }

  uidConvert(uid) {
    return uidConvertForHeatmap(uid);
  }

  setSelected(id) {
    highlightHeatmapRowLabel(id);
    this.CURRENT_SELECTED_UID = id;
  }

  selectRow(data, iterationNumber) {
    var converteduid = this.uidConvert(data.uid);
    applyHeatmapRowSelection(data, okmapSelectionHandlersFromProps(this.props), {
      convertedUid: converteduid,
    });
    this.setSelected(converteduid);
  }

  handleRowLabelClick(data) {
    this.selectRow(data, -1);
  }

  getRowLabelFill(converteduid) {
    if (currentHeatmapRowLabelSelection === converteduid) {
      return "green";
    }
    if (this.state.hoveredLabel === converteduid) {
      return "red";
    }
    return "black";
  }

  renderRowLabels() {
    if (isHeatmapCoreLoadingActive() && !this.deckRevealed) {
      return null;
    }

    var parent = this;
    var yscale = this.state.zoom_level;
    var dataset = this.props.dataset;
    var svgHeight = dataset.length * yscale;

    return (
      <svg
        width="100%"
        height={svgHeight}
        id={this.target_row_label_div + "_svg"}
        className={this.target_row_label_div + "_svg_class"}
      >
        <g id={this.target_row_label_div + "_group"}>
          <rect
            width="100%"
            height={svgHeight}
            stroke="White"
            type="canvas"
            style={{ opacity: 0 }}
            fill="White"
          />
          <rect
            width={280}
            height={dataset.length * yscale}
            style={{ opacity: 0 }}
            fill="White"
            id="heatmaprowlabeldimensionsid"
          />
          {dataset.map(function (row, iterationNumber) {
            var converteduid = parent.uidConvert(row.uid);
            var y_point = iterationNumber * yscale;
            var y_set = y_point + yscale / 1.7;
            var fontsize = 12 * (yscale / 15.0);
            if (fontsize > 16) {
              fontsize = 16;
            }

            return (
              <text
                key={converteduid + ":" + iterationNumber + ":" + parent.state.labelsRevision}
                x={10}
                y={y_set}
                textAnchor="start"
                id={converteduid + parent.target_row_label_div + "_id"}
                original={String(y_point)}
                scale={String(yscale)}
                style={{ cursor: "pointer", fontSize: fontsize + "px", fill: parent.getRowLabelFill(converteduid) }}
                onClick={function () {
                  parent.handleRowLabelClick(row);
                }}
                onMouseEnter={function () {
                  parent.setState({ hoveredLabel: converteduid });
                }}
                onMouseLeave={function () {
                  parent.setState({ hoveredLabel: null });
                }}
              >
                {converteduid}
              </text>
            );
          })}
        </g>
      </svg>
    );
  }

  renderExportSvg() {
    var cells = this.state.cells;
    if (!cells.length) {
      return null;
    }

    return (
      <svg
        id={this.target_div + "_svg"}
        className={this.target_div + "_svg_class"}
        width="100%"
        height={this.state.canvasHeight}
        style={{ position: "absolute", left: -10000, top: 0, visibility: "hidden", pointerEvents: "none" }}
      >
        <rect
          width={this.props.column_names.length * (this.props.xscale - 0.1)}
          height={this.state.plotHeight}
          id="svg_base_rect_id"
          style={{ opacity: 1 }}
          fill="Black"
        />
        {cells.map(function (cell, idx) {
          return (
            <rect
              key={"export-" + idx}
              x={cell.x}
              y={cell.y}
              width={cell.width}
              height={cell.height}
              fill={"rgb(" + cell.baseColor[0] + ", " + cell.baseColor[1] + ", " + cell.baseColor[2] + ")"}
              style={{ strokeWidth: 0 }}
            />
          );
        })}
        <rect
          x={0}
          y={0}
          width={1}
          height={1}
          id="wompumio"
          ref={function (node) {
            if (node) {
              node.setAttribute("farthestX", String(this.farthestX));
            }
          }.bind(this)}
          style={{ opacity: 0 }}
        />
      </svg>
    );
  }

  buildHeatmapLayers() {
    var canvasWidth = this.state.canvasWidth;
    var plotHeight = this.state.plotHeight;
    var cells = this.state.cells;
    var parent = this;

    var layers = [
      new SolidPolygonLayer({
        id: "okmap-heatmap-bg",
        data: [
          {
            polygon: [
              [0, 0],
              [canvasWidth, 0],
              [canvasWidth, plotHeight],
              [0, plotHeight],
            ],
          },
        ],
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        getPolygon: function (d) {
          return d.polygon;
        },
        getFillColor: [0, 0, 0, 255],
        filled: true,
        stroked: false,
        parameters: { depthTest: false },
      }),
      new SolidPolygonLayer({
        id: "okmap-heatmap-cells",
        data: cells,
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        getPolygon: function (d) {
          return d.polygon;
        },
        getFillColor: function (d) {
          return parent.getCellDisplayColor(d);
        },
        updateTriggers: {
          getFillColor: [parent.state.cellPulseProgress],
        },
        transitions: {
          getFillColor: HEATMAP_CELL_PULSE_MS / 4,
        },
        filled: true,
        stroked: false,
        parameters: { depthTest: false },
      }),
    ];

    return layers;
  }

  renderHeatmapDeck() {
    var cells = this.state.cells;
    if (!cells.length) {
      return null;
    }

    var loading = isHeatmapCoreLoadingActive();
    if (loading && !this.waitingForDeckPaint && !this.deckRevealed) {
      return null;
    }

    var canvasWidth = this.state.canvasWidth;
    var plotHeight = this.state.plotHeight;
    var layers = this.buildHeatmapLayers();
    var staging = loading && this.waitingForDeckPaint && !this.deckRevealed;

    return (
      <div
        style={{
          width: canvasWidth,
          height: plotHeight,
          margin: 0,
          padding: 0,
          lineHeight: 0,
          display: "block",
          position: staging ? "absolute" : "relative",
          left: staging ? -20000 : 0,
          top: 0,
          visibility: staging ? "hidden" : "visible",
          pointerEvents: staging ? "none" : "auto",
        }}
      >
        {this.renderExportSvg()}
        <DeckGL
          ref={(deck) => {
            this.deckRef = deck;
          }}
          width={canvasWidth}
          height={plotHeight}
          style={{ position: "relative", top: 0, left: 0 }}
          views={new OrthographicView({ id: "okmap-ortho" })}
          viewState={{
            id: "okmap-ortho",
            target: [canvasWidth / 2, plotHeight / 2, 0],
            zoom: 0,
          }}
          controller={false}
          layers={layers}
          onAfterRender={this.handleDeckAfterRender}
        />
      </div>
    );
  }

  render() {
    var heatmapHost = document.getElementById(this.target_div);
    var rowLabelHost = document.getElementById(this.target_row_label_div);

    if (!heatmapHost || !rowLabelHost) {
      return null;
    }

    return (
      <>
        {createPortal(this.renderHeatmapDeck(), heatmapHost)}
        {createPortal(this.renderRowLabels(), rowLabelHost)}
      </>
    );
  }
}

class HeatmapLoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { visible: isHeatmapCoreLoadingActive(), opacity: 1 };
    this.canvasRef = React.createRef();
    this.frameId = null;
    this.fadeTimeout = null;
    this.startTime = performance.now();
    this.snapshot = null;
    this.handleLoadingChange = this.handleLoadingChange.bind(this);
    this.handleFadeOut = this.handleFadeOut.bind(this);
    this.tick = this.tick.bind(this);
    this.setCanvasRef = this.setCanvasRef.bind(this);
  }

  setCanvasRef(canvas) {
    this.canvasRef.current = canvas;
    if (!canvas || !isHeatmapCoreLoadingActive()) {
      return;
    }
    if (!this.snapshot) {
      this.snapshot = buildLoadingSnapshot(this.props);
    }
    this.paintFrame(performance.now());
    if (this.frameId == null) {
      this.frameId = requestAnimationFrame(this.tick);
    }
  }

  componentDidMount() {
    registerHeatmapCoreLoadingListener(this.handleLoadingChange);
    registerHeatmapLoadingFadeOutListener(this.handleFadeOut);
    if (isHeatmapCoreLoadingActive()) {
      this.snapshot = buildLoadingSnapshot(this.props);
      this.startAnimation(true);
    }
  }

  componentWillUnmount() {
    unregisterHeatmapCoreLoadingListener(this.handleLoadingChange);
    unregisterHeatmapLoadingFadeOutListener(this.handleFadeOut);
    this.clearFadeTimeout();
    this.stopAnimation();
  }

  componentDidUpdate(prevProps) {
    if (!isHeatmapCoreLoadingActive() || !this.state.visible) {
      return;
    }
    var prevColCount = (prevProps.cols || []).length;
    var nextColCount = (this.props.cols || []).length;
    if (nextColCount > 0 && nextColCount !== prevColCount) {
      this.snapshot = buildLoadingSnapshot(this.props);
    }
  }

  clearFadeTimeout() {
    if (this.fadeTimeout != null) {
      clearTimeout(this.fadeTimeout);
      this.fadeTimeout = null;
    }
  }

  resetCanvasStyles() {
    var canvas = this.canvasRef.current;
    if (canvas) {
      canvas.style.transition = "";
      canvas.style.opacity = "1";
    }
  }

  handleLoadingChange(loading) {
    if (loading) {
      this.clearFadeTimeout();
      this.resetCanvasStyles();
      this.snapshot = buildLoadingSnapshot(this.props);
      this.startTime = performance.now();
      this.setState({ visible: true, opacity: 1 }, () => {
        this.startAnimation(true);
      });
      return;
    }
    this.snapshot = null;
    this.stopAnimation();
  }

  handleFadeOut() {
    var parent = this;
    parent.stopAnimation();
    parent.setState({ opacity: 1 });

    requestAnimationFrame(function () {
      var canvas = parent.canvasRef.current;
      if (!canvas) {
        completeHeatmapLoadingUI();
        return;
      }

      canvas.style.transition = "opacity " + HEATMAP_LOADING_FADE_MS + "ms ease-out";
      canvas.style.opacity = "0";
      parent.setState({ opacity: 0 });

      parent.clearFadeTimeout();
      parent.fadeTimeout = setTimeout(function () {
        parent.fadeTimeout = null;
        parent.resetCanvasStyles();
        parent.setState({ visible: false, opacity: 1 });
        completeHeatmapLoadingUI();
      }, HEATMAP_LOADING_FADE_MS);
    });
  }

  startAnimation(paintImmediately) {
    this.startTime = performance.now();
    if (!this.state.visible) {
      this.setState({ visible: true }, () => {
        if (paintImmediately) {
          this.paintFrame(performance.now());
        }
        this.frameId = requestAnimationFrame(this.tick);
      });
      return;
    }
    if (paintImmediately) {
      this.paintFrame(performance.now());
    }
    if (this.frameId == null) {
      this.frameId = requestAnimationFrame(this.tick);
    }
  }

  stopAnimation() {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    if (this.state.visible) {
      this.setState({ visible: false });
    }
  }

  tick(now) {
    if (!isHeatmapCoreLoadingActive()) {
      this.stopAnimation();
      return;
    }
    this.paintFrame(now);
    this.frameId = requestAnimationFrame(this.tick);
  }

  paintFrame(now) {
    var canvas = this.canvasRef.current;
    var snapshot = withLoadingPlaceholder(this.snapshot || buildLoadingSnapshot(this.props));
    if (!canvas) {
      return;
    }

    var layout = getMockLayoutMetrics(
      snapshot.cols.length,
      snapshot.rowUids.length,
      snapshot.xscale,
      snapshot.chromeLayout,
    );
    if (layout.totalWidth <= 0 || layout.totalHeight <= 0) {
      return;
    }

    var chrome = layout.chrome;
    if (chrome.heatmap.height <= 0) {
      chrome.heatmap.height = layout.heatmapHeight;
      layout.totalHeight = chrome.heatmap.y + layout.heatmapHeight;
      if (chrome.rowLabel) {
        chrome.rowLabel.height = layout.heatmapHeight;
      }
    }

    if (canvas.width !== layout.totalWidth || canvas.height !== layout.totalHeight) {
      canvas.width = layout.totalWidth;
      canvas.height = layout.totalHeight;
    }
    canvas.style.width = layout.totalWidth + "px";
    canvas.style.height = layout.totalHeight + "px";

    var frameTime = typeof now === "number" ? now : performance.now();
    var elapsed = frameTime - this.startTime;
    var ctx = canvas.getContext("2d");
    var progress = getHeatmapLoadingProgress();
    var percent = typeof progress.percent === "number" ? progress.percent : 0;
    var contentWidth = Math.max(layout.heatmapWidth, 320);
    var titleY = chrome.label ? chrome.label.y : 0;
    var barAreaTop = chrome.label
      ? chrome.label.y + 100
      : 100;
    var barAreaBottom = chrome.heatmap
      ? chrome.heatmap.y + chrome.heatmap.height
      : layout.totalHeight;
    var barY = barAreaTop + Math.max(0, (barAreaBottom - barAreaTop - HEATMAP_LOADING_BAR_HEIGHT) / 2);

    ctx.clearRect(0, 0, layout.totalWidth, layout.totalHeight);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, layout.totalWidth, layout.totalHeight);

    drawLoadingTitle(ctx, 0, titleY, contentWidth, progress);
    drawSimpleScrollingBar(ctx, 0, barY, contentWidth, elapsed, percent);
  }

  draw(now) {
    this.paintFrame(now);
  }

  render() {
    if (!this.state.visible && !isHeatmapCoreLoadingActive()) {
      return null;
    }

    var layout = getLoadingScreenLayout(this.props);

    return (
      <canvas
        ref={this.setCanvasRef}
        width={layout.totalWidth}
        height={layout.totalHeight}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: 25,
          pointerEvents: "none",
          opacity: this.state.opacity,
          width: layout.totalWidth + "px",
          height: layout.totalHeight + "px",
          display: "block",
        }}
      />
    );
  }
}

function HeatmapLoadingShell(props) {
  var layout = getLoadingScreenLayout(props);
  var shellMinHeight = Math.max(
    layout.totalHeight,
    typeof window !== "undefined" ? window.innerHeight * 0.55 : layout.totalHeight,
  );

  return (
    <div
      style={{
        position: "relative",
        marginLeft: 5,
        minHeight: shellMinHeight,
        minWidth: layout.totalWidth,
        backgroundColor: "#ffffff",
      }}
    >
      <div id="heatmap-section" style={{ position: "relative", minHeight: layout.totalHeight }}>
        <div id="HEATMAP_LABEL" style={{ visibility: "hidden", height: 0, overflow: "hidden" }} />
        <div id="HEATMAP_CC" style={{ visibility: "hidden", height: 0, overflow: "hidden" }} />
        <div id="HEATMAP_OncospliceClusters" style={{ visibility: "hidden", height: 0, overflow: "hidden" }} />
        <div style={{ position: "relative", display: "inline-block" }}>
          <span id="HEATMAP_0" />
        </div>
        <span id="HEATMAP_ROW_LABEL" style={{ width: "280px", visibility: "hidden" }} />
        <HeatmapLoadingScreen
          sectionId="heatmap-section"
          cols={props.cols || []}
          cc={props.cc || []}
          oncospliceClusters={props.oncospliceClusters || {}}
          labelState={props.labelState}
          rowData={props.rowData || []}
          xscale={props.xscale || computeHeatmapXscale((props.cols || []).length)}
          clusterName={props.clusterName || ""}
        />
      </div>
    </div>
  );
}

const HeatmapLoadingOverlay = HeatmapLoadingScreen;

export { OKMAP, OKMAP_LABEL, updateOkmap, computeHeatmapXscale, HeatmapLoadingScreen, HeatmapLoadingOverlay, HeatmapLoadingShell };