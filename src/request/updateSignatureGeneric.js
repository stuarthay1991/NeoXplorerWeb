import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { makeRequest } from './CancerDataManagement.js';
import { apiBaseUrl } from '../utilities/constants.js';

var routeurl = apiBaseUrl;

function updateSignatureGeneric(arg, targeturl)
{
  const export_dict = {};
  const cancername = arg["cancerType"];
  const callbackForSignatureList = arg["callback"];
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
      console.log("CALLBACK RESPONSE", response["data"]["signatureTranslate"]);
      //console.log("cancername", cancername);
      //console.log("updateHeatmapArgs", args["updateHeatmapArgs"]);
      let sigTranslateVar = response["data"]["signatureTranslate"];
      let firstEntry = Object.keys(response["data"]["signatureTranslate"])[0];
      let simpleNameVar = sigTranslateVar[firstEntry];
      callbackForSignatureList(response["data"]["signatureTranslate"]);
      /*callbackForSelectedSignature({"signature": Object.keys(response["data"]["signatureTranslate"])[0],
                                    "simpleName": simpleNameVar,
                                    "oncocluster": simpleNameVar,
                                    "initialized": true});*/
  });
}

export default updateSignatureGeneric;