import React from 'react';
import Button from '@material-ui/core/Button';
import { AccessAlarm, ExpandMore, OpenInNew, Timeline, GetApp, ChevronRight, Add } from '@material-ui/icons';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import ZoomOutIcon from '@material-ui/icons/ZoomOut';
import GetAppIcon from '@material-ui/icons/GetApp';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { borders } from '@material-ui/system';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import CloseIcon from '@material-ui/icons/Close';
import SpcInputLabel from './components/SpcInputLabel';
import FilterItem from './components/FilterItem';
import CustomizedTables from './components/CustomizedTables';
import LabelHeatmap from './components/LabelHeatmap';
import downloadHeatmapText from './components/downloadHeatmapText';
import axios from 'axios';
import Tooltip from '@material-ui/core/Tooltip';
import targeturl from './targeturl.js';
import GridLayout from "react-grid-layout";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Resizable, ResizableBox } from "react-resizable";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import './css/sidebar.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

import Plot from 'react-plotly.js';
import * as d3 from 'd3';
import useStyles from './css/useStyles.js';
import { global_colors } from './utilities/constants.js';

import oncospliceClusterViolinPlotPanel from './plots/oncospliceClusterViolinPlotPanel';
import hierarchicalClusterViolinPlotPanel from './plots/hierarchicalClusterViolinPlotPanel';
import sampleFilterViolinPlotPanel from './plots/sampleFilterViolinPlotPanel';
import { downloadExonPlotData, downloadPdfFunction } from './downloadDataFile.js';
import SetExonPlot from './plots/exonPlot.js';
import OKMAP_COLUMN_CLUSTERS from './plots/okmapColumnClusters.js';
import OKMAP_OncospliceClusters from './plots/okmapOncospliceClusters.js';
import PlotPanel from './plots/plotPanel.js';
import {
  OKMAP,
  OKMAP_LABEL,
  updateOkmap,
  applyHeatmapRowSelection,
  configureHeatmapCore,
  computeHeatmapXscale,
  HeatmapLoadingScreen,
} from './heatmapCoreCode.js';

export { applyHeatmapRowSelection };

import { apiBaseUrl } from './utilities/constants.js';

var routeurl = apiBaseUrl;

var global_meta = [];
var global_sig = [];
var global_data = [];
var global_uifielddict = {};
var global_cancer = "";
var global_signature = "";
var global_trans = "";
var global_cols = [];
var global_cc = [];
var global_OncospliceClusters = [];
var global_Y = "";
var global_adj_height = "";
var global_heat_len = "";
var link1 = "http://genome.ucsc.edu/cgi-bin/hgTracks?db=mm10&lastVirtModeType=default&lastVirtModeExtraState=&virtModeType=default&virtMode=0&nonVirtPosition=&position=";
var link2 = "http://genome.ucsc.edu/cgi-bin/hgTracks?db=mm10&lastVirtModeType=default&lastVirtModeExtraState=&virtModeType=default&virtMode=0&nonVirtPosition=&position=";

function metarepost(name, setFilterState, setOkmapLabelState) {
  //console.log("metarepost set", name, setFilterState);
  var bodyFormData = new FormData();
  if(name != "age range")
  {
    name = name.replaceAll("  ", "__");
    name = name.replaceAll(" ", "_");
  }
  bodyFormData.append("NAME", name);
  bodyFormData.append("CANCER", global_cancer);
  var postData = {"data": {
    "name": name,
    "cancerType": global_cancer
  }}
  axios({
    method: "post",
    url: routeurl.concat("/api/datasets/interactiveFilter"),
    data: postData,
    headers: { "Content-Type": "application/json" },
  })
    .then(function (response) {
      var ret = response["data"];
      console.log("metarepost response data", ret);
      setOkmapLabelState(ret);
      setFilterState({filters: ret["out"], filterName: ret["sampleFilterName"], filterset: ret["set"]});
    })
}

configureHeatmapCore({ metarepost });

function oneUIDrequest(UID) {
  var bodyFormData = new FormData();
  var postData = {"data": {
    "uid": UID,
    "cancerType": global_cancer
  }}
  axios({
    method: "post",
    url: routeurl.concat("/api/datasets/singleUidData"),
    data: postData,
    headers: { "Content-Type": "application/json" },
  })
    .then(function (response) {
      plotUIDupdate(response["data"]["result"][0])
  })
}

function plotUIDupdate(dat)
{
  this.setState({
    fulldat: dat
  })
}

const defaultProps = {
  m: 0.1,
};

const boxProps = {
  border: 3,
};

const gridLayoutStyle = {
  overflow: "scroll",
  margin: 1
}

const boxProps_padding = {
  border: 3,
  margin: 0.1,
  paddingRight: '2px',
  display: 'inline-block',
};

var stat_table = {};

function updateStats(id, input){
    const bottle = [];
    for (const [key, value] of Object.entries(input)) {
        bottle.push(createData(key, value));
    }
    this.setState({
      curSelect: id,
      curAnnots: bottle,
    });
}

function createData(name, value) {
  return { name, value };
}

var rows = [
  createData('-none selected-', '-none selected-'),
];

function FilterHeatmapSelect(props) {
  const classes = useStyles();
  const [state, setState] = React.useState({
    "value": props.filterState.filterName,
    name: 'hai',
  });

  console.log("props.uifielddict.dict", props.uifielddict.dict);

  const handleChange = (event) => {
    const name = event.target.name;
    setState({
      ...state,
      [name]: event.target.value,
      "value": event.target.value
    });
    metarepost(event.target.value, props.setFilterState, props.setOkmapLabelState);
  }

  return (
    <div>
      <SpcInputLabel label={"Show Sample"} customFontSize={"1em"} noSpaceAbove={true}/>
      <FormControl variant="filled" className={classes.formControl}>
        <Select
          native
          value={state.value}
          onChange={handleChange}
          style={{backgroundColor: "white", borderColor:'#EFAD18', border:'2px'}}
          inputProps={{
            name: 'value',
            id: "HeatmapFilterSelect_id",
          }}
        >
          {(() => {
            const options = [];
            for (const [key, value] of Object.entries(props.uifielddict.dict)) {
              var name_selected = key.replaceAll("_", " ");
              name_selected = name_selected.charAt(0).toUpperCase() + name_selected.slice(1);
              if(name_selected != "Fusion" && name_selected != "fusion")
              {
                options.push(<option value={key}>{name_selected}</option>);
              }
            }
            return options;
          })()}
        </Select>
      </FormControl>
    </div>
  );
}


class Stats extends React.Component {
  constructor(props) {
    super(props);
    //updateOkmapTable = updateOkmapTable.bind(this)
  }

  render()
  {
    //console.log("this.state", this.props.okmapTable.curAnnots);
    //if(this.props)
    return(
      <div>
      <SpcInputLabel label={"Event Annotations"}/>
      <div>
      <Box borderColor="#dbdbdb" {...boxProps}>
        <div id="STATS_0">
          <CustomizedTables contents={this.props.okmapTable.curAnnots}/>
        </div>
      </Box>
      </div>
      </div>
    );
  }

}

class Heatmap extends React.Component {
  constructor(props) {
    super(props);
    this.xscale = 0;
    this.state = { domReady: false };
  }

  computeXscale() {
    var cols = this.props.cols || [];
    if (!cols.length) {
      return 0;
    }

    var base_re_wid = window.innerWidth;
    var base_re_high = window.innerHeight;
    var standard_width = 1438;
    var standard_height = 707;
    var adjust_width = (base_re_wid / standard_width) * 1.5;
    var adjust_height = (base_re_high / standard_height) * 1.5;
    global_adj_height = adjust_height;
    return (500 / cols.length) * adjust_width;
  }

  syncHeatmapLayout() {
    var cols = this.props.cols || [];
    var data = this.props.data || [];
    if (!cols.length) {
      return;
    }

    this.xscale = this.computeXscale();
    var heatmapEl = document.getElementById("HEATMAP_0");
    if (!heatmapEl) {
      return;
    }

    heatmapEl.style.transform = "scaleY(1)";
    global_Y = 15;
    global_heat_len = data.length;
    var escale = cols.length * (this.xscale - 0.1);
    heatmapEl.style.width = escale.toString().concat("px");
  }

  componentDidMount() {
    this.syncHeatmapLayout();
    this.setState({ domReady: true });
  }

  componentDidUpdate(prevProps) {
    var data = this.props.data || [];
    var prevData = prevProps.data || [];
    if (
      data.length !== prevData.length ||
      (this.props.cols || []).length !== (prevProps.cols || []).length
    ) {
      this.syncHeatmapLayout();
    }
  }

  render()
  {
    var xscale = this.xscale || this.computeXscale();
    var queryExport = this.props.QueryExport || {};

    return(
      <div>
      <OKMAP
        dataset={this.props.data || []}
        column_names={this.props.cols || []}
        len={(this.props.data || []).length}
        doc={document}
        target_div_id={"HEATMAP_0"}
        xscale={xscale}
        yscale={15}
        norm={1}
        signatureName={queryExport["single"]}
        viewState={this.props.viewState}
        setViewState={this.props.setViewState}
        gtexState={this.props.gtexState}
        setGtexState={this.props.setGtexState}
        exonPlotState={this.props.exonPlotState}
        setExonPlotState={this.props.setExonPlotState}
        selectionState={this.props.selectionState}
        setSelectionState={this.props.setSelectionState}
        filterState={this.props.filterState}
        setFilterState={this.props.setFilterState}
        plotUIDstate={this.props.plotUIDstate}
        setPlotUIDstate={this.props.setPlotUIDstate}
        okmapTable={this.props.okmapTable}
        setOkmapTable={this.props.setOkmapTable}
      />
      {this.state.domReady && (this.props.cols || []).length > 0 && (
      <>
      <OKMAP_LABEL
        target_div_id={"HEATMAP_LABEL"}
        column_names={this.props.cols || []}
        doc={document}
        xscale={xscale}
        setFilterState={this.props.setFilterState}
        uifielddict={this.props.uifielddict}
        setUifielddict={this.props.setUifielddict}
        okmapLabelState={this.props.okmapLabelState}
        setOkmapLabelState={this.props.setOkmapLabelState}
      />
      <OKMAP_COLUMN_CLUSTERS
        target_div_id={"HEATMAP_CC"}
        column_names={this.props.cc || []}
        doc={document}
        xscale={xscale}
      />
      <OKMAP_OncospliceClusters
        target_div_id={"HEATMAP_OncospliceClusters"}
        refcols={this.props.cols || []}
        column_names={this.props.OncospliceClusters || []}
        doc={document}
        trans={global_trans}
        xscale={xscale}
      />
      </>
      )}
      </div>
    );
  }
}

function zoomInHeatmap()
{
  if(global_Y >= (400 * global_adj_height))
  {
    return;
  }
  else
  {
    var temp_y_set = global_Y * 1.5;

    var captain_burgerpants = temp_y_set / 15;

    document.getElementById("HEATMAP_0").style.transformOrigin = "0 0";
    document.getElementById("HEATMAP_0").style.overflowY = "visible";
    document.getElementById("HEATMAP_0").style.height = document.getElementById("HEATMAP_0").style.height * captain_burgerpants;
    document.getElementById("HEATMAP_0").style.transform = "scaleY(".concat(captain_burgerpants.toString()).concat(")");

    global_Y = temp_y_set;
    updateOkmap(global_Y);
  }
}

function zoomOutHeatmap()
{
  if(global_Y < ((400 * global_adj_height) / global_heat_len))
  {
    return;
  }
  else
  {
    var temp_y_set = global_Y / 1.5;

    var captain_burgerpants = temp_y_set / 15;

    var magic_bob = document.getElementById("HEATMAP_0").style.height;
    var fantastic_fred = magic_bob.substring(0, (magic_bob.length - 2));
    var wacky_winston = parseFloat(fantastic_fred) * captain_burgerpants;
    wacky_winston = (wacky_winston.toString()).concat("px");

    document.getElementById("HEATMAP_0").style.transformOrigin = "0 0";
    document.getElementById("HEATMAP_0").style.overflowY = "visible";
    document.getElementById("HEATMAP_0").style.transform = "scaleY(".concat(captain_burgerpants.toString()).concat(")");
    document.getElementById("HEATMAP_0").style.height = wacky_winston;

    global_Y = temp_y_set;
    updateOkmap(global_Y);
  }

}

function fullViewHeatmap()
{
  global_Y = (400 * global_adj_height) / global_heat_len;
  var temp_y_set = global_Y / 15;

  document.getElementById("HEATMAP_0").style.transformOrigin = "0 0";
  document.getElementById("HEATMAP_0").style.overflowY = "visible";
  document.getElementById("HEATMAP_0").style.transform = "scaleY(".concat(temp_y_set.toString()).concat(")");
  document.getElementById("HEATMAP_0").style.height = "400px";

  global_Y = temp_y_set;
  updateOkmap(global_Y);
}

const spboxProps = {border: 3};

function selectionToSup(selection){
  this.setState({
    selection: selection
  })
}

function supFilterUpdate(data)
{
  this.setState({
    filters: data["out"],
    filterset: data["set"]
  })
}

function updateExPlot(exons, transcripts, junctions, in_data){
  this.setState({
      exons: exons,
      transcripts: transcripts,
      junctions: junctions,
      in_data: in_data
  });
}

const SpcCheckbox = withStyles({
  root: {
    color: "#0F6A8B",
    '&$checked': {
      color: "#0F6A8B",
    },
  },
  checked: {},
})((props) => <Checkbox color="default" {...props} />);

function setScaling(boolean_val)
{
  this.setState({
    scaled: boolean_val
  });
}

function ScalingCheckbox(props)
{
  const [state, setState] = React.useState({
      checkedB: false,
    });

    const handleChange = (event) => {
      setState({ ...state, [event.target.name]: event.target.checked });
      props.setExonPlotState({exons: props.exonPlotState.exons,
                        transcripts: props.exonPlotState.transcripts,
                        junctions: props.exonPlotState.junctions,
                        in_data: props.exonPlotState.in_data,
                        scaled: event.target.checked,
                        targetdiv: "supp1",
                        downscale: 1
      })
    };

  return(
  <Tooltip title="Show exon lengths in raw format---no width changes.">
  <div style={{marginLeft: 3}}>
  <FormControlLabel
      control={
          <SpcCheckbox
              checked={state.checkedB}
              onChange={handleChange}
              name="checkedB"
          />
          }
      label="Use Scaled"
  />
  </div>
  </Tooltip>
  );
}

function resizeFunction(event, { element, size }) {
  this.setState({ width: size.width, height: size.height });
}

function ViewPanel(props) {
  const classes = useStyles();
  global_meta = props.Cols;
  global_cancer = props.QueryExport["cancer"];
  global_signature = props.QueryExport["single"];
  //console.log("new signature!", props.QueryExport["single"]);
  global_cols = props.Cols;
  global_cc = props.CC;
  global_OncospliceClusters = props.OncospliceClusters;
  global_trans = props.TRANS;

  /*
  var available_width = screen.width;
  var available_height = screen.height;
  */
  var available_width = window.innerWidth;
  var available_height = window.innerHeight;
  //console.log("width and height", available_width, available_height);
  //console.log("VIEW DATA ENTERED:", props.Data);
  const initialFilterName =
    Object.entries(props.QueryExport["ui_field_dict"] || {})[0]?.[0] ?? null;
  const [localViewState, setLocalViewState] = React.useState({
    toDownloadExon: undefined,
    toDownloadGeneModel: undefined,
    toDownloadJunc: undefined
  });
  const [localExonPlotState, setLocalExonPlotState] = React.useState({
      exons: null,
      transcripts: null,
      junctions: null,
      in_data: null,
      scaled: false,
      targetdiv: "supp1",
      downscale: 1
  });

  var okmapTableStartingData = [createData('-none selected-', '-none selected-')];

  var uifielddict = {
    dict: props.QueryExport["ui_field_dict"] || {}
  }

  const [localSelectionState, setLocalSelectionState] = React.useState({selection: null});
  const [localFilterState, setLocalFilterState] = React.useState({
    filters: null,
    filterName: initialFilterName,
    filterset: null,
  });
  const [localPlotUIDstate, setLocalPlotUIDstate] = React.useState({fulldat: null});
  const [localOkmapTable, setLocalOkmapTable] = React.useState({curAnnots: okmapTableStartingData});
  //console.log("okmaptable", okmapTable);
  const [localGtexState, setLocalGtexState] = React.useState({gtexPlot: null});
  const [resizeState, setResizeState] = React.useState({heatmapBox: null, sidePanel: null});
  //const [uifielddict, setUifielddict] = React.useState({dict: props.QueryExport["ui_field_dict"]});
  
  function setUifielddict(){
    console.log("AC1423");
  }


  /*React.useEffect(() => {
    if (props.QueryExport["ui_field_dict"] !== uifielddict.dict) {
      setUifielddict({dict: props.QueryExport["ui_field_dict"]});
    }
  }, [props.QueryExport["ui_field_dict"]]);*/

  const [localOkmapLabelState, setLocalOkmapLabelState] = React.useState("NULL");

  const viewState = props.viewState ?? localViewState;
  const setViewState = props.setViewState ?? setLocalViewState;
  const exonPlotState = props.exonPlotState ?? localExonPlotState;
  const setExonPlotState = props.setExonPlotState ?? setLocalExonPlotState;
  const selectionState = props.selectionState ?? localSelectionState;
  const setSelectionState = props.setSelectionState ?? setLocalSelectionState;
  const filterState = props.filterState ?? localFilterState;
  const setFilterState = props.setFilterState ?? setLocalFilterState;
  const plotUIDstate = props.plotUIDstate ?? localPlotUIDstate;
  const setPlotUIDstate = props.setPlotUIDstate ?? setLocalPlotUIDstate;
  const okmapTable = props.okmapTable ?? localOkmapTable;
  const setOkmapTable = props.setOkmapTable ?? setLocalOkmapTable;
  const gtexState = props.gtexState ?? localGtexState;
  const setGtexState = props.setGtexState ?? setLocalGtexState;
  const okmapLabelState = props.okmapLabelState ?? localOkmapLabelState;
  const setOkmapLabelState = props.setOkmapLabelState ?? setLocalOkmapLabelState;
  console.log("Tell me the filters", filterState);

  //console.log("okmapLabelState", okmapLabelState);

  //global_uifielddict = props.QueryExport["ui_field_dict"];

  const resizeHandles = ['s','w','e','n','sw','nw','se','ne'];

  //Refactor after this
  var Selection = selectionState.selection;
  //console.log("selectionpants", Selection);
  var set = null;
  var plotobj1, plotobj2, plotobj3 = null;
  var elm1 = filterState.filters;
  var elm2 = filterState.filterset;
  if(Selection != null && filterState.filterset != null && plotUIDstate.fulldat != null)
  {
    var plotobj1 = oncospliceClusterViolinPlotPanel(Selection, plotUIDstate.fulldat, props.Cols, props.OncospliceClusters, props.TRANS, global_cancer);
    var plotobj2 = hierarchicalClusterViolinPlotPanel(plotUIDstate.fulldat, Selection, props.Cols, props.CC, global_cancer);
    var plotobj3 = sampleFilterViolinPlotPanel(Selection, plotUIDstate.fulldat, props.Cols, elm1, elm2, global_cancer);
  }
  else
  {
    var plotobj1, plotobj2, plotobj3 = <h4>No selection set</h4>;
  }

  if(Selection != null && gtexState.gtexPlot != null)
  {
    var plotobj4 = gtexState.gtexPlot;
  }
  else
  {
    var plotobj4 = plotUIDstate.fulldat == null ? <h4>No selection set</h4> : <h4>No GTEX available for given UID</h4>;
  }

  var panel_A = {
    width: 0.680 * available_width,
    height: 0.6 * available_height,
    minWidth: 0.680 * available_width,
    minHeight: 0.3 * available_height,
    maxWidth:  0.809 * available_width,
    maxHeight: 0.8 * available_height
  }
  var panel_B = {
    width: 0.286 * available_width,
    height: 0.6 * available_height,
    minWidth: 0.148 * available_width,
    minHeight: 0.3 * available_height,
    maxWidth: 0.809 * available_width,
    maxHeight: 0.8 * available_height
  }
  var panel_C = {
    width: 0.98 * available_width,
    height: 0.7 * available_height,
    minWidth: 0.98 * available_width,
    minHeight: 0.7 * available_height,
    maxWidth: 0.98 * available_width,
    maxHeight: 0.7 * available_height
  }

  return (
    <>
    <div style={{ fontFamily: 'Arial', display: 'flex', flexWrap: 'wrap' }}>
      <ResizableBox
        className="box"
        width={panel_A.width}
        height={panel_A.height}
        margin={10}
        minConstraints={[panel_A.minWidth, panel_A.minHeight]}
        maxConstraints={[panel_A.maxWidth, panel_A.maxHeight]}
      >
        <ViewPanel_Main
          Data={props.Data}
          Cols={props.Cols}
          CC={props.CC}
          OncospliceClusters={props.OncospliceClusters}
          QueryExport={props.QueryExport}
          viewState={viewState}
          setViewState={setViewState}
          gtexState={gtexState}
          setGtexState={setGtexState}
          exonPlotState={exonPlotState}
          setExonPlotState={setExonPlotState}
          selectionState={selectionState}
          setSelectionState={setSelectionState}
          filterState={filterState}
          setFilterState={setFilterState}
          plotUIDstate={plotUIDstate}
          setPlotUIDstate={setPlotUIDstate}
          okmapTable={okmapTable}
          setOkmapTable={setOkmapTable}
          uifielddict={uifielddict}
          setUifielddict={setUifielddict}
          okmapLabelState={okmapLabelState}
          setOkmapLabelState={setOkmapLabelState}
          />
      </ResizableBox>

      <ResizableBox
        className="box"
        width={panel_B.width}
        height={panel_B.height}
        margin={10}
        minConstraints={[panel_B.minWidth, panel_B.minHeight]}
        maxConstraints={[panel_B.maxWidth, panel_B.maxHeight]}
      >
        <div style={{overflow: "scroll", height: "100%", width: "100%", display: "inline-block"}}>
        <PlotPanel plotLabel={"OncoClusters"} inputType={"oncosplice"}>{plotobj1}</PlotPanel>
        <PlotPanel plotLabel={"HierarchyClusters"} inputType={"hierarchical"}>{plotobj2}</PlotPanel>
        <PlotPanel plotLabel={"Filters"} inputType={"samplefilter"}>{plotobj3}</PlotPanel>
        <PlotPanel plotLabel={"GTEX"} inputType={"gtex"}>{plotobj4}</PlotPanel>
        <Stats okmapTable={okmapTable}></Stats>
        <SetExonPlot exonPlotState={exonPlotState} setExonPlotState={setExonPlotState}></SetExonPlot>
        </div>
      </ResizableBox>
    </div><div>
        <ResizableBox
          className="box"
          width={panel_C.width}
          height={panel_C.height}
          margin={10}
          minConstraints={[panel_C.minWidth, panel_C.minHeight]}
          maxConstraints={[panel_C.maxWidth, panel_C.maxHeight]}
        >
          <div style={{overflow: "scroll", height: "100%", width: "100%"}}>
          <Grid container spacing={1}>
            <Grid item xs={2}><SpcInputLabel label={"ExonPlot"} /></Grid>
            <Grid item><ScalingCheckbox exonPlotState={exonPlotState} setExonPlotState={setExonPlotState} /></Grid>
            <Grid item><Button variant="contained" style={{ backgroundColor: '#0F6A8B', color: "white" }} onClick={() => downloadExonPlotData("transcript.csv", viewState.toDownloadExon)}>Download Transcript</Button></Grid>
            <Grid item><Button variant="contained" style={{ backgroundColor: '#0F6A8B', color: "white" }} onClick={() => downloadExonPlotData("genemodel.csv", viewState.toDownloadGeneModel)}>Download Gene Model</Button></Grid>
            <Grid item><Button variant="contained" style={{ backgroundColor: '#0F6A8B', color: "white" }} onClick={() => downloadExonPlotData("junctions.csv", viewState.toDownloadJunc)}>Download Junctions</Button></Grid>
            <Grid item><Button variant="contained" style={{ backgroundColor: '#0F6A8B', color: "white" }} onClick={() => downloadPdfFunction(selectionState.selection)}>Download PDF</Button></Grid>
          </Grid>
          <Box borderColor="#dbdbdb" {...spboxProps}>
            <div style={{ marginLeft: 20, marginTop: 10, marginBottom: 10 }} id="supp1"></div>
          </Box>
          </div>
        </ResizableBox>
      </div>
    </>
  );
}

function ViewPanel_Side(props) {
  return(
    <div>
    <h3 style={{ fontFamily: 'Arial', color:'#0F6A8B'}}>
      {"Cancer: ".concat(props.QueryExport["cancer"])}
    </h3>
    </div>
  )
}

//Test comment
function ViewPanel_Main(props) {
    
    var elements = document.querySelectorAll(".HEATMAP_0_svg_class");
    //console.log("elements", elements.length);

    var i = 0;
    if(elements.length == 2)
    {
      elements[1].remove();
    }

    var row_label_elements = document.querySelectorAll(".HEATMAP_ROW_LABEL_svg_class");
    //console.log("row_label_elements", row_label_elements.length);

    var i = 0;
    if(row_label_elements.length == 2)
    {
      row_label_elements[1].remove();
    }    
    /*elements.forEach(function(element) {
        console.log("element pants", element);
        element.remove();// Perform operations on each element
    });*/
    const classes = useStyles();
    const [isShown, setIsShown] = React.useState(false);
    return(
    <div id="ViewPane_MainPane" style={{overflow: "scroll", height: "100%", width: "100%", display: "flex"}}>
        <div className="containerSidebar" onMouseEnter={() => setIsShown(true)} onMouseLeave={() => setIsShown(false)}>
          {isShown && (
          <div className="sidebar" style={{marginLeft: 5}}>
            <div><Button variant="contained" style={{marginTop: "5px", backgroundColor: '#0F6A8B'}}><ZoomInIcon onClick={zoomInHeatmap} style={{backgroundColor: '#0F6A8B', color: 'white', fontSize: 26}}/></Button></div>
            <div><Button variant="contained" style={{marginTop: "5px", backgroundColor: '#0F6A8B'}}><ZoomOutIcon onClick={zoomOutHeatmap} style={{backgroundColor: '#0F6A8B', color: 'white', fontSize: 26}}/></Button></div>
            <div><Button variant="contained" style={{marginTop: "5px", backgroundColor: '#0F6A8B'}}><FullscreenIcon onClick={fullViewHeatmap} style={{backgroundColor: '#0F6A8B', color: 'white', fontSize: 26}}/></Button></div>
            <div><Button variant="contained" style={{marginTop: "5px", marginBottom: "5px", backgroundColor: '#0F6A8B'}}><GetAppIcon onClick={() => downloadHeatmapText(props.Data,props.Cols,props.QueryExport,props.CC,props.OncospliceClusters)} style={{backgroundColor: '#0F6A8B', color: 'white', fontSize: 26}}/></Button></div>
            <div><Typography className={classes.smallpadding} /></div>
            <div><FilterHeatmapSelect uifielddict={props.uifielddict} filterState={props.filterState} setFilterState={props.setFilterState} setOkmapLabelState={props.setOkmapLabelState}/></div>
          </div>
          )}
        </div>
        <div style={{ flex: 1, position: "relative" }}>
        <Typography className={classes.padding} />
        <div id="heatmap-section" style={{ position: "relative", marginLeft: 5 }}>
        <div id="HEATMAP_LABEL"></div>
        <div id="HEATMAP_CC"></div>
        <div id="HEATMAP_OncospliceClusters"></div>
        <div className={classes.flexparent}>
        <div style={{ position: "relative", display: "inline-block" }}>
        <span id="HEATMAP_0" ></span>
        </div>
        <span id="HEATMAP_ROW_LABEL" style={{width: "280px"}}></span>
        </div>
        <HeatmapLoadingScreen
          sectionId="heatmap-section"
          cols={props.Cols}
          cc={props.CC}
          oncospliceClusters={props.OncospliceClusters}
          labelState={props.okmapLabelState}
          rowData={props.Data}
          xscale={computeHeatmapXscale(props.Cols.length)}
          clusterName={global_trans}
        />
        </div>
      <Heatmap
        data={props.Data}
        cols={props.Cols}
        cc={props.CC}
        QueryExport={props.QueryExport}
        OncospliceClusters={props.OncospliceClusters}
        viewState={props.viewState}
        setViewState={props.setViewState}
        gtexState={props.gtexState}
        setGtexState={props.setGtexState}
        exonPlotState={props.exonPlotState}
        setExonPlotState={props.setExonPlotState}
        selectionState={props.selectionState}
        setSelectionState={props.setSelectionState}
        filterState={props.filterState}
        setFilterState={props.setFilterState}
        plotUIDstate={props.plotUIDstate}
        setPlotUIDstate={props.setPlotUIDstate}
        okmapTable={props.okmapTable}
        setOkmapTable={props.setOkmapTable}
        uifielddict={props.uifielddict}
        setUifielddict={props.setUifielddict}
        okmapLabelState={props.okmapLabelState}
        setOkmapLabelState={props.setOkmapLabelState}>
      </Heatmap>
      </div>
    </div>
    );
}

export default ViewPanel;