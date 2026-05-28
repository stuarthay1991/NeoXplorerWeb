import React from 'react';
import ReactDOM from 'react-dom';
import ViewPanel from './ViewPanel.js';
import useStyles from './css/useStyles.js';
import { makeStyles, withStyles } from '@material-ui/core/styles';

//This is a hacky way to transition into the view pane; it is currently vital and in use, but will need to be changed in the future.
//There should be a more simple and streamlined way to do this; but basically the point of this is that I need to wait for the request
//to the server to finish before the Data Exploration tab is loaded, otherwise React will load asynchrously. That's what this object
//currently accomplishes.
class ViewPanelWrapper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      heatmapInputData: [],
      inCols: [],
      inCC: [],
      inOncospliceClusters: [],
      inTRANS: [],
      export: []
    }
  }

  componentDidMount() {   
    if(this.props.entrydata != undefined)
    {
        this.setState({
        heatmapInputData: this.props.entrydata["heatmapInputData"],
        inCols: this.props.entrydata["inCols"],
        inCC: this.props.entrydata["inCC"],
        inOncospliceClusters: this.props.entrydata["inOncospliceClusters"],
        inTRANS: this.props.entrydata["inTRANS"],
        export: this.props.entrydata["export"]
        });
    }
  }

  componentDidUpdate(prevProps) {  
    if(prevProps !== this.props)
    {
      //console.log("prevProps", prevProps);
      if(this.props.entrydata != undefined)
      {
        if(prevProps.entrydata["heatmapInputData"].length == 0)
        {
          this.setState({
            heatmapInputData: this.props.entrydata["heatmapInputData"],
            inCols: this.props.entrydata["inCols"],
            inCC: this.props.entrydata["inCC"],
            inOncospliceClusters: this.props.entrydata["inOncospliceClusters"],
            inTRANS: this.props.entrydata["inTRANS"],
            export: this.props.entrydata["export"]
          });          
        }
        else if(prevProps.entrydata["heatmapInputData"][0]["uid"] != this.props.entrydata["heatmapInputData"][0]["uid"])
        {
          this.setState({
            heatmapInputData: this.props.entrydata["heatmapInputData"],
            inCols: this.props.entrydata["inCols"],
            inCC: this.props.entrydata["inCC"],
            inOncospliceClusters: this.props.entrydata["inOncospliceClusters"],
            inTRANS: this.props.entrydata["inTRANS"],
            export: this.props.entrydata["export"]
          });
        }
      }
    }
  }

  render()
  {
    if(this.state.heatmapInputData.length > 0 && this.props.validate == 1 && this.state.heatmapInputData == undefined)
    {
      alert("Submission failed! Please try again!");
    }
    return(
      <div>
        {this.state.heatmapInputData.length > 0 && this.props.validate == 1 && this.state.heatmapInputData != undefined && (
          <ViewPanel  css={withStyles(useStyles)} 
                      QueryExport={this.state.export} 
                      Data={this.state.heatmapInputData} 
                      Cols={this.state.inCols} 
                      CC={this.state.inCC} 
                      OncospliceClusters={this.state.inOncospliceClusters} 
                      TRANS={this.state.inTRANS}
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
                      okmapLabelState={this.props.okmapLabelState}
                      setOkmapLabelState={this.props.setOkmapLabelState}
          />
        )}
      </div>
    );
  }
}

export default ViewPanelWrapper;