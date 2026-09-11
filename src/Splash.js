import useStyles from './css/useStyles.js';
import '@fontsource/roboto';
import React from 'react';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import SpcInputLabel from './components/SpcInputLabel';
import Plot from 'react-plotly.js';
import splashHeatmap from './images/splashHeatmap.png';
import splashPancancer from './images/splashPancancer.png';
import axios from 'axios';
import { Nav, Dropdown, Button, ButtonToolbar, IconButton} from "rsuite";
import { apiBaseUrl, DropdownCancers } from './utilities/constants.js';
import "rsuite/dist/rsuite.min.css";

const boxProps = {
  border: 3,
};

var available_width = window.innerWidth;
var routeurl = apiBaseUrl;

function splashDataRequest() {
  var bodyFormData = new FormData();
  var postedData = {}
  axios({
    method: "post",
    url: routeurl.concat("/api/datasets/splashDataRequest"),
    data: postedData,
    headers: { "Content-Type": "application/json" },
  })
    .then(function (response) {
      var resp = response["data"];
  })
}

function SplashRow(props) {
  const classes = useStyles();
  var evenClassName = classes.splash_tr;
  var oddClassName = classes.splash_tr_odd;
  return(
    <tr className={props.rowType == "even" ? evenClassName : oddClassName}>
    <td className={classes.splash_td}>{props.column1}</td>
    <td className={classes.splash_td} style={{textAlign: "center"}}>{props.column2}</td>
    </tr>
  )
}

function SplashDiv(props) {
  return(
    <div id={props.id} style={{backgroundColor: "#e4f0f5"}}>
    <Box borderColor="#dbdbdb" {...boxProps}>
      <div style={{background:"linear-gradient(to bottom, #4a8fa8 5%, #476e9e 100%)", backgroundColor: '#0F6A8B', color: "white"}}>
      <span style={{color: "white", margin: 8, marginLeft: 8, fontSize: 16}}>{props.title}</span>
      </div>
        {props.children}
    </Box>
    </div>
  )
}

function TissuePlot(props) {
    //var toving = document.getElementById("tissue_splash_div").width();

    var widthOfPlot = available_width * 0.22;
    var topins = <Plot
    data={[
      {
        type: 'bar',
        x: [20, 14, 23, 9, 11, 32, 16, 7, 10, 18,
            14, 40, 8, 14, 30, 21, 29, 15, 19, 21],
        y: ["Bladder", "Bone", "Brain", "Breast", "Cervical", "Colon", "Esophagus", "Neck", "Kidney", "Liver",
            "Lung", "Ovary", "Pancreas", "Prostate", "Rectum", "Skin", "Stomach", "Synovium", "Thyroid", "Uterus"],
        orientation: 'h',
        marker: {
          color: [
            '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
            '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
            '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
            '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
          ]
        }
      }]}
      layout={ {width: widthOfPlot,
                margin: {
                    l: 64,
                    r: 32,
                    b: 32,
                    t: 32
                },
                title: {
                    text: "Tissues"
                }} }
    >
    </Plot>;
    return topins;
}

function DropdownSet(props) {
  return(
  <div>
    <Dropdown title={props.title}
    onSelect={cancerSelectHandle}
    activeKey={"BLCA"}
    placement="bottomStart"
    size="xs"
    trigger = "hover">
      {props.children}
    </Dropdown>
  </div>);
}

function SplashHeader(props) {
  const classes = useStyles();
  return(
    <tr className={classes.splash_tr}>
    <th className={classes.splash_th}>{props.column1}</th>
    <th className={classes.splash_th}>{props.column2}</th>
    </tr>
  )
}

function cancerSelectHandle(){
  console.log("cancer select");
}

function Splash() {
  const classes = useStyles();
  return(
    <div id="main_splash_div" style={{marginLeft: 50, marginRight: 50}}>
      <br></br>
      <div id="updates_splash_div" style={{borderRadius: 15, borderStyle: "solid", border: 30, borderColor: "red", color: "red"}}>
        <Grid container spacing={3}>
          <Grid item xs={1}></Grid>
          <Grid item xs={11}>
          <span style={{borderRadius: 15, borderStyle: "solid", border: 30, borderColor: "red", color: "red", margin: 5}}>Check out our new Oncosplice updates!</span>
          </Grid>
        </Grid>
      </div>
      <br></br>
      <div id="content_splash_div">
      <Grid container spacing={3}>
          <Grid item xs={1}></Grid>
          <Grid item xs={3}>
            <SplashDiv id={"welcome_splash_div"} title={"Welcome"}>
              <div style={{fontSize: 10, margin: 8, backgroundColor: "#ebf2f5"}}>
              <p>OncoSplice is an NIH supported research project (<a href="https://reporter.nih.gov/search/gxCJoumpGUCBdoMsV60Ycw/project-details/9495857">R01CA226802</a>) focused on defining and understanding novel splicing-defined patient subtypes across human cancers. The OncoSplice web-browser provides interactive access to diverse cancer datasets, enabling the selection of different patient subsets from existing clinical annotations (XenaBrowser) and splicing-events (known and novel). OncoSplice signatures are defined using the OncoSplice analysis workflow (<a href="https://github.com/venkatmi/oncosplice">https://github.com/venkatmi/oncosplice</a>) and in particular the software splice-ICGS. OncoSplice is a branch of the software AltAnalyze (<a href="http://altanalyze.org">http://altanalyze.org</a>).</p>
              <br></br>
              </div>
            </SplashDiv>
            <SplashDiv id={"news_splash_div"} title={"News"}>
                <div style={{margin: 8, fontSize: 10, backgroundColor: "#ebf2f5"}}>
                <Grid container spacing={2}>
                <Grid item xs={8}>Awarded CpG funding to support Oncosplice Development</Grid>
                <Grid item xs={4}>05/09/2024</Grid>
                </Grid>
                </div>
                <div style={{margin: 8, fontSize: 10, backgroundColor: "#ebf2f5"}}>
                <Grid container spacing={2}>
                <Grid item xs={8}>Cancer database updated</Grid>
                <Grid item xs={4}>05/01/2024</Grid>
                </Grid>
                </div>
            </SplashDiv>
            <SplashDiv id={"summary_splash_div"} title={"Summary"}>
                <div style={{margin: 8, width: "90%", height: "90%", textAlign: "center", backgroundColor: "#ebf2f5"}}>
                  <table class="splash_table" style={{width: "100%", height: "90%", textAlign: "center", backgroundColor: "#ebf2f5"}}>
                    <SplashHeader column1="Metric" column2="Value"></SplashHeader>
                    <SplashRow rowType="odd" column1="Cancers" column2="24"></SplashRow>
                    <SplashRow rowType="even" column1="Events" column2="515469"></SplashRow>
                    <SplashRow rowType="odd" column1="Patients" column2="9281"></SplashRow>
                    <SplashRow rowType="even" column1="Metadata Fields" column2="666"></SplashRow>
                    <SplashRow rowType="odd" column1="Splicing Signatures" column2="504"></SplashRow>
                  </table>
                </div>
            </SplashDiv>
          </Grid>
          <Grid item xs={3}>
            <div id="search_splash_div" style={{height: "100%", backgroundColor: "#e4f0f5"}}>
              <div style={{background:"linear-gradient(to bottom, #4a8fa8 5%, #476e9e 100%)", backgroundColor: '#0F6A8B', color: "white"}}>
                <span style={{color: "white", margin: 8, marginLeft: 8, fontSize: 16}}>Search</span>
              </div>
              <div style={{width: "100%", height: "100%", background:"linear-gradient(to bottom, #bdd1d9 5%, #e4f0f5 100%)", backgroundColor: "#F3F3F3", border: "3px solid #CACACA"}}>
                  <div>
                      <div style={{margin: 15, border: "1px solid #CACACA", backgroundColor: "#ebf2f5", borderRadius: "30px", width: "95%", height: "100%"}}>
                        <div style={{margin: 16, width: "100%"}}>
                          <span style={{display: "inline-block", textAlign: "center", width: "80%"}}>
                          <h5 style={{float: "left"}}>Heatmap View</h5>
                          </span>
                          <DropdownSet title={"Cancer Type"}>
                            <DropdownCancers>
                            </DropdownCancers>
                          </DropdownSet>
                          <DropdownSet title={"Samples"}></DropdownSet>
                          <DropdownSet title={"Signature"}></DropdownSet>
                        </div>
                      </div>
                  </div>
                  <div>
                      <div style={{margin: 15, border: "1px solid #CACACA", backgroundColor: "#ebf2f5", borderRadius: "30px", width: "95%", height: "100%"}}>
                        <div style={{margin: 16, width: "100%"}}>
                          <span style={{display: "inline-block", textAlign: "center", width: "80%"}}>
                          <h5 style={{float: "left"}}>Pancancer View</h5>
                          </span>
                          <DropdownSet title={"Cancer Type"}><DropdownCancers></DropdownCancers></DropdownSet>
                          <DropdownSet title={"Signature"}></DropdownSet>
                        </div>
                      </div>
                  </div>
                </div>
            </div>
          </Grid>
          <Grid item xs={4}>
            <div id="tissue_splash_div" style={{height: "100%", backgroundColor: "#e4f0f5"}}>
                <div style={{background:"linear-gradient(to bottom, #4a8fa8 5%, #476e9e 100%)", backgroundColor: '#0F6A8B', color: "white"}}>
                  <span style={{color: "white", margin: 8, marginLeft: 8, fontSize: 16}}>Tissue</span>
                </div>
                <div style={{height: "100%", backgroundColor: "#e4f0f5", border: "3px solid #CACACA"}}>
                    <div id="TissuePlot" style={{textAlign: "center", display: "inline-block", margin: 15, border: "1px solid #CACACA", backgroundColor: "#ebf2f5", borderRadius: "30px", width: "90%", height: "80%"}}>
                      <TissuePlot ></TissuePlot>
                    </div>
                </div>
            </div>
          </Grid>
          <Grid item xs={1}></Grid>
      </Grid>
      </div>
    </div>
  )
}

export default Splash;
