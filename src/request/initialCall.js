import axios from 'axios';
import { apiBaseUrl } from '../utilities/constants.js';

var routeurl = apiBaseUrl;

function initalCall(arg, targeturl)
{
    console.log("arg", arg);
    const postData = {};
    postData["data"] = {};
    const callback = arg["callback"];
    const pancancercallback = arg["pancancerupdate"];
    var exportView = arg["exportView"];
    postData["data"]["cancerName"] = arg["cancerType"];
    postData["data"]["comparedCancer"] = arg["comparedCancer"];
    postData["data"]["oncospliceClusters"] = arg["oncocluster"];
    postData["data"]["eventType"] = arg["eventType"];
    exportView["cancerType"] = arg["cancerType"];
    //document.getElementById("LoadingStatusDisplay").style.display = "block";
    //document.getElementById("heatmapLoadingDiv").style.display = "block";

    //document.getElementById("HEATMAP_LABEL").style.opacity = 0.2;
    //document.getElementById("HEATMAP_CC").style.opacity = 0.2;
    //document.getElementById("HEATMAP_OncospliceClusters").style.opacity = 0.2;
    //document.getElementById("HEATMAP_0").style.opacity = 0.2;
    //document.getElementById("HEATMAP_ROW_LABEL").style.opacity = 0.2;

    if(arg["sample"] != undefined && arg["sample"] != null){
        postData["data"]["samples"] = [arg["sample"]];
    }
    else{
        postData["data"]["samples"] = undefined;
    }
    postData["data"]["coords"] = arg["coords"];
    postData["data"]["signatures"] = arg["signature"];
    exportView["single"] = arg["signature"];
    postData["data"]["genes"] = arg["genes"];
    console.log("postLog", postData);

    axios({
        method: "post",
        url: routeurl.concat("/api/datasets/heatmapData"),
        data: postData,
        headers: { "Content-Type": "application/json" },
      })
    .then(function (response) {
        //console.log("full return from heatmap: ", response)
        //document.getElementById("LoadingStatusDisplay").style.display = "none";
        //console.log("resLog", response["data"]);
        if(response["data"] != "Error")
        {
          var dateval = response["data"]["date"];
          var heatmapMatrix = response["data"]["rr"];
          var sampleNames = response["data"]["col_beds"];
          var heatmapQuery = response["data"]["getHeatmapDataQuery"];
          var hierarchicalClusterColumns = response["data"]["cci"];
          var oncospliceSignatureClusterColumns = response["data"]["oncospliceClusterIndices"];
          var oncospliceSignatureClusterName = response["data"]["oncospliceClusterName"];
          sampleUiRefresh(postData["data"]["cancerName"], heatmapMatrix, sampleNames, hierarchicalClusterColumns, oncospliceSignatureClusterColumns, oncospliceSignatureClusterName, exportView, callback, postData, pancancercallback, heatmapQuery);
        }
        else
        {
          ///document.getElementById("HEATMAP_LABEL").style.opacity = 1;
          //document.getElementById("HEATMAP_CC").style.opacity = 1;
          //document.getElementById("HEATMAP_OncospliceClusters").style.opacity = 1;
          //document.getElementById("HEATMAP_0").style.opacity = 1;
          //document.getElementById("HEATMAP_ROW_LABEL").style.opacity = 1;
          //document.getElementById("heatmapLoadingDiv").style.display = "none";
          alert("no entries found!");
        }
    })
}

function sampleUiRefresh(cancerType, heatmapMatrix, sampleNames, hierarchicalClusterColumns, oncospliceSignatureClusterColumns, oncospliceSignatureClusterName, exportView, callback, prevPostData, pancancercallback, heatmapQuery)
{
    var postdata = {"data": {"cancerName": cancerType, "signature": prevPostData["data"]["signatures"]}};
    axios({
      method: "post",
      data: postdata,
      url: routeurl.concat("/api/datasets/samples"),
      headers: { "Content-Type": "application/json" },
    })
    .then(function (response) {
      //console.log("full retrun from ui response: ", response)
      exportView["cancer"] = cancerType;
      exportView["ui_field_dict"] = response["data"]["samples"];
      exportView["ui_field_range"] = response["data"]["range"];
      exportView["heatmapQuery"] = heatmapQuery;
      //console.log(sampleNames, "sampleNames")
      //document.getElementById("HEATMAP_LABEL").style.opacity = 1;
      //document.getElementById("HEATMAP_CC").style.opacity = 1;
      //document.getElementById("HEATMAP_OncospliceClusters").style.opacity = 1;
      //document.getElementById("HEATMAP_0").style.opacity = 1;
      //document.getElementById("HEATMAP_ROW_LABEL").style.opacity = 1;
      //document.getElementById("heatmapLoadingDiv").style.display = "none";
      updateSignature(heatmapMatrix, sampleNames, hierarchicalClusterColumns, oncospliceSignatureClusterColumns, oncospliceSignatureClusterName, exportView, callback);
      //pancancercallback({"DEtableData": response["data"]["pancancerDE"], "tableData": response["data"]["pancancersignature"], "clusterLength": response["data"]["uniqueclusters"], "cancer": cancerType, "uniqueGenesPerSignature": response["data"]["pancancerGeneCount"]});
    })
}

function updateSignature(heatmapMatrix, sampleNames, hierarchicalClusterColumns, oncospliceSignatureClusterColumns, oncospliceSignatureClusterName, exportView, callback)
{
  const export_dict = {};
  const cancername = arg["cancerType"];
  const callbackForSignatureList = arg["callbackOne"];
  const callbackForSelectedSignature = arg["callbackTwo"];
  //console.log("updateSignature_1", callbackOne);
  var postdata = {"data": cancername};
  axios({
        method: "post",
        url: routeurl.concat("/api/datasets/signatures"),
        data: postdata,
        headers: { "Content-Type": "application/json" },
    })
  .then(function (response) 
  {
      console.log("CALLBACK RESPONSE", response);
      //console.log("cancername", cancername);
      //console.log("updateHeatmapArgs", args["updateHeatmapArgs"]);
      let sigTranslateVar = response["data"]["signatureTranslate"];
      let firstEntry = Object.keys(response["data"]["signatureTranslate"])[0];
      let simpleNameVar = sigTranslateVar[firstEntry];
      //callbackForSignatureList(response["data"]["signatureTranslate"]);
      var responseSignatureList = response["data"]["signatureTranslate"];
      callback(heatmapMatrix, sampleNames, hierarchicalClusterColumns, oncospliceSignatureClusterColumns, oncospliceSignatureClusterName, exportView, responseSignatureList)
  });
}

export default initalCall;