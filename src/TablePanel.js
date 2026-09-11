import '@fontsource/roboto';
import React from 'react';
import MajorTable from './components/MajorTable.js';
import MinorTable from './components/MinorTable.js';
import {apiBaseUrl, appBaseUrl, rootTableColumnSpliceObj, rootTableColumnGeneObj, BLCA_vals, tableStyledDiv, rootTableTableObj, cancerValueToName} from './utilities/constants.js';
import axios from 'axios';
//import { isBuild } from './utilities/constants.js';

var routeurl = apiBaseUrl;
var localAddress = appBaseUrl;

function stringSplit(uid)
{
    uid = uid.split(":");
    var uid_secondcomp = uid[2];
    uid_secondcomp = uid_secondcomp.split("|");
    //var uid_final = uid[0].concat(":").concat(uid_secondcomp[0]).concat("|").concat(uid[3]);
    var uid_final = uid[0].concat(":").concat(uid_secondcomp[0]);
    return uid_final;
}

function setUpLinkForGenes(cancer, gene){
    cancer = cancer.toUpperCase();
    var url = localAddress.concat("/explore/").concat(cancer.toUpperCase()).concat("/None/None").concat("/").concat(gene).concat("/").concat("None");
    const hyperlinkObject = <a href={url} target="_blank">Go</a>;
    return hyperlinkObject;
}

function setUpLinkForCoordinates(cancer, coord){
    cancer = cancer.toUpperCase();
    var [coord1, coord2] = coord.split("|");
    var coord1 = coord1.replace(":", "-");
    var url = localAddress.concat("/explore/").concat(cancer.toUpperCase()).concat("/None/None/None/").concat(coord1);
    const hyperlinkObject = <a href={url} target="_blank">Go</a>;
    //console.log("coord1", coord1);
    return hyperlinkObject;
}

function setUpLinkForUID(input){
    //chr19:48249751-48241063|chr19:48249523-48241063
    var [chr1, chr2] = input.split("|");
    var [flatchr1, twor1_split] = chr1.split(":");
    var [c1, c2] = twor1_split.split("-");
    var link1 = "http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg38&lastVirtModeType=default&lastVirtModeExtraState=&virtModeType=default&virtMode=0&nonVirtPosition=&position=";
    const hyperlinkUidObject = <a href={link1.concat(flatchr1).concat("%3A").concat(c1).concat("%2D").concat(c2).concat("&hgsid=765996783_dwaxAIrKY42kyCWOzQ3yL51ATzgG")} target="_blank">Go</a>;
    return hyperlinkUidObject;
}

function setUpSignature(input, cancer){
    var splitString = input.split("_");
    if(cancer != "gtex")
    {
        var signatureName = splitString[1].concat("-").concat(splitString[2]);
    }
    else
    {
        var signatureName = splitString[1];
    }
    return signatureName;
}

function formatScientificNotation(value) {
    if (typeof value === 'string' && value.includes('e')) {
        const [base, exponent] = value.split('e');
        const formattedBase = parseFloat(base).toFixed(2);
        return `${formattedBase}e${exponent}`;
    }
    else{
        const formattedBase = parseFloat(value).toFixed(4);
        return formattedBase;
    }
}

function tablePlotRequest(cancerName, currentGene, currentCoord, currentAnnotation, type, pseudoPage, setTableState, newPageSize){
    var type="initial";
    var cancerName = cancerName;
    var postedData = {"data": {"cancerName": cancerName, "currentGene": currentGene, "currentCoord": currentCoord, "currentAnnotation": currentAnnotation, "type": type, "pseudoPage": pseudoPage, "newPageSize": newPageSize}}
    axios({
      method: "post",
      url: routeurl.concat("/api/datasets/updateminortable"),
      data: postedData,
      headers: { "Content-Type": "application/json" },
        })
        .then(function (response) {
        var resp = response["data"];
        //document.getElementById("tableLoadingDiv").style.display = "none";
        //document.getElementById("rootTable").style.opacity = 1;
        console.log("OUTPUTTT", type, resp);
        var dataTemp = [];
        for(let i = 0; i < resp.outputdata.length; i++)
        {
            let curpointer = resp.outputdata[i];
            //console.log(curpointer)
            var urlForGene = setUpLinkForGenes(curpointer["cancer"], curpointer["gene"]);
            var urlForUID = setUpLinkForUID(curpointer["coordinates"]);
            var urlForCoordinates = setUpLinkForCoordinates(curpointer["cancer"], curpointer["coordinates"]);
            var signatureFixed = setUpSignature(curpointer["signature_name"], curpointer["cancer"]);
            var coordinateFixed = curpointer["coordinates"].split("|");
            if(curpointer["cancer"] != "gtex")
            {
                var signatureSetUp = "None";
                var datagroup = "";
                if(resp.clusterAnnotationDictionary[curpointer["cancer"]][curpointer["signature_name"]] == undefined)
                {
                    signatureSetUp = "";
                    datagroup = "";
                }
                else
                {
                    signatureSetUp = resp.clusterAnnotationDictionary[curpointer["cancer"]][curpointer["signature_name"]]["annotation"];
                    datagroup = resp.clusterAnnotationDictionary[curpointer["cancer"]][curpointer["signature_name"]]["datagroup"];
                    if(resp.clusterAnnotationDictionary[curpointer["cancer"]][curpointer["signature_name"]]["annotation"] == "NA")
                    {
                            signatureSetUp = "";
                    }
                }
            }
            else
            {
                var signatureSetUp = signatureFixed;
                var datagroup = "GTEX";
            }
            //var urlForCoordinates = setUpLinkForCoordinates();
            var newUid = stringSplit(curpointer["uid"]);
            var rawp = curpointer["rawp"];
            var goob = curpointer["dpsi"].toString();
            console.log(typeof goob);
            console.log(curpointer["dpsi"]);
            console.log("curpointer-dpsi", curpointer["dpsi"], goob.slice(0, 6));
            let curdat = {
                uid: newUid,
                //gene: curpointer["gene"],
                cancer: cancerValueToName[curpointer["cancer"]],
                //signature: signatureFixed,
                eventannotation: curpointer["eventannotation"],
                datagroup: datagroup,
                signature_name: signatureSetUp,
                dpsi: goob.slice(0, 6),
                rawp: formatScientificNotation(curpointer["rawp"]),
                adjp: formatScientificNotation(curpointer["adjp"]),
                lrtp: formatScientificNotation(curpointer["lrtp"]),
                zscore: curpointer["zscore"].slice(0, 7),
                browser: urlForCoordinates,
                allEvents: urlForGene,
                ucsc: urlForUID
            }
            dataTemp.push(curdat);
        }
        console.log("dataTemp", dataTemp);
        document.getElementById("minorTableLoadingDiv").style.display = "none";
        setTableState({
            type: type,
            data: dataTemp,
            page: 0,
            currentGene: currentGene,
            pseudoPage: pseudoPage,
            pageSize: newPageSize,
            totalEntries: resp.totalentries
        });
    })
}

function TablePanel(props) {
    var column_splice_obj = rootTableTableObj;
    //console.log("TABLEMAN PROPS", props);
    const [tableState, setTableState] = React.useState({
        type: "initial",
        data: undefined,
        page: 0,
        currentGane: props.postedGene,
        pseudoPage: 0,
        pageSize: 30,
        totalEntries: 0
    });
    const [loading, setLoading] = React.useState(true); // Track loading state
    //const [data, setData] = React.useState([]); // To store processed data from props or elsewhere
    //gtexpsi_fullsig
    var tableHeaderName = "";
    if(props.postedCancer == "None"){
        tableHeaderName = tableHeaderName.concat("All Cancers");
    }
    else {
        tableHeaderName = tableHeaderName.concat(cancerValueToName[props.postedCancer.toLowerCase()]);
    }
    
    React.useEffect(() => {
        if(tableState.data == undefined)
        {
            tablePlotRequest(props.postedCancer, props.postedGene, props.postedCoord, props.postedAnnotation, "initial", 0, setTableState, 30);
        }
    }, [])
    var columns = rootTableTableObj;
    var columns_splc = React.useMemo(
        () => [
          {
            Header: tableHeaderName,
            columns: columns
          },
        ],
        [props]
      )

    return(
        <MinorTable tableState={tableState} setTableState={setTableState} columns={columns_splc} tablePlotRequest={tablePlotRequest}/>
    );
}

export default TablePanel;