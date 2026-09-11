// script.js
/*document.addEventListener('DOMContentLoaded', (event) => {
    const searchForm = document.getElementById('searchForm');
    
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const formData = new FormData(searchForm);
        
        let searchParams = {};
        formData.forEach((value, key) => {
            searchParams[key] = value;
        });
        
        console.log('Search Parameters:', searchParams);
        // Here you can add functionality to handle the form data,
        // such as making a request to a server or updating the UI.
    });
    
    searchForm.addEventListener('reset', function(event) {
        console.log('Form has been reset.');
        // Here you can add functionality to handle the form reset,
        // such as clearing specific elements or state.
    });
});*/

function submitForm() {
    var viewHeatmapSelected = document.getElementById("heatmap").checked;
    var viewPancancerSelected = document.getElementById("pancancer").checked;
    //var viewIsoformSelected = document.getElementById("isoform").checked;
    var viewTableSelected = document.getElementById("table").checked;

    var cancerElement = document.getElementById('cancer').value;
    if(cancerElement == "any" || viewTableSelected)
    {
        submitTableForm();
    }
    if(cancerElement != "any" && (viewHeatmapSelected || viewPancancerSelected))
    {
        submitHeatmapForm();
    }
}

async function submitTableForm()
{
    var cancerElement = document.getElementById('cancer').value;
    if(cancerElement == "any")
    {
        cancerElement = "None";
    }
    var textExact = document.getElementById("exact");
    //Example coordinate send chr1:13782831-13786515
    var geneSend = "None";
    var coordinateSend = "None";

    var geneSelected = document.getElementById("gene");
    var juncSelected = document.getElementById("junction");
    var signatureExact = document.getElementById("signature");

    var addressBarPageRoot = "table";

    if(geneSelected.checked)
    {
        if(textExact.value == ""){
            geneSend = "None";
            coordinateSend = "None";
        }
        else{
            geneSend = textExact.value;
            coordinateSend = "None";
        }
    }

    if(juncSelected.checked)
    {
        //var stringSet = "chr19:48249751-48249633";
        if(textExact.value == ""){
            geneSend = "None";
            coordinateSend = "None";
        }
        else{
            //"chr19:48249751-48249633"
            geneSend = "None";
            coordinateSend = textExact.value;
            coordinateSend = coordinateSend.replace(":", "-");
        }        
    }
    if(signatureExact.value == "")
    {
        signatureSend = "None";
    }
    else
    {
        signatureSend = signatureExact.value;
        signatureSend = signatureSend.replace(" ", "_");
    }

    if(signatureExact.value == "" && textExact.value == "")
    {
        geneSend = "None";
        coordinateSend = "None";
        signatureSend = "None";
    }

    if(geneSend == "None" && coordinateSend == "None")
    {
        addressBarPageRoot = "tableforheatmapselect";
    }

    try {
        var addressBarValue = 'https://www.altanalyze.org/ICGS/Oncosplice/smart/index.html/'.concat(addressBarPageRoot).concat('/').concat(cancerElement).concat('/').concat(signatureSend).concat('/None').concat("/").concat(geneSend).concat("/").concat(coordinateSend);
        window.location.href = addressBarValue;
    }
    catch (error) {
        console.error('Error:', error);
    }
}

function neoantigenSearch() {
    var peptide = document.getElementById("peptide");
    var mhc = document.getElementById("mhc");
    var urlSend = "https://deepimmuno.research.cchmc.org/result?peptide=".concat(peptide.value).concat("&mhc=").concat(mhc.value).concat("&is_checked=False");
    var addressBarValue = urlSend;
    window.location.href = addressBarValue;    
}

async function submitHeatmapForm() {
    // Collect form data
    console.log("Selected button.")
    var viewHeatmapSelected = document.getElementById("heatmap").checked;
    var viewPancancerSelected = document.getElementById("pancancer").checked;
    //var addressBarPageRoot = "explore";
    console.log("viewPancancerSelected", viewPancancerSelected);
    if(viewPancancerSelected){var addressBarPageRoot = "pancancer";}
    else{var addressBarPageRoot = "explore";}
    var geneSelected = document.getElementById("gene");
    var juncSelected = document.getElementById("junction");

    var textExact = document.getElementById("exact");
    //Example coordinate send chr1:13782831-13786515
    var geneSend = "";
    var coordinateSend = "";
    if(textExact.value == "")
    {
        geneSend = "None";
        coordinateSend = "None";
    }
    else
    {
        if(geneSelected.checked){
            geneSend = textExact.value;
            coordinateSend = "None";
        }
        if(juncSelected.checked){
            coordinateSend = textExact.value;
            coordinateSend = coordinateSend.replace(":", "-");
            geneSend = "None";
        }
    }
    console.log("muiosa", geneSelected.checked, juncSelected.checked, textExact.value);
    const cancerElement = document.getElementById('cancer').value;
    // getSamples
    try {
        const response1 = await fetch('https://www.altanalyze.org/neoxplorer/api/datasets/splash/collectSamples', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: {
                cancerName: cancerElement,
                geneName: geneSend }
            })
        });

        // Retrieve the response data
        if (response1.ok) {
            const data1 = await response1.json();
            console.log('Success:', data1);
            try {
                const response2 = await fetch('https://www.altanalyze.org/neoxplorer/api/datasets/splash/collectSignature', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ data: cancerElement})
                });
                
                // Retrieve the response data
                if (response2.ok) {
                    const data = await response2.json();
                    console.log('Success:', Object.keys(data.signatureTranslate)[0]);
                    console.log('Success:', Object.values(data.signatureTranslate)[0]);
                    const signatureElement = Object.keys(data.signatureTranslate)[0];
                    const simpleElement = Object.values(data.signatureTranslate)[0];
                    var addressBarValue = 'https://www.altanalyze.org/ICGS/Oncosplice/smart/index.html/'.concat(addressBarPageRoot).concat('/').concat(cancerElement).concat("/").concat(signatureElement).concat("/").concat(simpleElement).concat("/").concat(geneSend).concat("/").concat(coordinateSend);
                    console.log('addval', addressBarValue);
                    window.location.href = addressBarValue;
                } else {
                    console.error('Error:', response2.statusText);
                }
            } 
            catch (error) {
                console.error('Error:', error);
            }
        } else {
            console.error('Error:', response.statusText);
        }
    } 
    catch (error) {
        console.error('Error:', error);
    }
    // getSignatures
}

function onSelectCancer(){    
    submitHeatmapForm();
}

document.addEventListener('DOMContentLoaded', () => {
    // Function to check which radio button is selected
    function checkSelectedRadio() {
        const radios = document.querySelectorAll('input[name="molecule"]');
        let selectedValue = null;
        radios.forEach(radio => {
            if (radio.checked) {
                selectedValue = radio.value;
            }
        });
        if (selectedValue) {
            console.log(`Selected radio button: ${selectedValue}`);
        } else {
            console.log('No radio button is selected.');
        }
    }

    // Function to check if the text input is focused
    function checkTextInputFocus() {
        const textInput = document.getElementById('exact');
        if (document.activeElement === textInput) {
            console.log('The text input is currently focused.');
        } else {
            console.log('The text input is not focused.');
        }
    }

    // Run the functions when the page loads and when the input is clicked or changed
    checkSelectedRadio();
    checkTextInputFocus();

    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', () => {
            checkSelectedRadio();
        });

        input.addEventListener('focus', () => {
            checkTextInputFocus();
        });

        input.addEventListener('blur', () => {
            checkTextInputFocus();
        });
    });
});