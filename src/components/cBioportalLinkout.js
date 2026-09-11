import React from 'react';
import Button from 'react-bootstrap/Button';
import Tooltip from '@material-ui/core/Tooltip';
import axios from 'axios';
import { apiBaseUrl } from '../utilities/constants.js';
import targeturl from '../targeturl.js';

var routeurl = apiBaseUrl;

function goToCBio(uuid)
{
	window.open(("https://www.cbioportal.org/comparison/survival?comparisonId=".concat(uuid)), "_blank");
}

//This function retrieves the sample names and groups from the parent component and formats them into the proper format for use in cBioportal.
//After formatting, axios is used to send the information to a PHP file that uses a cURL command to retrieve the string needed to complete the cBioportal url.
function sendSamplesRetrieveURL(props)
{
	let rawSampleNamesAndGroups = props.data;
	let cBioportalJsonData = [];
	for (var groupName in rawSampleNamesAndGroups)
	{
		let tempHoldingArray = []
		for (let k = 0; k < rawSampleNamesAndGroups[groupName].length; k++)
		{
			let stredit = rawSampleNamesAndGroups[groupName][k].split("_");
			tempHoldingArray.push((stredit[0].concat("-").concat(stredit[1]).concat("-").concat(stredit[2]).concat("-").concat(stredit[3].slice(0, -1))).toUpperCase());
		}
		if(tempHoldingArray.length > 0)
		{
			cBioportalJsonData.push(tempHoldingArray);
		}
	}
	console.log("cBioportalJsonData", cBioportalJsonData, rawSampleNamesAndGroups);
	var studyID;
	//console.log("Wagga", res["data"]);
	var tir = {"BRCA": "brca_tcga_pan_can_atlas_2018",
		"BLCA": "blca_tcga",
		"CESC": "cesc_tcga",
		"COAD": "coad_tcga_gdc",
		"ESCA": "esca_tcga",
		"GBM": "gbm_tcga",
		"HNSC": "hnsc_tcga",
		"KICH": "kich_tcga",
		"KIRC": "kirc_tcga",
		"LGG": "lgg_tcga",
		"LIHC": "lihc_tcga",
		"LUAD": "luad_tcga",
		"LUSC": "lusc_tcga",
		"OV": "ov_tcga",
		"PAAD": "paad_tcga",
		"PRAD": "prad_tcga",
		"PCPG": "pcpg_tcga",
		"READ": "read_tcga",
		"SARC": "sarc_tcga",
		"SKCM": "skcm_tcga",
		"STAD": "stad_tcga",
		"TGCT": "tgct_tcga",
		"THCA": "thca_tcga",
		"UCEC": "ucec_tcga"	
	}
	studyID = tir[props.cancer];
	console.log("cbiosendoff_studyid: ", studyID, props.cancer);
	let curlCommandJsonDataObject = {"groups": [], "origin": [studyID]};

	for(let i in cBioportalJsonData)
	{
		let nameSet = Array.isArray(props.label[i]) == true ? props.label[i][0] : props.label[i];
		curlCommandJsonDataObject["groups"][i] = {};
		curlCommandJsonDataObject["groups"][i]["name"] = nameSet;
		curlCommandJsonDataObject["groups"][i]["description"] = "";
		curlCommandJsonDataObject["groups"][i]["studies"] = [];
		curlCommandJsonDataObject["groups"][i]["studies"][0] = {};
		curlCommandJsonDataObject["groups"][i]["studies"][0]["id"] = studyID;
		curlCommandJsonDataObject["groups"][i]["studies"][0]["samples"] = cBioportalJsonData[i];
		curlCommandJsonDataObject["groups"][i]["studies"][0]["patients"] = cBioportalJsonData[i];
		curlCommandJsonDataObject["groups"][i]["origin"] = [];
		curlCommandJsonDataObject["groups"][i]["origin"][0] = studyID;
		curlCommandJsonDataObject["groups"][i]["uid"] = "62665b890934121b56df06b".concat(i.toString());
		curlCommandJsonDataObject["groups"][i]["isSharedGroup"] = false;
		curlCommandJsonDataObject["groups"][i]["nonExistentSamples"] = [];
	}

	var cBioportalFormData = curlCommandJsonDataObject;
	console.log("pre-cbio", cBioportalFormData);
	axios({
		method: "post",
		url: (routeurl.concat("/api/datasets/cbioCurlCommand")),
		data: cBioportalFormData,
		headers: { "Content-Type": "application/json" },
	})
	.then(function (response) {
		//console.log("cbio", response);
		var returned_uuid = response["data"]["id"];
		//uuid in this case is a comparison id returned by the curl command. It gives us the correct destination for our survival plot.
		goToCBio(returned_uuid);
	})

}

//This component facilitates the retrieval of information from cBioportal (using our selected sample names) to complete a URL linkout for visualizing
//survival plots.
function CbioportalLinkout(props)
{
	var isDisabled = props.cancer == "AML_Leucegene" ? true : false;
	var buttonStyles = isDisabled == false ? {"cursor":'pointer', "backgroundColor":'#EFAD18', "opacity":1} : {"cursor":'not-allowed', "backgroundColor":'grey', "opacity":0.5};
	var tooltipMessage = isDisabled == false ? "View cBioportal analysis" : "cBioportal analysis not available for this cancer";
	return(
		<Tooltip title={tooltipMessage}>
		<Button uppercase={false} disabled={isDisabled} onClick={() => sendSamplesRetrieveURL(props)} 
		    style={{backgroundColor:buttonStyles["backgroundColor"],
		    borderRadius:'8px',
		    display:'inline-block',
		    cursor:buttonStyles["cursor"],
		    color:'#ffffff',
		    borderColor: 'white',
		    fontFamily: 'Roboto',
		    opacity:buttonStyles["opacity"],
		    fontSize:'16px',
		    fontWeight:'bold',
		    padding:'13px 32px',
		    textDecoration:'none',
		    textShadow:'0px 1px 0px #3d768a',
		    textTransform: 'none'}}>cBioportal</Button>
		</Tooltip>
	)
}

export default CbioportalLinkout;