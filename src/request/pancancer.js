import axios from 'axios';
import { apiBaseUrl } from '../utilities/constants.js';

var routeurl = apiBaseUrl;

function pancancerUiFields(arg, targeturl)
{
	//console.log("start request");
	const export_dict = {};
	const cancername = arg["cancerType"];
	const pancancercallback = arg["pancancerupdate"];
	const signature = arg["signature"];
  	//console.log("cancername", cancername);
	var postdata = {"data": {"cancerName": cancername, "signature": signature}};
  	//console.log("post data", postdata);
	axios({
	    method: "post",
	    data: postdata,
	    url: routeurl.concat("/api/datasets/pancancer"),
	    headers: { "Content-Type": "application/json" },
	})
	.then(function (response)
	{
		var samples = response["data"]["samples"];
		var pctable = response["data"]["pancancersignature"];
		console.log("fer1", samples);
		console.log("fer2", response["data"]["uniqueclusters"]);
		//console.log("pctable", response["data"]);
		pancancercallback({"DEtableData": response["data"]["pancancerDE"], "tableData": response["data"]["pancancersignature"], "clusterLength": response["data"]["uniqueclusters"], "cancer": cancername, "uniqueGenesPerSignature": response["data"]["pancancerGeneCount"]});
	});
}

export default pancancerUiFields;
