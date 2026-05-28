import { Nav, Dropdown } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { makeRequest } from '../request/CancerDataManagement.js';
import Grid from '@material-ui/core/Grid';
import "./rsuitedropdown.css";
import React from "react";

function HayDropdown(props){
  return(
    <Dropdown.Item eventKey={props.eventKey} style={{fontSize: 12, margin: 1, padding: 1}}>
      {props.displayName}
    </Dropdown.Item>
  );
}

const cancerDisplayNames = {
  "BLCA": "Bladder Cancer (TCGA)",
  "BRCA": "Breast Cancer (TCGA)",
  "CESC": "Cervical Squamous Cell Carcinoma (TCGA)",
  "COAD": "Colon Cancer (TCGA)",
  "ESCA": "Esophageal Cancer (TCGA)",
  "GBM": "Glioblastoma (TCGA)",
  "GTEX": "GTEX",
  "HNSC": "Head and Neck Cancer (TCGA)",
  "KICH": "Kidney Chromophobe (TCGA)",
  "KIRC": "Kidney Renal Clear Cell Carcinoma (TCGA)",
  "LGG": "Low-Grade Gliomas (TCGA)",
  "LIHC": "Liver Cancer (TCGA)",
  "LUAD": "Lung Cancer (TCGA)",
  "LUSC": "Lung Squamous Cell Carcinoma (TCGA)",
  "OV": "Ovarian Cancer (TCGA)",
  "PAAD": "Pancreatic Cancer (TCGA)",
  "PCPG": "Pheochromocytoma and paraganglioma (TCGA)",
  "PRAD": "Primary Prostate Cancer (TCGA)",
  "READ": "Rectal Cancer (TCGA)",
  "SARC": "Bone and Connective Tissue Cancer (TCGA)",
  "SKCM": "Skin Cancer (TCGA)",
  "STAD": "Stomach Adenocarcinoma (TCGA)",
  "TGCT": "Tenosynovial Giant Cell Tumors (TCGA)",
  "THCA": "Thyroid Carcinoma (TCGA)",
  "UCEC": "Uterine Serous Cancer (TCGA)"
};

function PCHeader({setPanCancerState, startingCancer, startingSignature, startingSimple, startingSignatureList, onNavStateChange}){
    const [cancerTypeState, setCancerTypeState] = React.useState({"cancerType": startingCancer, "initialized": false});
    const [signatureState, setSignatureState] = React.useState({"signature": startingSignature, "simpleName": startingSimple, "oncocluster": startingSimple, "initialized": false});
    const [signatureListState, setSignatureListState] = React.useState(startingSignatureList);
    const [cancerSignatureGroupState, setCancerSignatureGroupState] = React.useState({"cancerType": startingCancer, "initialized": false});

    const cancerSelectHandle = (e) => {
        setCancerTypeState({"cancerType": e, "initialized": true});
    }

    const cancerSignatureGroupSelectHandle = (e) => {
        setCancerSignatureGroupState({"cancerType": e, "initialized": true});
    }
    
    const signatureSelectHandle = (e) => {
        var selectedOncocluster = e[1];
        if(selectedOncocluster != undefined) {
          if(selectedOncocluster.indexOf(" (") != -1) {
            selectedOncocluster = selectedOncocluster.split(" (")[0];
          }
        } else {
          selectedOncocluster = "R1-V2";
        }
        let simpleName = e[1];
        if(e[1] == undefined) {
          simpleName = e[0];
        }
        setSignatureState({"signature": e[0], "simpleName": e[1], "oncocluster": selectedOncocluster, "initialized": true});
    }

    React.useEffect(() => {
        if(cancerTypeState.initialized || signatureState.initialized) {
            let args = {};
            args["cancerType"] = cancerTypeState.cancerType;
            args["signature"] = signatureState.signature;
            args["pancancerupdate"] = setPanCancerState;
            makeRequest("pancancer", args);
        }
    }, [cancerTypeState, signatureState])

    React.useEffect(() => {
        if(cancerSignatureGroupState.initialized) {
            let args = {};
            args["exportView"] = {};
            args["document"] = document;
            args["callbackOne"] = setSignatureListState;
            args["callbackTwo"] = setSignatureState;
            args["cancerType"] = cancerSignatureGroupState.cancerType;
            makeRequest("updateSignatureList", args);
        }
    }, [cancerSignatureGroupState])

    // Publish pancancer cancer type selection to MainPanel (for chat context).
    React.useEffect(() => {
        if (typeof onNavStateChange !== "function") {
            return;
        }
        onNavStateChange(cancerTypeState);
    }, [cancerTypeState]);

    return(
      <div id="pc_dropdownOptionsDiv" style={{width: "120%"}}>
        <Grid container spacing={1}>
          <Grid id="pc_gridItem1" item>
            <Dropdown title="Cancer Type"
              onSelect={cancerSelectHandle}
              activeKey={cancerTypeState.cancerType}
              placement="bottomStart"
              size="xs"
              trigger="hover">
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
            <div style={{textAlign: "center", color: "blue", fontSize: 12}}>
              <strong>{cancerDisplayNames[cancerTypeState.cancerType]}</strong>
            </div>
          </Grid>
        </Grid>
      </div>
    );
}

export default PCHeader;
