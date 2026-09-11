import * as d3 from 'd3';
import axios from 'axios';
import { apiBaseUrl } from '../utilities/constants.js';
import React, { useRef } from "react";
import targeturl from '../targeturl.js';
var routeurl = apiBaseUrl;

function retrieveDataForVenn(comparedSignature, homeSignature, typeFor, setTableState, annot){
  //homeSignature = homeSignature.name;
  //console.log("VENN CLICK", comparedSignature, homeSignature);
  var homeName = homeSignature.name;
  var homeCancer = (homeName.substring(4)).split("_")[0];
  homeCancer = (homeCancer.toUpperCase());

  var cancerList = ["BLCA", "BRCA", "CESC", "COAD", "ESCA", "GBM", "GTEX", "HNSC", "KICH", "KIRC", "LGG", "LIHC", "LUAD", "OV", "PAAD", "PCPG", "PRAD", "READ", "SARC", "SKCM", "STAD", "TGCT", "THCA", "UCEC", "blca", "brca", "cesc", "coad", "esca", "gbm", "gtex", "hnsc", "kich", "kirc", "lgg", "lihc", "luad", "ov", "paad", "pcpg", "prad", "read", "sarc", "skcm", "stad", "tgct", "thca", "ucec"];
  
  // Check if homeCancer is in cancerList, if not set to "GTEXPSI"
  if (!cancerList.includes(homeCancer)) {
    homeCancer = "GTEX";
  }

  console.log("comparedSignature", comparedSignature);
  
  var postedData = {"data": {"comparedSignature": comparedSignature, "cancer": homeCancer, "homeSignature": homeSignature.name, "type": typeFor, "annot": annot}}
  //console.log(parentProps, comparedSignature, homeSignature);
  document.getElementById("tableLoadingDiv").style.display = "block";
  document.getElementById("rootTable").style.opacity = 0.2;

  axios({
    method: "post",
    url: routeurl.concat("/api/datasets/venn"),
    data: postedData,
    headers: { "Content-Type": "application/json" },
  })
    .then(function (response) {
      //console.log(response);
      var sigToUse = homeSignature.name;
      document.getElementById("tableLoadingDiv").style.display = "none";
      document.getElementById("rootTable").style.opacity = 1;
      if(typeFor == "compared")
      {
        sigToUse = comparedSignature;
      }
      else if(typeFor == "intersection")
      {
        sigToUse = homeSignature.name.concat(" INTERSECT ").concat(comparedSignature);
      }
      setTableState({
        type: "splice",
        data: response["data"]["output"],
        sortedColumn: "UID",
        signature: sigToUse,
        annotation: annot,
        page: 0,
        pageSize: 10
      });
  })
}

class SetVennDiagram extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        input: null,
      };
    }

    componentDidMount() {
      this.setState({
        input: <CreateVennDiagram sizeObj={this.props.sizeObj} vennState={this.props.vennState} setTableState={this.props.setTableState}></CreateVennDiagram>
      })
    }

    componentDidUpdate(prevProps) {
      if(this.props !== prevProps)
      {
        this.setState({
          input: <CreateVennDiagram sizeObj={this.props.sizeObj} vennState={this.props.vennState} setTableState={this.props.setTableState}></CreateVennDiagram>
        })
      }
    }

    render()
    {
      return(
        <div>
        {this.state.input}
        </div>
      );
    }
}

function deselectAll() {
  var pretg1 = d3.select("#circle1").attr("selected", "false").attr("fill", "#ffe0cc");
  var pretg2 = d3.select("#circle2").attr("selected", "false").attr("fill", "#b34700");
  var pretg3 = d3.select("#circle3").attr("selected", "false").attr("fill", "#ffe0cc");
}

function CreateVennDiagram(props) {
    const r1 = 70;
    const r2 = 70;
    const width = props.sizeObj.width; // 267 280
    const height = props.sizeObj.height; // 300 259
    const w_scale = width / 280;
    const h_scale = height / 259;
    const font_scale = (w_scale + h_scale) / 2.0;
    //console.log("venn height and width", width, height);

    const [vennState, setVennState] = React.useState({data: props.vennState});
    const [idState, setIdState] = React.useState({id1: "false", id2: "false", id3: "false"});

    const previousProps = useRef();

    //console.log("vennstate1", props.vennState);
    React.useEffect(() => {
      if(props.vennState != vennState.data)
      {
        setVennState(props.vennState);
      }
     //console.log("vennstate2", props.vennState);
    }, [props]);

    React.useEffect(() => {
      if(props.vennState != undefined)
      {
        if(props.vennState.data != undefined)
        {
          if(previousProps.current.vennState != undefined)
          {
            if(previousProps.current.vennState.data != undefined)
            {
              if(previousProps.current.vennState.data.comparedOriginal != props.vennState.data.comparedOriginal)
              {
                setIdState({id1: "false", id2: "false", id3: "false"});
              }
            }
          }
        }
      }
      //var tempnode = document.getElementById("overlapDiv");
      //while (tempnode.firstChild) {
          //tempnode.removeChild(tempnode.firstChild);
      //}
      previousProps.current = props;
    }, [props]);

    // Set the dimensions and margins of the diagram
    var tempnode = document.getElementById("overlapDiv");
    while (tempnode.firstChild) {
        tempnode.removeChild(tempnode.firstChild);
    }

    if(props.vennState.data != null)
    {
    // Create the SVG container
    const svg = d3.select('#overlapDiv')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    svg.append("text")
      .attr("x", 133*w_scale)
      .attr("y", 25*h_scale)
      .attr("text-anchor", "middle")
      .style("font-size", 18.5*font_scale)
      .style("opacity", 1.0)
      .attr("fill", "black")
      .text("Overlapping Events");

    var textouse1 = props.vennState.data.annot;
    var textouse2 = props.vennState.data.homeSignature;
    var textouse3 = props.vennState.data.comparedSignature;
    textouse1 = textouse1.replace("---", "-");
    textouse2 = textouse2.replace("---", "-");
    textouse3 = textouse3.replace("---", "-");

    textouse1 = textouse1.replace("-VS-OTHERS", "");
    textouse2 = textouse2.replace("-VS-OTHERS", "");
    textouse3 = textouse3.replace("-VS-OTHERS", "");

    if (textouse1.length > 15) {
      textouse1 = textouse1.slice(0, 15).concat("...");
    }
    
    if (textouse2.length > 15) {
      textouse2 = textouse2.slice(0, 15).concat("...");
    }
    
    if (textouse3.length > 15) {
      textouse3 = textouse3.slice(0, 15).concat("...");
    }

    // Create the circle
    const circle1 = svg.append('circle')
        .attr('cx', 85*w_scale)
        .attr('cy', 145*h_scale)
        .attr('r', r1*font_scale)
        .attr('fill', "blue")
        .attr('opacity', 0.5);

    // Create the circle
    const circle2 = svg.append('circle')
        .attr('cx', 172*w_scale)
        .attr('cy', 145*h_scale)
        .attr('r', r2*font_scale)
        .attr('fill', "#d3ce3c")
        .attr('opacity', 0.5);

    svg.append("text")
        .attr("x", 133*w_scale)
        .attr("y", 25*h_scale)
        .attr("text-anchor", "middle")
        .style("font-size", 18.5*font_scale)
        .style("opacity", 1.0)
        .attr("fill", "black")
        .text("Overlapping Events");

    svg.append("text")
        .attr("x", 133*w_scale)
        .attr("y", 44*h_scale)
        .attr("text-anchor", "middle")
        .style("font-size", 12*font_scale)
        .style("opacity", 1.0)
        .attr("fill", "black")
        .text("Annotation: ".concat(textouse1));

    svg.append("text")
      .attr("x", 75*w_scale)
      .attr("y", 63*h_scale)
      .attr("text-anchor", "middle")
      .style("font-size", 12*font_scale)
      .style("opacity", 0.5)
      .attr("fill", "blue")
      .attr("font-weight", 700)
      .text(textouse2);

    svg.append("text")
      .attr("x", 182*w_scale)
      .attr("y", 63*h_scale)
      .attr("text-anchor", "middle")
      .style("font-size", 12*font_scale)
      .style("opacity", 0.9)
      .attr("fill", "#B8B965")
      .text(textouse3)
      .attr("font-weight", 700)
      .on("click", function() {
        var pretg = d3.select(this);
    });

    var vsdhc = props.vennState.data.homeCount - props.vennState.data.commonCount;
    var vsdcomparedc = props.vennState.data.comparedCount - props.vennState.data.commonCount;
    var vsdcommonc = props.vennState.data.commonCount;
    svg.append("text")
      .attr("x", 70*w_scale)
      .attr("y", 145*h_scale)
      .attr("text-anchor", "middle")
      .style("font-size", idState.id1 == "true" ? 16*font_scale : 14*font_scale)
      .attr("id", "circle1")
      .attr("selected", idState.id1)
      .style("opacity", 1)
      .style("text-decoration", "underline")
      .attr("fill", idState.id1 == "true" ? "orange" : "#ffe0cc")
      .attr("font-weight", 700)
      .text(vsdhc)
      .on("click", function() {
          var pretg = d3.select(this);
          setIdState({id1: "true", id2: "false", id3: "false"});
          pretg.attr("fill", "orange");
          retrieveDataForVenn(props.vennState.data.comparedOriginal, props.vennState.data.homeOriginal, "home", props.setTableState, props.vennState.data.annot)
      })
      .on("mouseover", function() {
        //console.log(cur_obj);
        var pretg = d3.select(this)
        if(pretg.attr("selected") == "false")
        {
          pretg.attr("fill", "orange");
          pretg.attr("cursor", "pointer");
        }

      })
      .on("mouseleave", function() {
        //console.log(cur_obj);
        var pretg = d3.select(this);
        if(pretg.attr("selected") == "false")
        {
          pretg.attr("fill", "#ffe0cc");
          pretg.attr("cursor", "default");
        }
      });

    svg.append("text")
      .attr("x", 187*w_scale)
      .attr("y", 145*h_scale)
      .attr("text-anchor", "middle")
      .style("font-size", idState.id2 == "true" ? 16*font_scale : 14*font_scale)
      .attr("id", "circle2")
      .attr("selected", idState.id2)
      .style("opacity", 1)
      .style("text-decoration", "underline")
      .attr("fill", idState.id2 == "true" ? "orange" : "#b34700")
      .text(vsdcomparedc)
      .attr("font-weight", 700)
      .on("click", function() {
        var pretg = d3.select(this);
        setIdState({id1: "false", id2: "true", id3: "false"});
        pretg.attr("fill", "orange");
        retrieveDataForVenn(props.vennState.data.comparedOriginal, props.vennState.data.homeOriginal, "compared", props.setTableState, props.vennState.data.annot);
      })
      .on("mouseover", function() {
        //console.log(cur_obj);
        var pretg2 = d3.select(this);
        if(pretg2.attr("selected") == "false")
        {
          var pretg = d3.select(this).attr("fill", "orange");
          pretg.attr("cursor", "pointer");
        }
      })
      .on("mouseleave", function() {
        //console.log(cur_obj);
        var pretg2 = d3.select(this);
        if(pretg2.attr("selected") == "false")
        {
          var pretg = d3.select(this).attr("fill", "#b34700");
          pretg.attr("cursor", "default")
        }
      });

    svg.append("text")
      .attr("x", ((187+70)/ 2)*w_scale)
      .attr("y", 145*h_scale)
      .attr("text-anchor", "middle")
      .style("font-size", idState.id3 == "true" ? 16*font_scale : 14*font_scale)
      .attr("id", "circle3")
      .attr("selected", idState.id3)
      .style("opacity", 1)
      .style("text-decoration", "underline")
      .attr("fill", idState.id3 == "true" ? "orange" : "#ffe0cc")
      .text(vsdcommonc)
      .attr("font-weight", 700)
      .on("click", function() {
        var pretg = d3.select(this);
        setIdState({id1: "false", id2: "false", id3: "true"});
        pretg.attr("fill", "orange");
        retrieveDataForVenn(props.vennState.data.comparedOriginal, props.vennState.data.homeOriginal, "intersection", props.setTableState, props.vennState.data.annot)
      })
      .on("mouseover", function() {
        //console.log(cur_obj);
        var pretg = d3.select(this);
        if(pretg.attr("selected") == "false")
        {
          var pretg = d3.select(this).attr("fill", "orange");
          pretg.attr("cursor", "pointer");
        }
      })
      .on("mouseleave", function() {
        //console.log(cur_obj);
        var pretg = d3.select(this);
        if(pretg.attr("selected") == "false")
        {
          var pretg = d3.select(this).attr("fill", "#ffe0cc");
          pretg.attr("cursor", "default");
        }
      });

    var overlap_percentage_total = parseInt(props.vennState.data.commonCount) / ((parseInt(props.vennState.data.homeCount) + parseInt(props.vennState.data.comparedCount)) / 2);
    //console.log("overlap percentage total", overlap_percentage_total, props.vennState.data.commonCount, props.vennState.data.homeCount, props.vennState.data.comparedCount);

    if(props.vennState.data.homeCount > props.vennState.data.comparedCount * 1.5)
    {
      circle1.style("opacity", 0.5);
      circle2.style("opacity", 0.5);
    }
    if(props.vennState.data.homeCount > props.vennState.data.comparedCount * 2.4)
    {
      circle1.style("opacity", 0.55);
      circle2.style("opacity", 0.45);
    }
    if(props.vennState.data.homeCount > props.vennState.data.comparedCount * 3.3)
    {
      circle1.style("opacity", 0.6);
      circle2.style("opacity", 0.4);
    }
    if(props.vennState.data.homeCount > props.vennState.data.comparedCount * 4.4)
    {
      circle1.style("opacity", 0.65);
      circle2.style("opacity", 0.35);
    }
    if(props.vennState.data.homeCount * 1.5 < props.vennState.data.comparedCount)
    {
      circle2.style("opacity", 0.6);
      circle1.style("opacity", 0.4);
    }
    if(props.vennState.data.homeCount * 2.4 < props.vennState.data.comparedCount)
    {
      circle2.style("opacity", 0.65);
      circle1.style("opacity", 0.35);
    }
    if(props.vennState.data.homeCount * 3.3 < props.vennState.data.comparedCount)
    {
      circle2.style("opacity", 0.7);
      circle1.style("opacity", 0.3);
    }
    if(props.vennState.data.homeCount * 4.4 < props.vennState.data.comparedCount)
    {
      circle2.style("opacity", 0.75);
      circle1.style("opacity", 0.25);
    }

    if(overlap_percentage_total > 0.3)
    {
      circle1.attr('cx', 95*w_scale);
      circle2.attr('cx', 162*w_scale);
    }
    else if(overlap_percentage_total > 0.2)
    {
      circle1.attr('cx', 90*w_scale);
      circle2.attr('cx', 167*w_scale);
    }
    else if(overlap_percentage_total > 0.1)
    {
      circle1.attr('cx', 85*w_scale);
      circle2.attr('cx', 172*w_scale);
    }
    else
    {
      circle1.attr('cx', 80*w_scale);
      circle2.attr('cx', 177*w_scale);
    }

    }
    else
    {
        const newDiv = document.createElement("h5");

        // and give it some content
        const newContent = document.createTextNode("Select a signature from the list above.");

        // add the text node to the newly created div
        newDiv.appendChild(newContent);
        document.getElementById("overlapDiv").appendChild(newDiv);
    }
    return(
      null
    );
}

// Call the function with the body selector and data
export default SetVennDiagram;
