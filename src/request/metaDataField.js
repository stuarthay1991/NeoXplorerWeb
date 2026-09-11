import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { apiBaseUrl } from '../utilities/constants.js';

var routeurl = apiBaseUrl;

function metaDataField(arg, targeturl)
{
  	const filter = arg["filter"];
  	const keys = arg["keys"];
  	const number = arg["number"];
  	var value = arg["value"];
  	var name = arg["name"];
  	const cancer = arg["cancer"];
  	const preQ = arg["pre_queueboxchildren"];
  	const stateQboxchildren = arg["queueboxchildren"];
  	const exportView = arg["export"];
    var postedData = {};
    var selectedFields = {};
    var prevFields = [];

  	exportView["filter"] = [];

  	for(var i = 0; i < keys[filter].length; i++)
  	{
  		var item = preQ["children"][keys[filter][i]];
    	var queryString = item.props.value;
    	queryString = queryString.replace(/(\r\n|\n|\r)/gm, "");
      prevFields.push({"key": item.props.name, "value": queryString});
    	exportView["filter"].push((item.props.name.concat("#").concat(queryString)));
    	//sendToViewPane["filter"].push((item.props.name.concat("#").concat(myString)));
  	}
  	name = name.replace(/(\r\n|\n|\r)/gm, "");
  	value = value.replace(/(\r\n|\n|\r)/gm, "");
    postedData = {"data": {"cancerType": cancer, "prevFields": prevFields, "selectedField": {"key": name, "value": value}}};

  	axios({
    	method: "post",
    	url: routeurl.concat("/api/datasets/getsamples"),
    	data: postedData,
    	headers: { "Content-Type": "application/json" },
  	})
    .then(function (response) {
      //console.log("selectfield response code starting...");
      var in_criterion = response["data"]["single"];
      var selected_left = response["data"]["meta"];
      var current_number_of_samples = response["data"]["meta"];
      console.log("DEBUG: ", selected_left, arg["parentResultAmt"]["events"])
      var resamt = {"samples": selected_left, "events": arg["parentResultAmt"]["events"]};
      //console.log("selectfield repsonse: ", response["data"]);
      stateQboxchildren["children"][number] = <QueueMessage key={number} number={number} name={name} get={number} value={value} type={"samples"} total_selected={in_criterion} total_left={selected_left}/>
      //updateQueueBox(curCancer, keys["filter"].length, queueboxchildren, queueboxsignatures);
      const callback = arg["setState"];
      callback(resamt, stateQboxchildren, preQ, keys, exportView);
      //console.log("meta...callback...ended", keys, callback);
      //console.log("selectfield response code finished.");
  	})
}

export default metaDataField;
