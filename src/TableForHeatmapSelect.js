import '@fontsource/roboto';
import React from 'react';
import MinorTable from './components/MinorTable.js';
import {isBuild, rootHeatmapTableObj, cancerValueToName} from './utilities/constants.js';
import axios from 'axios';

var routeurl = isBuild ? "https://www.altanalyze.org/neoxplorer" : "http://localhost:8081";
var localAddress = isBuild ? "https://www.altanalyze.org/ICGS/Oncosplice/neo/index.html" : "http://localhost:8080/app";

function setupLinkForHeatmap(cancer, signature){    
    var simplename = signature.substring(4).replace(/_/g, "-");
    var url = localAddress.concat("/explore/").concat(cancer.toUpperCase()).concat("/").concat(signature).concat("/").concat(simplename).concat("/None/None");
    const hyperlinkObject = <a href={url} target="_blank">Go</a>;
    return hyperlinkObject;    
}

function setUpLinkForPancancer(cancer, signature){
    var simplename = signature.substring(4).replace(/_/g, "-");
    var url = localAddress.concat("/pancancer/").concat(cancer.toUpperCase()).concat("/").concat(signature).concat("/").concat(simplename).concat("/None/None");
    const hyperlinkObject = <a href={url} target="_blank">Go</a>;
    return hyperlinkObject;
}

const psiToGe = {
    "psi_adipose___subcutaneous_vs_others": "GE.Adipose - Subcutaneous_vs_Others.txt",
    "psi_adipose___visceral_omentum__vs_others": "GE.Adipose - Visceral-Omentum_vs_Others.txt",
    "psi_adrenal_gland_vs_others": "GE.Adrenal Gland_vs_Others.txt",
    "psi_artery___aorta_vs_others": "GE.Artery - Aorta_vs_Others.txt",
    "psi_artery___coronary_vs_others": "GE.Artery - Coronary_vs_Others.txt",
    "psi_artery___tibial_vs_others": "GE.Artery - Tibial_vs_Others.txt",
    "psi_bladder_vs_others": "GE.Bladder_vs_Others.txt",
    "psi_brain___amygdala_vs_others": "GE.Brain - Amygdala_vs_Others.txt",
    "psi_brain___anterior_cingulate_cortex_ba24__vs_others": "GE.Brain - Anterior cingulate cortex-BA24 _vs_Others.txt",
    "psi_brain___caudate_basal_ganglia__vs_others": "GE.Brain - Caudate-basal ganglia _vs_Others.txt",
    "psi_brain___cerebellar_hemisphere_vs_others": "GE.Brain - Cerebellar Hemisphere_vs_Others.txt",
    "psi_brain___cerebellum_vs_others": "GE.Brain - Cerebellum_vs_Others.txt",
    "psi_brain___cortex_vs_others": "GE.Brain - Cortex_vs_Others.txt",
    "psi_brain___frontal_cortex_ba9__vs_others": "GE.Brain - Frontal Cortex-BA9 _vs_Others.txt",
    "psi_brain___hippocampus_vs_others": "GE.Brain - Hippocampus_vs_Others.txt",
    "psi_brain___hypothalamus_vs_others": "GE.Brain - Hypothalamus_vs_Others.txt",
    "psi_brain___nucleus_accumbens_basal_ganglia__vs_others": "GE.Brain - Nucleus accumbens-basal ganglia _vs_Others.txt",
    "psi_brain___putamen_basal_ganglia__vs_others": "GE.Brain - Putamen-basal ganglia _vs_Others.txt",
    "psi_brain___spinal_cord_cervical_c_1__vs_others": "GE.Brain - Spinal cord-cervical c-1 _vs_Others.txt",
    "psi_brain___substantia_nigra_vs_others": "GE.Brain - Substantia nigra_vs_Others.txt",
    // no obvious GE equivalent for psi_brain_vs_other in List 3
    "psi_brain_vs_other": null,
  
    "psi_breast___mammary_tissue_vs_others": "GE.Breast - Mammary Tissue_vs_Others.txt",
    "psi_cells___cultured_fibroblasts_vs_others": "GE.Cells - Cultured fibroblasts_vs_Others.txt",
    "psi_cells___ebv_transformed_lymphocytes_vs_others": "GE.Cells - EBV-transformed lymphocytes_vs_Others.txt",
    "psi_cells___leukemia_cell_line_cml__vs_others": "GE.Cells - Leukemia cell line-CML _vs_Others.txt",
    "psi_cervix___ectocervix_vs_others": "GE.Cervix - Ectocervix_vs_Others.txt",
    "psi_cervix___endocervix_vs_others": "GE.Cervix - Endocervix_vs_Others.txt",
    "psi_colon___sigmoid_vs_others": "GE.Colon - Sigmoid_vs_Others.txt",
    "psi_colon___transverse_vs_others": "GE.Colon - Transverse_vs_Others.txt",
    "psi_esophagus___gastroesophageal_junction_vs_others": "GE.Esophagus - Gastroesophageal Junction_vs_Others.txt",
    "psi_esophagus___mucosa_vs_others": "GE.Esophagus - Mucosa_vs_Others.txt",
    "psi_esophagus___muscularis_vs_others": "GE.Esophagus - Muscularis_vs_Others.txt",
    "psi_fallopian_tube_vs_others": "GE.Fallopian Tube_vs_Others.txt",
    "psi_heart___atrial_appendage_vs_others": "GE.Heart - Atrial Appendage_vs_Others.txt",
    "psi_heart___left_ventricle_vs_others": "GE.Heart - Left Ventricle_vs_Others.txt",
    "psi_kidney___cortex_vs_others": "GE.Kidney - Cortex_vs_Others.txt",
    "psi_liver_vs_others": "GE.Liver_vs_Others.txt",
    "psi_lung_vs_others": "GE.Lung_vs_Others.txt",
    "psi_minor_salivary_gland_vs_others": "GE.Minor Salivary Gland_vs_Others.txt",
    "psi_muscle___skeletal_vs_others": "GE.Muscle - Skeletal_vs_Others.txt",
    "psi_nerve___tibial_vs_others": "GE.Nerve - Tibial_vs_Others.txt",
    "psi_ovary_vs_others": "GE.Ovary_vs_Others.txt",
    "psi_pancreas_vs_others": "GE.Pancreas_vs_Others.txt",
    "psi_pituitary_vs_others": "GE.Pituitary_vs_Others.txt",
    "psi_prostate_vs_others": "GE.Prostate_vs_Others.txt",
    "psi_skin___not_sun_exposed_suprapubic__vs_others": "GE.Skin - Not Sun Exposed-Suprapubic _vs_Others.txt",
    "psi_skin___sun_exposed_lower_leg__vs_others": "GE.Skin - Sun Exposed-Lower leg _vs_Others.txt",
    "psi_small_intestine___terminal_ileum_vs_others": "GE.Small Intestine - Terminal Ileum_vs_Others.txt",
    "psi_spleen_vs_others": "GE.Spleen_vs_Others.txt",
    "psi_stomach_vs_others": "GE.Stomach_vs_Others.txt",
    "psi_testis_vs_others": "GE.Testis_vs_Others.txt",
    "psi_thyroid_vs_others": "GE.Thyroid_vs_Others.txt",
    "psi_uterus_vs_others": "GE.Uterus_vs_Others.txt",
    "psi_vagina_vs_others": "GE.Vagina_vs_Others.txt",
    "psi_whole_blood_vs_others": "GE.Whole Blood_vs_Others.txt"
  };

  const psiToPsiFile = {
    "psi_adipose___subcutaneous_vs_others":
      "PSI.Adipose - Subcutaneous_vs_Others.txt",
    "psi_adipose___visceral_omentum__vs_others":
      "PSI.Adipose - Visceral-Omentum_vs_Others.txt",
  
    "psi_adrenal_gland_vs_others":
      "PSI.Adrenal Gland_vs_Others.txt",
  
    "psi_artery___aorta_vs_others":
      "PSI.Artery - Aorta_vs_Others.txt",
    "psi_artery___coronary_vs_others":
      "PSI.Artery - Coronary_vs_Others.txt",
    "psi_artery___tibial_vs_others":
      "PSI.Artery - Tibial_vs_Others.txt",
  
    "psi_bladder_vs_others":
      "PSI.Bladder_vs_Others.txt",
  
    "psi_brain___amygdala_vs_others":
      "PSI.Brain - Amygdala_vs_Others.txt",
    "psi_brain___anterior_cingulate_cortex_ba24__vs_others":
      "PSI.Brain - Anterior cingulate cortex-BA24 _vs_Others.txt",
    "psi_brain___caudate_basal_ganglia__vs_others":
      "PSI.Brain - Caudate-basal ganglia _vs_Others.txt",
    "psi_brain___cerebellar_hemisphere_vs_others":
      "PSI.Brain - Cerebellar Hemisphere_vs_Others.txt",
    "psi_brain___cerebellum_vs_others":
      "PSI.Brain - Cerebellum_vs_Others.txt",
    "psi_brain___cortex_vs_others":
      "PSI.Brain - Cortex_vs_Others.txt",
    "psi_brain___frontal_cortex_ba9__vs_others":
      "PSI.Brain - Frontal Cortex-BA9 _vs_Others.txt",
    "psi_brain___hippocampus_vs_others":
      "PSI.Brain - Hippocampus_vs_Others.txt",
    "psi_brain___hypothalamus_vs_others":
      "PSI.Brain - Hypothalamus_vs_Others.txt",
    "psi_brain___nucleus_accumbens_basal_ganglia__vs_others":
      "PSI.Brain - Nucleus accumbens-basal ganglia _vs_Others.txt",
    "psi_brain___putamen_basal_ganglia__vs_others":
      "PSI.Brain - Putamen-basal ganglia _vs_Others.txt",
    "psi_brain___spinal_cord_cervical_c_1__vs_others":
      "PSI.Brain - Spinal cord-cervical c-1 _vs_Others.txt",
    "psi_brain___substantia_nigra_vs_others":
      "PSI.Brain - Substantia nigra_vs_Others.txt",
    "psi_brain_vs_other":
      "PSI.Brain_vs_Other.txt",
  
    "psi_breast___mammary_tissue_vs_others":
      "PSI.Breast - Mammary Tissue_vs_Others.txt",
  
    "psi_cells___cultured_fibroblasts_vs_others":
      "PSI.Cells - Cultured fibroblasts_vs_Others.txt",
    "psi_cells___ebv_transformed_lymphocytes_vs_others":
      "PSI.Cells - EBV-transformed lymphocytes_vs_Others.txt",
    "psi_cells___leukemia_cell_line_cml__vs_others":
      "PSI.Cells - Leukemia cell line-CML _vs_Others.txt",
  
    "psi_cervix___ectocervix_vs_others":
      "PSI.Cervix - Ectocervix_vs_Others.txt",
    "psi_cervix___endocervix_vs_others":
      "PSI.Cervix - Endocervix_vs_Others.txt",
  
    "psi_colon___sigmoid_vs_others":
      "PSI.Colon - Sigmoid_vs_Others.txt",
    "psi_colon___transverse_vs_others":
      "PSI.Colon - Transverse_vs_Others.txt",
  
    "psi_esophagus___gastroesophageal_junction_vs_others":
      "PSI.Esophagus - Gastroesophageal Junction_vs_Others.txt",
    "psi_esophagus___mucosa_vs_others":
      "PSI.Esophagus - Mucosa_vs_Others.txt",
    "psi_esophagus___muscularis_vs_others":
      "PSI.Esophagus - Muscularis_vs_Others.txt",
  
    "psi_fallopian_tube_vs_others":
      "PSI.Fallopian Tube_vs_Others.txt",
  
    "psi_heart___atrial_appendage_vs_others":
      "PSI.Heart - Atrial Appendage_vs_Others.txt",
    "psi_heart___left_ventricle_vs_others":
      "PSI.Heart - Left Ventricle_vs_Others.txt",
  
    "psi_kidney___cortex_vs_others":
      "PSI.Kidney - Cortex_vs_Others.txt",
  
    "psi_liver_vs_others":
      "PSI.Liver_vs_Others.txt",
    "psi_lung_vs_others":
      "PSI.Lung_vs_Others.txt",
  
    "psi_minor_salivary_gland_vs_others":
      "PSI.Minor Salivary Gland_vs_Others.txt",
  
    "psi_muscle___skeletal_vs_others":
      "PSI.Muscle - Skeletal_vs_Others.txt",
  
    "psi_nerve___tibial_vs_others":
      "PSI.Nerve - Tibial_vs_Others.txt",
  
    "psi_ovary_vs_others":
      "PSI.Ovary_vs_Others.txt",
    "psi_pancreas_vs_others":
      "PSI.Pancreas_vs_Others.txt",
    "psi_pituitary_vs_others":
      "PSI.Pituitary_vs_Others.txt",
    "psi_prostate_vs_others":
      "PSI.Prostate_vs_Others.txt",
  
    "psi_skin___not_sun_exposed_suprapubic__vs_others":
      "PSI.Skin - Not Sun Exposed-Suprapubic _vs_Others.txt",
    "psi_skin___sun_exposed_lower_leg__vs_others":
      "PSI.Skin - Sun Exposed-Lower leg _vs_Others.txt",
  
    "psi_small_intestine___terminal_ileum_vs_others":
      "PSI.Small Intestine - Terminal Ileum_vs_Others.txt",
  
    "psi_spleen_vs_others":
      "PSI.Spleen_vs_Others.txt",
    "psi_stomach_vs_others":
      "PSI.Stomach_vs_Others.txt",
    "psi_testis_vs_others":
      "PSI.Testis_vs_Others.txt",
    "psi_thyroid_vs_others":
      "PSI.Thyroid_vs_Others.txt",
    "psi_uterus_vs_others":
      "PSI.Uterus_vs_Others.txt",
    "psi_vagina_vs_others":
      "PSI.Vagina_vs_Others.txt",
    "psi_whole_blood_vs_others":
      "PSI.Whole Blood_vs_Others.txt"
  };


function convertSignatureToFilename(signature, dataType = 'GE') {
    // Mapping of source-type combinations to codes
    const typeMapping = {
      'Broad-all': 'BA',
      'Broad-tumor': 'BT',
      'Default-all': 'DA',
      'Default-tumor': 'DT'
    };
    
    // Determine prefix based on data type
    const prefixMapping = {
      'GE': 'GE',      // Gene Expression (for DE_genes)
      'PSI': 'PSI',    // Percent Spliced In (for DE_splicing_events)
      'gene': 'GE',
      'splicing': 'PSI'
    };
    
    const prefix = prefixMapping[dataType] || dataType;
    
    // Parse the signature: CANCER_SOURCE-TYPE:RX-VY
    // Example: GBM_Broad-all:R2-V3
    const regex = /^([A-Z]+)_([^:]+):(.+)$/;
    const match = signature.match(regex);
    
    if (!match) {
      throw new Error(`Invalid signature format: ${signature}`);
    }
    
    const cancer = match[1];        // e.g., "GBM"
    const sourceType = match[2];    // e.g., "Broad-all"
    const runVersion = match[3];    // e.g., "R2-V3"
    
    // Get the code for this source-type combination
    const code = typeMapping[sourceType];
    
    if (!code) {
      throw new Error(`Unknown source-type combination: ${sourceType}`);
    }
    
    // Build the filename
    const filename = `${prefix}.${cancer}_${code}_${runVersion}.txt`;
    
    return filename;
}

function normalizeNameGTEX_PSI(name) {
    return name
      .toLowerCase()
      .replace(/\.txt$/, "")                         // remove .txt
      .replace(/psi\./g, "psi_")                     // PSI.Brain → psi_brain
      .replace(/ - /g, "___")                        // "PSI.Brain - Amygdala" → psi_brain___amygdala
      .replace(/[ .-]/g, "_")                        // replace spaces, hyphens, dots with underscores
      .replace(/_+/g, "_")                           // collapse multiple underscores
      .replace(/_vs_others?$/, "_vs_others");        // unify vs_others
}

function normalizeNameGTEX_GE(name) {
    if (typeof name !== "string") return null;

    // strip prefix and suffix
    let core = name.trim();
    core = core.replace(/^psi_/, "");              // remove leading "psi_"
    core = core.replace(/_vs_others$/i, "");       // remove trailing "_vs_others"
  
    // split into tissue and optional detail using the triple underscore
    let tissuePart = core;
    let detailPart = null;
  
    const sep = "___";
    const idx = core.indexOf(sep);
    if (idx !== -1) {
      tissuePart = core.slice(0, idx);
      detailPart = core.slice(idx + sep.length);
    }
  
    // helper: snake_case -> "Title Case"
    function toTitle(str) {
      return str
        .split("_")
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    }
  
    const tissueTitle = toTitle(tissuePart);
    let result;
  
    if (detailPart && detailPart.length > 0) {
      const detailTitle = toTitle(detailPart);
      // with " - " when there is a detail part
      result = `GE.${tissueTitle} - ${detailTitle}_vs_Others.txt`;
    } else {
      // no detail part -> no " - "
      result = `GE.${tissueTitle}_vs_Others.txt`;
    }
  
    return result;
}

function fetchASEs(cancer, signature){
    // Convert signature to filename format (use 'PSI' prefix for splicing events)
    if(cancer == "gtex")
    {
        var filename = psiToPsiFile[signature];
    }
    else
    {
        var filename = convertSignatureToFilename(signature, 'PSI');
    }
    var postedData = {"data": {"cancerName": cancer, "signature": filename}};
    console.log("Fetching ASEs for:", cancer, signature, "-> filename:", filename);
    
    axios({
        method: "post",
        url: routeurl.concat("/api/datasets/getasefile"),
        data: postedData,
        headers: { "Content-Type": "application/json" },
        responseType: 'blob' // Important: tells axios to handle binary data
        })
        .then(function (response) {
            // Create a blob URL from the response
            const blob = new Blob([response.data], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            
            // Create a temporary link element and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        })
        .catch(function (error) {
            console.error("Error downloading ASE file:", error);
            
            // Handle blob error responses (when responseType is 'blob')
            if (error.response && error.response.data instanceof Blob) {
                error.response.data.text().then(text => {
                    try {
                        const errorData = JSON.parse(text);
                        alert("Error: " + (errorData.error || "File not found"));
                    } catch (e) {
                        alert("Error downloading file. Please try again.");
                    }
                });
            } else if (error.response && error.response.status === 404) {
                alert("File not found. Please check that the file exists.");
            } else {
                alert("Error downloading file. Please try again.");
            }
        });
}

function setUpLinkForASEs(cancer, signature, inputText){
    const hyperlinkObject = <a onClick={(e) => {
        e.preventDefault();
        fetchASEs(cancer, signature);
    }} style={{cursor: 'pointer', color: 'blue', textDecoration: 'underline'}}>{inputText}</a>;
    return hyperlinkObject;
}

function fetchDEGs(cancer, signature){
    // Convert signature to filename format
    if(cancer == "gtex")
    {
        var filename = psiToGe[signature];
    }
    else
    {
        var filename = convertSignatureToFilename(signature);
    }
    var postedData = {"data": {"cancerName": cancer, "signature": filename}};
    console.log("Fetching DEGs for:", cancer, signature, "-> filename:", filename);
    
    axios({
        method: "post",
        url: routeurl.concat("/api/datasets/getdegfile"),
        data: postedData,
        headers: { "Content-Type": "application/json" },
        responseType: 'blob' // Important: tells axios to handle binary data
        })
        .then(function (response) {
            // Create a blob URL from the response
            const blob = new Blob([response.data], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            
            // Create a temporary link element and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        })
        .catch(function (error) {
            console.error("Error downloading DEG file:", error);
            
            // Handle blob error responses (when responseType is 'blob')
            if (error.response && error.response.data instanceof Blob) {
                error.response.data.text().then(text => {
                    try {
                        const errorData = JSON.parse(text);
                        alert("Error: " + (errorData.error || "File not found"));
                    } catch (e) {
                        alert("Error downloading file. Please try again.");
                    }
                });
            } else if (error.response && error.response.status === 404) {
                alert("File not found. Please check that the file exists.");
            } else {
                alert("Error downloading file. Please try again.");
            }
        });
}

function setUpLinkForDEGs(cancer, signature, inputText){
    const hyperlinkObject = <a onClick={(e) => {
        e.preventDefault();
        fetchDEGs(cancer, signature);
    }} style={{cursor: 'pointer', color: 'blue', textDecoration: 'underline'}}>{inputText}</a>;
    return hyperlinkObject;
}

function fetchDownloadSample(cancer){
    var postedData = {"data": {"cancerName": cancer}};
    axios({
        method: "post",
        url: routeurl.concat("/api/datasets/getsamplefile"),
        data: postedData,
        headers: { "Content-Type": "application/json" },
        responseType: 'blob' // Important: tells axios to handle binary data
        })
        .then(function (response) {
            // Create a blob URL from the response
            const blob = new Blob([response.data], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            let filename = `samples_${cancer}.txt`;
            const disposition = response.headers['content-disposition'];
            if (disposition) {
                const match = disposition.match(/filename=\"?([^\";]+)\"?/i);
                if (match && match[1]) {
                    filename = match[1];
                }
            }
            
            // Create a temporary link element and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        })
        .catch(function (error) {
            console.error("Error downloading sample file:", error);
            
            // Handle blob error responses (when responseType is 'blob')
            if (error.response && error.response.data instanceof Blob) {
                error.response.data.text().then(text => {
                    try {
                        const errorData = JSON.parse(text);
                        alert("Error: " + (errorData.error || "File not found"));
                    } catch (e) {
                        alert("Error downloading file. Please try again.");
                    }
                });
            } else if (error.response && error.response.status === 404) {
                alert("File not found. Please check that the file exists.");
            } else {
                alert("Error downloading file. Please try again.");
            }
    });    
}

function setUpLinkForSamples(cancer, inputText){
    const hyperlinkObject = <a onClick={(e) => {
        e.preventDefault();
        fetchSamples(cancer);
    }} style={{cursor: 'pointer', color: 'blue', textDecoration: 'underline'}}>{inputText}</a>;
    return hyperlinkObject;
}

function fetchSamples(cancer){
    fetchDownloadSample(cancer);
}

function tablePlotRequest(cancerName, signature, type, pseudoPage, setTableState, newPageSize){
    var type="initial";
    var cancerName = cancerName;
    var postedData = {"data": {"cancerName": cancerName, "signature": signature, "type": type, "pseudoPage": pseudoPage, "newPageSize": newPageSize}}
    axios({
      method: "post",
      url: routeurl.concat("/api/datasets/gettableforheatmapselect"),
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
            var signatureSetUp = curpointer["signature_name"];
            if(curpointer["ases"] != null)
            {
                // Process signature_name based on cancer type
                let processedSignatureName = curpointer["datagroup"];
                if(curpointer["cancer_name"] == "gtex") {
                    // Remove "psi_" prefix if present
                    if(processedSignatureName.startsWith("psi_")) {
                        processedSignatureName = processedSignatureName.substring(4);
                    }
                    // Remove "vs_others"
                    processedSignatureName = processedSignatureName.replace(/vs_others/g, "");
                    // Replace all underscores (single or multiple) with a single space
                    processedSignatureName = processedSignatureName.replace(/_+/g, " ");
                } else {
                    // Remove "psi_" prefix if present
                    if(processedSignatureName.startsWith("psi_")) {
                        processedSignatureName = processedSignatureName.substring(4);
                    }
                }
                
                let curdat = {
                    cancer: cancerValueToName[curpointer["cancer_name"]],
                    signature_name: processedSignatureName,
                    annotation: curpointer["annotation"],
                    heatmap: setupLinkForHeatmap(curpointer["cancer_name"], signatureSetUp),
                    pancancer: setUpLinkForPancancer(curpointer["cancer_name"], signatureSetUp),
                    ases: setUpLinkForASEs(curpointer["cancer_name"], curpointer["datagroup"], curpointer["ases"]),
                    degs: setUpLinkForDEGs(curpointer["cancer_name"], curpointer["datagroup"], curpointer["degs"]),
                    samples: setUpLinkForSamples(curpointer["cancer_name"], curpointer["samples"])
                }
                dataTemp.push(curdat);
            }
        }
        console.log("dataTemp", dataTemp);
        setTableState({
            type: type,
            data: dataTemp,
            page: 0,
            pseudoPage: pseudoPage,
            pageSize: newPageSize,
            totalEntries: resp.totalentries
        });
    })
}

function TableForHeatmapSelect(props) {
    //console.log("TABLEMAN PROPS", props);
    const [tableState, setTableState] = React.useState({
        type: "initial",
        data: undefined,
        page: 0,
        pseudoPage: 0,
        pageSize: 30,
        totalEntries: 0
    });
    const [loading, setLoading] = React.useState(true); // Track loading state
    const [searchTerm, setSearchTerm] = React.useState(""); // Add search state
    const [filteredData, setFilteredData] = React.useState(undefined); // Add filtered data state

    //const [data, setTableState] = React.useState([]); // To store processed data from props or elsewhere
    //gtexpsi_fullsig
    React.useEffect(() => {
        if(tableState.data == undefined)
        {
            tablePlotRequest(props.postedCancer, props.postedAnnotation, "initial", 0, setTableState, 30);
        }
    }, [])

    // Publish raw/processed table rows to parent (e.g. MainPanel) for chat context.
    React.useEffect(() => {
        if (typeof props.onTableDataChange !== "function") {
            return;
        }
        if (tableState.data == undefined) {
            props.onTableDataChange(null);
            return;
        }
        props.onTableDataChange(tableState.data);
    }, [tableState.data]);

    // Add search filter function
    const filterData = (data, searchTerm) => {
        if (!searchTerm.trim()) return data;
        
        return data.filter(item => 
            item.cancer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.signature_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.annotation.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    // Filter data when search term or table data changes
    React.useEffect(() => {
        if (tableState.data) {
            const filtered = filterData(tableState.data, searchTerm);
            setFilteredData(filtered);
        }
    }, [searchTerm, tableState.data]);

    var columns = rootHeatmapTableObj;
    var tableHeaderName = "Signature selection for ";
    if(props.postedCancer == "None"){
        tableHeaderName = tableHeaderName.concat("All Cancers");
    }
    else {
        tableHeaderName = tableHeaderName.concat(cancerValueToName[props.postedCancer.toLowerCase()]);
    }
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
        <div>
            {/* Search Bar */}
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                <label style={{ marginLeft: '2px', fontWeight: 'bold', fontSize: '14px' }}>
                    Search:
                </label>
                <input
                    type="text"
                    placeholder="Search signatures, cancers, or annotations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        marginLeft: '10px',
                        padding: '8px 12px',
                        fontSize: '14px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        width: '300px',
                        marginRight: '8px'
                    }}
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm("")}
                        style={{
                            marginLeft: '10px',
                            padding: '8px 12px',
                            fontSize: '14px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            backgroundColor: '#f5f5f5',
                            cursor: 'pointer'
                        }}
                    >
                        Clear
                    </button>
                )}
            </div>
            
            {/* Table with filtered data */}
            <MinorTable 
                tableState={{
                    ...tableState,
                    data: filteredData || tableState.data
                }} 
                setTableState={setTableState} 
                columns={columns_splc} 
                tablePlotRequest={tablePlotRequest}
            />
        </div>
    );
}

export default TableForHeatmapSelect;