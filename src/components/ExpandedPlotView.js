import React from 'react';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { useLayoutEffect, useReducer, useRef } from "react";
import { createPortal } from "react-dom";
import Box from '@material-ui/core/Box';
import { oncospliceClusterViolinPlot } from '../plots/oncospliceClusterViolinPlotPanel.js'
import { apiBaseUrl } from '../utilities/constants.js';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import GetAppIcon from '@material-ui/icons/GetApp.js';

const spboxProps = {border: 3, margin: 3};

var routeurl = apiBaseUrl;

export function ExpandedPlotViewButton(props)
{
    //var indat = props.inputData;
    var id_to_use = "munch";
    if(props.inputType == "oncosplice"){id_to_use = "munch";}
    if(props.inputType == "hierarchical"){id_to_use = "kobra";}
    if(props.inputType == "samplefilter"){id_to_use = "lub2";}
    if(props.inputType == "gtex"){id_to_use = "munch2";}

    return (
    <div>
        <Button uppercase={false} onClick={() => downloadPlotlyFunction(id_to_use,props.inputType,"monkey")}
        style={{backgroundColor:"black",
        borderRadius:'8px',
        display:'inline-block',
        cursor:"cursor",
        color:'#ffffff',
        borderColor: 'white',
        fontFamily: 'Roboto',
        fontSize:'16px',
        fontWeight:'bold',
        padding:'5px 16px',
        textDecoration:'none',
        textShadow:'0px 1px 0px #3d768a',
        textTransform: 'none'}}> <GetAppIcon fontSize={"large"}></GetAppIcon></Button>
    </div>
    );
}

function downloadPlotlyFunction(div_id, intype, indat){

    /*var plotobj = oncospliceClusterViolinPlot(indat["selectedRow"], indat["selectedExpressionArray"], indat["heatmapColumnArray"], indat["oncospliceSampleLabels"], indat["selectedOncospliceSignature"], indat["cancer"], indat["flag"]);
    return(
        <div id="friojka">
            {plotobj}
        </div>
    );*/

    var svg = document.getElementById(div_id); // or whatever you call it
    svg = svg.getElementsByClassName("main-svg");
    //console.log("wogganuts", svg);
    svg = svg[0];
    var serializer = new XMLSerializer();
    var burg = serializer.serializeToString(svg);

    const postData = {};
    postData["data"] = {};
    postData["data"]["svg"] = burg;
    postData["data"]["height"] = svg.clientHeight;
    postData["data"]["width"] = svg.clientWidth;
    postData["data"]["filename"] = intype;
    //var height_temp = d3.select('#supp1_dimensions').attr("farthestY");
    //var width_temp = d3.select('#supp1_dimensions').attr("farthestX");
    //console.log("9900", height_temp, width_temp);
    axios({
      method: "post",
      url: routeurl.concat("/api/datasets/createPlotlyPdf"),
      data: postData,
      responseType: 'blob'
    })
    .then(function (response) {
        //console.log("full return from heatmap: ", response)
        document.getElementById("LoadingStatusDisplay").style.display = "none";
        //console.log("resLog", response["data"]);
        //console.log(response);
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = intype.concat(".pdf");
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    })
  }
