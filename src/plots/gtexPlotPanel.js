import Plot from 'react-plotly.js';
import axios from 'axios';
import { global_colors } from '../utilities/constants.js';
import targeturl from '../targeturl.js';
import { apiBaseUrl } from '../utilities/constants.js';
import {ExpandedPlotViewButton} from '../components/ExpandedPlotView';

var routeurl = apiBaseUrl;

export function gtexSend(UID, setGtexState, gtexState) {
  var postedData = {"data": {"uid": UID}}
  axios({
    method: "post",
    url: (routeurl.concat("/api/datasets/gtexData")),
    data: postedData,
    headers: { "Content-Type": "application/json" },
  })
    .then(function (response) {
      var new_vec = response["data"]["result"][0];
      //console.log("new_vec", new_vec);
      gtexPlot(new_vec, setGtexState);
  })  
}

export function gtexPlot(vec, setGtexState, flag="NO"){
  var datarray = [];
  var counter = 0;
  for (const [key, value] of Object.entries(vec)) {
          if(key != "uid")
          {
          //console.log(key, value);
          var tmparr = value.split("|");
          key = key.replace(/\_/g, " ");
          var curcolor = global_colors[counter];
          datarray.push({
            y: tmparr,
            type: 'violin',
            mode: 'lines+markers',
            name: key,
            marker: {color: curcolor},
          });
          counter = counter + 1;
          }
  }

  var available_width = window.innerWidth;
  var available_height = window.innerHeight;
  var width_to_use = flag == "NO" ? 0.25 * available_width : 0.520 * available_width;
  var height_to_use = flag == "NO" ? 500 : 600;
  var id_to_use = flag == "NO" ? "munch2" : "bunch2";

  const plotobj = <><div id={id_to_use}><Plot
              data={datarray}
              layout={ {width: width_to_use, 
                        height: height_to_use,
                        margin: {
                          l: 48,
                          r: 16,
                          b: 250,
                          t: 40
                        },
                        showlegend: false,
                        title: {
                          text: "GTEX",
                          font: {
                            family: 'Arial, monospace',
                            size: 11,
                            color: '#7f7f7f'
                            }
                        },
                        yaxis:{
                        range: [0, 1],
                        title: {
                          text: 'PSI Value',
                          font: {
                            family: 'Arial, monospace',
                            size: 16,
                            color: '#7f7f7f'
                          }
                        }},
                        xaxis:{
                        title: {
                          text: 'GTEX',
                          font: {
                            family: 'Arial, monospace',
                            size: 16,
                            color: '#7f7f7f'
                          }
                        }
                      }} }
  /></div><div style={{display:"inline-block", width:"100%"}}>
  <span style={{float: "right"}}>
    <ExpandedPlotViewButton inputType={"gtex"}></ExpandedPlotViewButton>
  </span>
  </div></>
  if(flag == "NO")
  {
    setGtexState({gtexPlot: plotobj})
  }
}

/*function gtexPlotPanel(vec, setGtexState)
{
  var gtexPlotObj = gtexPlot(vec, setGtexState);
  var expandObject = expandedPlotViewSetup(vec, setGtexState)
  var ocvPanel = <>
  {gtexPlotObj}
  {expandObject}
  </>;
  return ocvPanel;
}

function expandedPlotViewSetup(vec, setGtexState, flag="YES")
{
  var inputData = {"vec": vec,
    "setGtexState": setGtexState,
    "flag": flag}
  var returnobj = <><ExpandedPlotViewButton inputData={inputData} inputFunction={gtexPlot} inputType={"gtex"}></ExpandedPlotViewButton></>
  return returnobj;
}*/