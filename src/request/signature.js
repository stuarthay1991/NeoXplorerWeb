import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { apiBaseUrl } from '../utilities/constants.js';

var routeurl = apiBaseUrl;

//Assign signature to list of UIDs
function mergeSignatures(name, currentListOfUIDs, completeListOfUIDs)
{
  for(let i in currentListOfUIDs)
  {
    try 
    {
      completeListOfUIDs[currentListOfUIDs[i]].push(name);
    } catch (error) 
    {
      completeListOfUIDs[currentListOfUIDs[i]] = [name];
    }
    
  }
  return completeListOfUIDs;
}

//Request signature data from the server; a list of UIDs
function signature(arg, targeturl)
{
  //name, number, filter
  console.log("callback...started");
  var bodyFormData = new FormData();
  const keys = arg["keys"];
  const currentSelection = arg["currentSelection"];
  var completeListOfUIDs = arg["completeListOfUIDs"];
  const preQ = arg["pre_queueboxchildren"];
  const Q = arg["queueboxchildren"];
  const cancer = arg["cancer"];
  var resamt = arg["parentResultAmt"];
  const callback = arg["setState"];
  var name = arg["name"];
  const original_name = name;
  var number = arg["keyval"];
  var filter = arg["type"];
  const sigTranslate = arg["sigTranslate"];
  const exportView = arg["export"];
  exportView["single"] = [];
  var fullSignatureList = [];
  var selectedSignature = "";
  for(let i in keys[filter])
  {
    var queryString = preQ["signatures"][keys[filter][i]].props.name;
    queryString = queryString.replace(/(\r\n|\n|\r)/gm, "");
    if(Object.entries(sigTranslate).length > 0)
    {
      if(sigTranslate[queryString] != undefined)
      {
        queryString = sigTranslate[queryString];
        queryString = queryString.replace("+", "positive_");
      }
      else
      {
        queryString = queryString.replace(" ", "_");
      }
    }
    fullSignatureList.push(queryString);
    exportView["single"].push(queryString); 
  }
  if(Object.entries(sigTranslate).length > 0)
  {
    if(sigTranslate[name] != undefined)
    {
        name = sigTranslate[name];
        name = name.replace("+", "positive_");
    }//TMEPORARY FIX
    else
    {
        name = name.replace(" ", "_");
    }
    name = name.replace(/(\r\n|\n|\r)/gm, "");
    selectedSignature = name;
  }
  else
  {
    name = name.replace(/(\r\n|\n|\r)/gm, "");
    selectedSignature = name;
  }
  var postdata = {"data": {
    "cancer": cancer,
    "selectedField": selectedSignature,
    "prevFields": fullSignatureList
  }};
  axios({
      method: "post",
      url: routeurl.concat("/api/datasets/getsignaturedata"),
      data: postdata,
      headers: { "Content-Type": "application/json" },
  })
    .then(function (response) {
      console.log("signatureResponse", response);
      var in_criterion = response["data"]["single"];
      var selected_left = response["data"]["meta"];
      var current_number_of_events = response["data"]["meta"];
      Q["signatures"][number] = <QueueMessage key={number} number={number} name={"PSI"} get={number} value={name} type={"events"} total_selected={in_criterion} total_left={selected_left}/>
      completeListOfUIDs = mergeSignatures(original_name, response["data"]["result"], completeListOfUIDs);
      resamt = {"samples": arg["parentResultAmt"]["samples"], "events": Object.keys(completeListOfUIDs).length};
      callback(resamt, Q, keys, exportView, currentSelection, completeListOfUIDs);
      //updateQueueBox(curCancer, keys["single"].length, queueboxchildren, queueboxsignatures);
  })
}

export default signature;