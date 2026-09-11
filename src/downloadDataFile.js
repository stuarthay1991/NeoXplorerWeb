import axios from 'axios';
import { apiBaseUrl } from './utilities/constants.js';
import * as d3 from 'd3';
import { jsPDF } from 'jspdf'
import 'svg2pdf.js'

var routeurl = apiBaseUrl;

//This function transforms the raw data for visualizing transcripts into a downloadable format whereupon it is exported to
//the user in a .csv file.
export function downloadExonPlotData(downloadableFileName, contentToDownload){
  var blob_text = "";
  for (const [key, value] of Object.entries(contentToDownload[0])) {
        blob_text = blob_text.concat(key);
        blob_text = blob_text.concat(",");
  }

  blob_text = blob_text.slice(0, -1);
  blob_text = blob_text.concat("\n");

  for(var i = 0; i < contentToDownload.length; i++)
  {
    for (const [key, value] of Object.entries(contentToDownload[i])) {
          blob_text = blob_text.concat(value);
          blob_text = blob_text.concat(",");
    }
    blob_text = blob_text.slice(0, -1);
    blob_text = blob_text.concat("\n");
  }
  var filename;
  filename = downloadableFileName;

  var uri = "data:application/octet-stream," + encodeURIComponent(blob_text);
  var link = document.createElement("a");
  link.download = filename;
  link.href = uri;

  document.body.appendChild(link);
  link.click();
  // Cleanup the DOM
  document.body.removeChild(link);
}

export function downloadPdfFunction(filename){
  var svg = document.getElementById('supp1_svg'); // or whatever you call it
  var serializer = new XMLSerializer();
  var burg = serializer.serializeToString(svg);
  const postData = {};
  postData["data"] = {};
  postData["data"]["svg"] = burg;
  postData["data"]["height"] = d3.select('#supp1_dimensions').attr("farthestY");
  postData["data"]["width"] = d3.select('#supp1_dimensions').attr("farthestX");
  postData["data"]["filename"] = filename;
  var height_temp = d3.select('#supp1_dimensions').attr("farthestY");
  var width_temp = d3.select('#supp1_dimensions').attr("farthestX");
  console.log("9900", height_temp, width_temp);
  axios({
    method: "post",
    url: routeurl.concat("/api/datasets/createPdf"),
    data: postData,
    responseType: 'blob'
  })
  .then(function (response) {
      //console.log("full return from heatmap: ", response)
      document.getElementById("LoadingStatusDisplay").style.display = "none";
      //console.log("resLog", response["data"]);
      console.log(response);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'download.pdf';
        
      document.body.appendChild(a);
      a.click();
        
      window.URL.revokeObjectURL(url);
  })

}

export function downloadHeatmapFunction(filename){

  var heatmapLabelSvg = document.getElementById('HEATMAP_LABEL_svg');
  var serializer = new XMLSerializer();
  heatmapLabelSvg = serializer.serializeToString(heatmapLabelSvg);
  var heatmapLabelHeight = document.getElementById('HEATMAP_LABEL').clientHeight;

  var heatmapColumnClustersSvg = document.getElementById('HEATMAP_CC_svg');
  heatmapColumnClustersSvg = serializer.serializeToString(heatmapColumnClustersSvg);
  var heatmapColumnClustersHeight = document.getElementById('HEATMAP_CC').clientHeight;

  var heatmapOncospliceClustersSvg = document.getElementById('HEATMAP_OncospliceClusters_svg');
  heatmapOncospliceClustersSvg = serializer.serializeToString(heatmapOncospliceClustersSvg);
  var heatmapOncospliceClustersHeight = document.getElementById('HEATMAP_OncospliceClusters').clientHeight;

  var heatmapSvg = document.getElementById('HEATMAP_0_svg');
  heatmapSvg = serializer.serializeToString(heatmapSvg);
  var heatmapSvg_height_temp = d3.select('#svg_base_rect_id').attr("height");
  var heatmapSvg_width_temp = d3.select('#wompumio').attr("farthestX");
  
  const postData = {};
  postData["data"] = {};
  postData["data"]["heatmapSvg"] = heatmapSvg;

  postData["data"]["heatmapLabelSvg"] = heatmapLabelSvg;
  postData["data"]["heatmapColumnClustersSvg"] = heatmapColumnClustersSvg;
  postData["data"]["heatmapOncospliceClustersSvg"] = heatmapOncospliceClustersSvg;
  postData["data"]["heatmapLabelHeight"] = heatmapLabelHeight;
  postData["data"]["heatmapColumnClustersHeight"] = heatmapColumnClustersHeight;
  postData["data"]["heatmapOncospliceClustersHeight"] = heatmapOncospliceClustersHeight;
  postData["data"]["filename"] = filename;

  var heatmapRowLabelSvg = document.getElementById("HEATMAP_ROW_LABEL_svg");
  heatmapRowLabelSvg = serializer.serializeToString(heatmapRowLabelSvg);
  var heatmapRowLabelWidth = d3.select('#heatmaprowlabeldimensionsid').attr("width");
  console.log("widths", heatmapRowLabelWidth, heatmapSvg_width_temp);

  postData["data"]["heatmapRowLabelSvg"] = heatmapRowLabelSvg;

  postData["data"]["height"] = parseInt(heatmapSvg_height_temp) + parseInt(heatmapLabelHeight) + parseInt(heatmapColumnClustersHeight) + parseInt(heatmapOncospliceClustersHeight);
  postData["data"]["heatmapWidth"] = heatmapSvg_width_temp;
  postData["data"]["rowLabelWidth"] = heatmapRowLabelWidth;

  //console.log("9900", height_temp, width_temp);
  axios({
    method: "post",
    url: routeurl.concat("/api/datasets/createPdfHeatmap"),
    data: postData,
    responseType: 'blob'
  })
  .then(function (response) {
      //console.log("full return from heatmap: ", response)
      document.getElementById("LoadingStatusDisplay").style.display = "none";
      //console.log("resLog", response["data"]);
      console.log(response);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'download.pdf';
        
      document.body.appendChild(a);
      a.click();
        
      window.URL.revokeObjectURL(url);
  })
}
