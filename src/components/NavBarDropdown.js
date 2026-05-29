import { Nav, Dropdown, Button, ButtonToolbar, IconButton} from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { makeRequest } from '../request/CancerDataManagement.js';
import Grid from '@material-ui/core/Grid';
import Form from 'react-bootstrap/Form'
import "./rsuitedropdown.css";
import { makeStyles, withStyles } from '@material-ui/core/styles';
import React, { useRef } from "react";
import { Typography } from "@material-ui/core";
import jsonGBM from "../gbmBasic.js";
import jsonBLCA from "../BLCAbasic.js";
import jsonBLCAsignature from "../BLCAsignature.js";
import {
  cancerDisplayNames,
  NEO_SET_CANCER_TYPE_EVENT,
  NEO_SET_CANCER_SIGNATURE_GROUP_EVENT,
  isValidCancerTypeCode,
} from "../constants/cancerTypes.js";
import { NEO_SET_GENES_EVENT } from "../constants/navBarGenes.js";
import { NEO_SET_SIGNATURE_EVENT } from "../constants/navBarSignature.js";
import { parseDelimitedInput } from "../utils/parseDelimitedInput.js";

const StyledDropdown = withStyles({
  root: {
    fontSize: "0.5em"
  }
})(Dropdown);

const StyledDropdownItem = withStyles({
  root: {
    fontSize: "0.5em"
  }
})(Dropdown.Item);

// Global loading overlay state management
window.showNavLoadingOverlay = function(show = true) {
  const overlay = document.getElementById('navLoadingOverlay');
  if (overlay) {
    overlay.style.display = show ? 'flex' : 'none';
  }
};

// Export for use throughout application
export function showNavLoading(show = true) {
  window.showNavLoadingOverlay(show);
}

const instance = (
  <ButtonToolbar>

   <Dropdown title="More..." >
       <Dropdown.Item >Edit</Dropdown.Item>
       <Dropdown.Item >View</Dropdown.Item>
       <Dropdown.Item >Delete</Dropdown.Item>
   </Dropdown>

   <Dropdown
     title="New"
     renderTitle={(children)=>{
       return <Button appearance="primary">{children} </Button>
     }}
     >
       <Dropdown.Item >New User</Dropdown.Item>
       <Dropdown.Item >New Group</Dropdown.Item>
   </Dropdown>

 </ButtonToolbar>
);

function HayDropdownParent(props){
  return(
  <Dropdown
  title={props.title}
  activeKey={props.activeKey}
  onSelect={props.onSelect}
  placement="bottomStart"
  size="xs"
  trigger="hover">
  {props.children}
  </Dropdown>
  );
}

function HayDropdown(props){
  return(
  <Dropdown.Item eventKey={props.eventKey} style={{fontSize: 12, margin: 1, padding: 1}}>
  {props.displayName}
  </Dropdown.Item>
  );
}

function Header({setViewPane, setPanCancerState, startingCancer, startingSignaureList, startingSampleList, startingSignature, startingSimple}){
    //Heatmap Data State
    //Make request on change
    const [cancerTypeState, setCancerTypeState] = React.useState({"cancerType": startingCancer, "initialized": false});
    const [sampleState, setSampleState] = React.useState();
    const [sampleListState, setSampleListState] = React.useState(startingSampleList);
    const [sampleOptions, setSampleOptions] = React.useState({"key": undefined, "options": []});

    if(startingSignature == "None")
    {
      console.log("startingSignaureList", startingSignaureList);
      startingSignature = startingSignaureList[0];
    }

    const [signatureState, setSignatureState] = React.useState({"signature": startingSignature, "simpleName": startingSimple, "oncocluster": startingSimple, "initialized": false});
    const [coordState, setCoordState] = React.useState();
    const [geneState, setGeneState] = React.useState();
    const [pageTypeState, setPageTypeState] = React.useState({"value": "Individual Signatures", "initialized": false})

    //signatureState, setSignatureState

    const [cancerSignatureGroupState, setCancerSignatureGroupState] = React.useState({"cancerType": startingCancer, "initialized": false});
    const [signatureListState, setSignatureListState] = React.useState(startingSignaureList);
    const [eventFontState, setEventFontState] = React.useState({"sigFontColor": "blue","coordFontColor": "grey","geneFontColor": "grey"})

    const cancerSelectHandle = (e) => {
        setCancerTypeState({"cancerType": e, "initialized": true});
    }

    React.useEffect(() => {
        const onChatCancerType = (event) => {
            const cancerType = event?.detail?.cancerType;
            if (isValidCancerTypeCode(cancerType)) {
                setCancerTypeState({ cancerType, initialized: true });
            }
        };
        window.addEventListener(NEO_SET_CANCER_TYPE_EVENT, onChatCancerType);
        return () => window.removeEventListener(NEO_SET_CANCER_TYPE_EVENT, onChatCancerType);
    }, []);

    React.useEffect(() => {
        const onChatCancerSignatureGroup = (event) => {
            const cancerSignatureGroup = event?.detail?.cancerSignatureGroup;
            if (isValidCancerTypeCode(cancerSignatureGroup)) {
                setCancerSignatureGroupState({
                    cancerType: cancerSignatureGroup,
                    initialized: true,
                });
            }
        };
        window.addEventListener(
            NEO_SET_CANCER_SIGNATURE_GROUP_EVENT,
            onChatCancerSignatureGroup,
        );
        return () =>
            window.removeEventListener(
                NEO_SET_CANCER_SIGNATURE_GROUP_EVENT,
                onChatCancerSignatureGroup,
            );
    }, []);

    React.useEffect(() => {
        window.neoNavBarContext = {
            cancerType: cancerTypeState.cancerType,
            cancerSignatureGroup: cancerSignatureGroupState.cancerType,
            genes: geneState,
            signature: signatureState.signature,
            signatureDisplayName: signatureState.simpleName,
            signatureList: signatureListState,
        };
    }, [
        cancerTypeState.cancerType,
        cancerSignatureGroupState.cancerType,
        geneState,
        signatureState.signature,
        signatureState.simpleName,
        signatureListState,
    ]);

    const applySignatureSelection = (key, displayName) => {
        var selectedOncocluster = displayName;
        if (selectedOncocluster != undefined) {
            if (selectedOncocluster.indexOf(" (") != -1) {
                selectedOncocluster = selectedOncocluster.split(" (")[0];
            }
        } else {
            selectedOncocluster = "R1-V2";
        }
        setSignatureState({
            signature: key,
            simpleName: displayName,
            oncocluster: selectedOncocluster,
            initialized: true,
        });
    };

    React.useEffect(() => {
        const onChatSignature = (event) => {
            const signature = event?.detail?.signature;
            const simpleName = event?.detail?.simpleName;
            if (typeof signature !== "string" || signature.trim() === "") {
                return;
            }
            const displayName =
                typeof simpleName === "string" && simpleName.trim() !== ""
                    ? simpleName
                    : signatureListState[signature] ?? signature;
            applySignatureSelection(signature, displayName);
        };
        window.addEventListener(NEO_SET_SIGNATURE_EVENT, onChatSignature);
        return () =>
            window.removeEventListener(NEO_SET_SIGNATURE_EVENT, onChatSignature);
    }, [signatureListState]);

    const cancerSignatureGroupSelectHandle = (e) => {
        setCancerSignatureGroupState({"cancerType": e, "initialized": true});
    }

    const signatureSelectHandle = (e) => {
        //console.log("signature selected: ", e);
        let simpleName = e[1];
        if (e[1] == undefined) {
            simpleName = e[0];
        }
        applySignatureSelection(e[0], simpleName);
    }

    const sampleMenuPopulate = (e) => {
      var listOfValues = sampleListState[e];
      setSampleOptions({"key": e, "options": listOfValues});
      console.log("samplemenupopulate", e, listOfValues);
      setSampleState({"key": e, "value": listOfValues[0]})
    }

    const selectSampleHandle = (e) => {
        console.log("sample selected", e);
        setSampleState({"key": e[0], "value": e[1]});
    }

    const onChangeCoord = (e) => {
        var all_coords = document.getElementById("clientinputcoord").value;
        var delimiter = "\n";
        if(all_coords.indexOf("\n") != -1 && all_coords.indexOf(",") == -1)
        {
          delimiter = "\n";
        }
        if(all_coords.indexOf("\n") == -1 && all_coords.indexOf(",") != -1)
        {
          delimiter = ",";
        }
        if(all_coords.indexOf("\n") != -1 && all_coords.indexOf(",") != -1)
        {
          if(all_coords.split(",").length > all_coords.split("\n").length)
          {
            delimiter = ",";
            all_coords = all_coords.replace("\n", "");
          }
          else
          {
            delimiter = "\n";
          }
        }

        all_coords = all_coords.split(delimiter);
        var pile_of_coords = [];

        for(var i=0; i<all_coords.length; i++)
        {
          if(all_coords[i] != "")
          {
            pile_of_coords.push(all_coords[i]);
          }
        }
        var args = {};
        if(e.key == "Enter")
        {
          setCoordState(pile_of_coords);
        }
    }

    const applyGenesFilter = (geneList) => {
        const pile_of_uids = Array.isArray(geneList) ? geneList : [];
        if (pile_of_uids.length === 0) {
            return;
        }
        const textarea = document.getElementById("clientinputgene");
        if (textarea) {
            textarea.value = pile_of_uids.join("\n");
        }
        setGeneState(pile_of_uids);
    };

    const onChangeGene = (e) => {
        if (e.key !== "Enter") {
            return;
        }
        const pile_of_uids = parseDelimitedInput(
            document.getElementById("clientinputgene")?.value ?? "",
        );
        applyGenesFilter(pile_of_uids);
    };

    React.useEffect(() => {
        const onChatGenes = (event) => {
            const genes = event?.detail?.genes;
            if (Array.isArray(genes) && genes.length > 0) {
                applyGenesFilter(genes);
            }
        };
        window.addEventListener(NEO_SET_GENES_EVENT, onChatGenes);
        return () => window.removeEventListener(NEO_SET_GENES_EVENT, onChatGenes);
    }, []);

    const onSelectHandle = (e) => {
        setPageTypeState({"value": e.target.value, "initialized": true});
    }
    //for selecting first signature: Object.keys(signatureListState)[0]

    //console.log("jsonGBM", jsonGBM);
    const prevCancerSignatureGroupState = useRef();
    const prevSignatureState = useRef();
    const prevCoordState = useRef();
    const prevGeneState = useRef();
    const prevCancerTypeState = useRef();
    const prevSampleState = useRef();

    React.useEffect(() => {
        if(Object.keys(signatureListState)[0] == "None")
        {
          var args2 = {};
          args2["callback"] = setSignatureListState;
          args2["cancerType"] = cancerTypeState.cancerType;
          makeRequest("updateSignatureGeneric", args2);
        }
    }, [])

    //console.log("starting sample list", startingSampleList);
    //console.log("starting sample list 2", Object.keys(sampleListState)[0], Object.keys(startingSampleList)[0]);
    React.useEffect(() => {
          setSampleListState(startingSampleList);
    }, [startingSampleList])

    React.useEffect(() => {
        if(cancerTypeState.initialized == true || signatureState.initialized == true || coordState != undefined || geneState != undefined)
        {
            let heatmapArgs = {};
            heatmapArgs["document"] = document;
            heatmapArgs["callback"] = setViewPane;
            heatmapArgs["pancancerupdate"] = setPanCancerState;
            let sampleArgs = {};
            heatmapArgs["exportView"] = {};
            if(prevSignatureState.current.signature != signatureState.signature)
            {
              setEventFontState({
                "sigFontColor": "blue",
                "coordFontColor": "grey",
                "geneFontColor": "grey"
              })
              heatmapArgs["signature"] = [signatureState.signature];
              heatmapArgs["oncocluster"] = [signatureState.oncocluster];
              heatmapArgs["eventType"] = "Signature";
              heatmapArgs["sample"] = sampleState;
              heatmapArgs["coords"] = coordState;
              heatmapArgs["genes"] = geneState;
              heatmapArgs["comparedCancer"] = cancerSignatureGroupState.cancerType;
              heatmapArgs["cancerType"] = cancerTypeState.cancerType;
              makeRequest("updateHeatmapData", heatmapArgs);
              //setEventTypeState({"eventType": "Coords", "initialized": true})
            }
            else if(prevCoordState.current != coordState)
            {
              setEventFontState({
                "sigFontColor": "grey",
                "coordFontColor": "blue",
                "geneFontColor": "grey"
              })
              heatmapArgs["signature"] = [signatureState.signature];
              heatmapArgs["oncocluster"] = [signatureState.oncocluster];
              heatmapArgs["eventType"] = "Coordinates";
              heatmapArgs["sample"] = sampleState;
              heatmapArgs["coords"] = coordState;
              heatmapArgs["genes"] = geneState;
              heatmapArgs["comparedCancer"] = cancerSignatureGroupState.cancerType;
              heatmapArgs["cancerType"] = cancerTypeState.cancerType;
              makeRequest("updateHeatmapData", heatmapArgs);
              //setEventTypeState({"eventType": "Coords", "initialized": true})
            }
            else if(prevGeneState.current != geneState)
            {
              setEventFontState({
                "sigFontColor": "grey",
                "coordFontColor": "grey",
                "geneFontColor": "blue"
              })
              heatmapArgs["signature"] = [signatureState.signature];
              heatmapArgs["oncocluster"] = [signatureState.oncocluster];
              heatmapArgs["eventType"] = "Genes";
              heatmapArgs["sample"] = sampleState;
              heatmapArgs["coords"] = coordState;
              heatmapArgs["genes"] = geneState;
              heatmapArgs["comparedCancer"] = cancerSignatureGroupState.cancerType;
              heatmapArgs["cancerType"] = cancerTypeState.cancerType;
              makeRequest("updateHeatmapData", heatmapArgs);
              //setEventTypeState({"eventType": "Coords", "initialized": true})
            }
            else if(prevCancerTypeState.current != prevCancerTypeState)
            {
              document.getElementById("coordTextInfo").style.color = "grey";
              document.getElementById("geneTextInfo").style.color = "grey";
              document.getElementById("sigTextInfo").style.color = "blue";
              let sigTemp = signatureState.signature;
              if(sigTemp == undefined || sigTemp == "None")
              {
                sigTemp = Object.entries(signatureListState)[0];
                console.log("sigTemp", sigTemp);
                console.log("signatureListState", signatureListState)
                signatureSelectHandle(sigTemp)
                setSampleOptions({"key": undefined, "options": []});
                setSampleState();
              }
              else
              {
                heatmapArgs["signature"] = [signatureState.signature];
                heatmapArgs["oncocluster"] = [signatureState.oncocluster];
                heatmapArgs["eventType"] = "Signature";
                heatmapArgs["sample"] = undefined;
                heatmapArgs["coords"] = coordState;
                heatmapArgs["genes"] = geneState;
                heatmapArgs["comparedCancer"] = cancerSignatureGroupState.cancerType;
                heatmapArgs["cancerType"] = cancerTypeState.cancerType;
                makeRequest("updateHeatmapData", heatmapArgs);
                setSampleOptions({"key": undefined, "options": []});
                setSampleState();
              }
            }
            else
            {
              document.getElementById("coordTextInfo").style.color = "grey";
              document.getElementById("geneTextInfo").style.color = "grey";
              document.getElementById("sigTextInfo").style.color = "blue";
              heatmapArgs["signature"] = [signatureState.signature];
              heatmapArgs["oncocluster"] = [signatureState.oncocluster];
              heatmapArgs["eventType"] = "Signature";
              heatmapArgs["sample"] = sampleState;
              heatmapArgs["coords"] = coordState;
              heatmapArgs["genes"] = geneState;
              heatmapArgs["comparedCancer"] = cancerSignatureGroupState.cancerType;
              heatmapArgs["cancerType"] = cancerTypeState.cancerType;
              makeRequest("updateHeatmapData", heatmapArgs);
            }

            sampleArgs["cancerType"] = cancerTypeState.cancerType;
            sampleArgs["signature"] = signatureState.signature;
            sampleArgs["exportView"] = {};
            sampleArgs["callback"] = setSampleListState;
            sampleArgs["pancancerupdate"] = setPanCancerState;
            makeRequest("uiFields", sampleArgs);

        }

        prevCancerTypeState.current = cancerTypeState;
        prevSignatureState.current = signatureState;
        prevCoordState.current = coordState;
        prevGeneState.current = geneState;

      }, [cancerTypeState, signatureState, coordState, geneState])

    React.useEffect(() => {
        if(sampleState != undefined)
        {
            if(sampleState != prevSampleState.current && sampleState.key != undefined && sampleState.value != undefined)
            {
              let heatmapArgs = {};
              let sampleArgs = {};
              heatmapArgs["document"] = document;
              heatmapArgs["callback"] = setViewPane;
              heatmapArgs["exportView"] = {};
              heatmapArgs["signature"] = [signatureState.signature];
              heatmapArgs["oncocluster"] = [signatureState.oncocluster];
              heatmapArgs["eventType"] = "Signature";
              heatmapArgs["sample"] = sampleState;
              heatmapArgs["coords"] = coordState;
              heatmapArgs["genes"] = geneState;
              heatmapArgs["comparedCancer"] = cancerSignatureGroupState.cancerType;
              heatmapArgs["cancerType"] = cancerTypeState.cancerType;
              makeRequest("updateHeatmapData", heatmapArgs);

              sampleArgs["cancerType"] = cancerTypeState.cancerType;
              sampleArgs["signature"] = signatureState.signature;
              sampleArgs["exportView"] = {};
              sampleArgs["callback"] = setSampleListState;
              sampleArgs["pancancerupdate"] = setPanCancerState;
              makeRequest("uiFields", sampleArgs);
            }
        }
        prevSampleState.current = sampleState;
      }, [sampleState])

    React.useEffect(() => {
        if(cancerSignatureGroupState.initialized == true)
        {
            let args = {};
            args["exportView"] = {};
            args["document"] = document;
            //args["updateHeatmapArgs"] = {"callback": setViewPane, "document": document, "exportView": {}, "signature": signatureState.signature, "comparedCancer": cancerSignatureGroupState.cancerType, "cancerType": cancerTypeState.cancerType, "sample": sampleState};
            args["callbackOne"] = setSignatureListState;
            args["callbackTwo"] = setSignatureState;
            args["cancerType"] = cancerSignatureGroupState.cancerType;
            makeRequest("updateSignature", args);
        }
        prevCancerSignatureGroupState.current = cancerSignatureGroupState;
      }, [cancerSignatureGroupState])

    return(
      <div id="dropdownOptionsDiv" style={{width: "120%", position: "relative"}}>
        {/* Loading Overlay */}
        <div 
          id="navLoadingOverlay" 
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            zIndex: 9999,
            display: "none",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            backdropFilter: "blur(2px)"
          }}
        >
          <div style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: "#0F6A8B",
            marginBottom: "10px",
            textAlign: "left",
            alignSelf: "flex-start",
            marginLeft: "20px"
          }}>
            Loading...
          </div>
          <div style={{
            width: "40px",
            height: "40px",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #0F6A8B",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} />
        </div>
        
        <Grid container spacing={1}>
        <Grid id="gridItem1" item>
        <Dropdown title="Cancer Type"
        onSelect={cancerSelectHandle}
        activeKey={cancerTypeState.cancerType}
        placement="bottomStart"
        size="xs"
        trigger = "hover">
                <HayDropdown eventKey="BLCA" displayName="Bladder Cancer (TCGA)"></HayDropdown>
                <HayDropdown eventKey="BRCA" displayName="Breast Cancer (TCGA)"></HayDropdown>
                <HayDropdown eventKey="CESC" displayName="Cervical Squamous Cell Carcinoma (TCGA)"></HayDropdown>
                <HayDropdown eventKey="COAD" displayName="Colon Cancer (TCGA)"></HayDropdown>
                <HayDropdown eventKey="ESCA" displayName="Esophageal Cancer (TCGA)"></HayDropdown>
                <HayDropdown eventKey="GBM" displayName="Glioblastoma (TCGA)"></HayDropdown>
                <HayDropdown eventKey="GTEX" displayName="GTEX"></HayDropdown>
                <HayDropdown eventKey="HNSC" displayName="Head and Neck Cancer (TCGA)"></HayDropdown>
                <HayDropdown eventKey="KICH" displayName="Kidney Chromophobe (TCGA)"></HayDropdown>
                <HayDropdown eventKey="KIRC" displayName="Kidney Renal Clear Cell Carcinoma (TCGA)"></HayDropdown>
                <HayDropdown eventKey="LGG" displayName="Low-Grade Gliomas (TCGA)"></HayDropdown>
                <HayDropdown eventKey="LIHC" displayName="Liver Cancer (TCGA)"></HayDropdown>
                <HayDropdown eventKey="LUAD" displayName="Lung Cancer (TCGA)"></HayDropdown>
                <HayDropdown eventKey="LUSC" displayName="Lung Squamous Cell Carcinoma (TCGA)"></HayDropdown>
                <HayDropdown eventKey="OV" displayName="Ovarian Cancer (TCGA)"></HayDropdown>
                <HayDropdown eventKey="PAAD" displayName="Pancreatic Cancer (TCGA)"></HayDropdown>
                <HayDropdown eventKey="PCPG" displayName="Pheochromocytoma and paraganglioma (TCGA)"></HayDropdown>
                <HayDropdown eventKey="PRAD" displayName="Primary Prostate Cancer (TCGA)"></HayDropdown>
                <HayDropdown eventKey="READ" displayName="Rectal Cancer (TCGA)"></HayDropdown>
                <HayDropdown eventKey="SARC" displayName="Bone and Connective Tissue Cancer (TCGA)"></HayDropdown>
                <HayDropdown eventKey="SKCM" displayName="Skin Cancer (TCGA)"></HayDropdown>
                <HayDropdown eventKey="STAD" displayName="Stomach Adenocarcinoma (TCGA)"></HayDropdown>
                <HayDropdown eventKey="TGCT" displayName="Tenosynovial Giant Cell Tumors (TCGA)"></HayDropdown>
                <HayDropdown eventKey="THCA" displayName="Thyroid Carcinoma (TCGA)"></HayDropdown>
                <HayDropdown eventKey="UCEC" displayName="Uterine Serous Cancer (TCGA)"></HayDropdown>
        </Dropdown>
        <br/>
        <div style={{textAlign: "center", color: "blue", fontSize: 12}}><strong>{cancerDisplayNames[cancerTypeState.cancerType]}</strong></div>
        </Grid>
        <Grid id="gridItem2" item>
        <Dropdown title="Sample Filter"
        activeKey="BLCA"
        onSelect={sampleMenuPopulate}
        placement="bottomStart"
        size="xs"
        trigger = "hover">
                <div style={{maxHeight: "300px", overflowY: "scroll"}}>
                {(() => {
                    //console.log("good", Object.entries(sampleListState));
                    const dropdownItems = [];
                    for (const [key, value] of Object.entries(sampleListState))
                    {
                        dropdownItems.push(<HayDropdown eventKey={key} displayName={key}></HayDropdown>)
                    }
                    return dropdownItems;
                })()}
                </div>
        </Dropdown>
        <br/>
        <div style={{textAlign: "center", color: "blue", fontSize: 12}}><strong>{sampleOptions.key != undefined && (sampleOptions.key)}</strong></div>
        </Grid>
        <Grid id="gridItem3" item>
        <Dropdown title={"Sample Selection"}
        activeKey="BLCA"
        onSelect={selectSampleHandle}
        placement="bottomStart"
        size="xs"
        trigger = "hover">
                {(() => {
                    //console.log("good", Object.entries(signatureListState));
                    const dropdownItems = [];
                    for(var i = 0; i < sampleOptions.options.length; i++)
                    {
                        dropdownItems.push(<HayDropdown eventKey={[sampleOptions.key, sampleOptions.options[i]]} displayName={sampleOptions.options[i]}></HayDropdown>)
                    }
                    return dropdownItems;
                })()}
        </Dropdown>
        <br/>
        <div style={{textAlign: "center", color: "blue", fontSize: 12}}><strong>{sampleState != undefined && (sampleState.value)}</strong></div>
        </Grid>
        <Grid id="gridItem4" item>
        <Dropdown title="Cancer Signature Selection"
                onSelect={cancerSignatureGroupSelectHandle}
                activeKey={cancerSignatureGroupState.cancerType}
                placement="bottomStart"
                size="xs"
                trigger = "hover">
                <HayDropdown eventKey="BLCA" displayName="Bladder Cancer (TCGA)"></HayDropdown>
                <HayDropdown eventKey="BRCA" displayName="Breast Cancer (TCGA)"></HayDropdown>
                <HayDropdown eventKey="CESC" displayName="Cervical Squamous Cell Carcinoma (TCGA)"></HayDropdown>
                <HayDropdown eventKey="COAD" displayName="Colon Cancer (TCGA)"></HayDropdown>
                <HayDropdown eventKey="ESCA" displayName="Esophageal Cancer (TCGA)"></HayDropdown>
                <HayDropdown eventKey="GBM" displayName="Glioblastoma (TCGA)"></HayDropdown>
                <HayDropdown eventKey="GTEX" displayName="GTEX"></HayDropdown>
                <HayDropdown eventKey="HNSC" displayName="Head and Neck Cancer (TCGA)"></HayDropdown>
                <HayDropdown eventKey="KICH" displayName="Kidney Chromophobe (TCGA)"></HayDropdown>
                <HayDropdown eventKey="KIRC" displayName="Kidney Renal Clear Cell Carcinoma (TCGA)"></HayDropdown>
                <HayDropdown eventKey="LGG" displayName="Low-Grade Gliomas (TCGA)"></HayDropdown>
                <HayDropdown eventKey="LIHC" displayName="Liver Cancer (TCGA)"></HayDropdown>
                <HayDropdown eventKey="LUAD" displayName="Lung Cancer (TCGA)"></HayDropdown>
                <HayDropdown eventKey="LUSC" displayName="Lung Squamous Cell Carcinoma (TCGA)"></HayDropdown>
                <HayDropdown eventKey="OV" displayName="Ovarian Cancer (TCGA)"></HayDropdown>
                <HayDropdown eventKey="PAAD" displayName="Pancreatic Cancer (TCGA)"></HayDropdown>
                <HayDropdown eventKey="PCPG" displayName="Pheochromocytoma and paraganglioma (TCGA)"></HayDropdown>
                <HayDropdown eventKey="PRAD" displayName="Primary Prostate Cancer (TCGA)"></HayDropdown>
                <HayDropdown eventKey="READ" displayName="Rectal Cancer (TCGA)"></HayDropdown>
                <HayDropdown eventKey="SARC" displayName="Bone and Connective Tissue Cancer (TCGA)"></HayDropdown>
                <HayDropdown eventKey="SKCM" displayName="Skin Cancer (TCGA)"></HayDropdown>
                <HayDropdown eventKey="STAD" displayName="Stomach Adenocarcinoma (TCGA)"></HayDropdown>
                <HayDropdown eventKey="TGCT" displayName="Tenosynovial Giant Cell Tumors (TCGA)"></HayDropdown>
                <HayDropdown eventKey="THCA" displayName="Thyroid Carcinoma (TCGA)"></HayDropdown>
                <HayDropdown eventKey="UCEC" displayName="Uterine Serous Cancer (TCGA)"></HayDropdown>
        </Dropdown>
        <br/>
        <div style={{textAlign: "center", color: "blue", fontSize: 12}}><strong>{cancerDisplayNames[cancerSignatureGroupState.cancerType]}</strong></div>
        </Grid>
        <Grid id="gridItem5" item>
        <Dropdown
                title="Signature Name"
                onSelect={signatureSelectHandle}
                activeKey={signatureState.signature}
                placement="bottomStart"
                size="xs"
                trigger = "hover">
                <div style={{maxHeight: "300px", overflowY: "scroll"}}>
                {(() => {
                    console.log("good", Object.entries(signatureListState));
                    const dropdownItems = [];
                    const sortedEntries = Object.entries(signatureListState).sort((a, b) => 
                      a[1].localeCompare(b[1]) // compare values (a[1] and b[1]) in descending order
                    );
                    for (const [key, value] of sortedEntries)
                    {
                        dropdownItems.push(<HayDropdown eventKey={[key, value]} displayName={value}></HayDropdown>)
                    }
                    return dropdownItems;
                })()}
                </div>
        </Dropdown>
        <br/>
        <div id="sigTextInfo" style={{textAlign: "center", color: eventFontState.sigFontColor, fontSize: 12}}><strong>{signatureState.simpleName}</strong></div>
        </Grid>
        <Grid id="gridItem6" item>
        <Dropdown
                title="Enter Coordinates"
                activeKey={"none"}
                placement="bottomStart"
                size="xs"
                trigger = "hover">
                <textarea id="clientinputcoord" onKeyPress={onChangeCoord} placeholder="Enter coordinates here" style={{minWidth: 100, fontSize: 12, minHeight: 60}}/>
        </Dropdown>
        <br/>
        <div id="geneTextInfo" style={{textAlign: "center", color: eventFontState.coordFontColor, fontSize: 12}}><strong>{coordState != undefined && (coordState[0])}</strong></div>
        </Grid>
        <Grid id="gridItem7" item>
        <Dropdown
                title="Enter Genes"
                activeKey={"none"}
                placement="bottomStart"
                size="xs"
                trigger = "hover">
                <textarea id="clientinputgene" onKeyPress={onChangeGene} placeholder="Enter gene symbols" style={{minWidth: 50, fontSize: 12, minHeight: 60}}/>
        </Dropdown>
        <br/>
        <div id="coordTextInfo" style={{textAlign: "center", color: eventFontState.geneFontColor, fontSize: 12}}><strong>{geneState != undefined && (geneState[0])}</strong></div>
        </Grid>
        </Grid>
      </div>);

}

export default Header;
