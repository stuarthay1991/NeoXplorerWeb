import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { apiBaseUrl } from '../utilities/constants.js';

var routeurl = apiBaseUrl;

function collectSignatures(arg, targeturl)
{
  const export_dict = {};
  const cancername = arg["cancerType"];
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
  });
}

module.exports.collectSignatures = collectSignatures;
