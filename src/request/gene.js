import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

function gene(arg, targeturl)
{
  const exportView = arg["export"];
  const clientGenes = arg["clientGenes"];
  const curCancer = arg["cancer"];
  const num = arg["num"];
  const callback = arg["setState"];
  var resamt = arg["resamt"];

  var bodyFormData = new FormData();
  exportView["single"] = [];
  for(var i = 0; i < clientGenes.length; i++)
  {
    bodyFormData.append(("GENE".concat(clientGenes[i])), ("GENE".concat(clientGenes[i])));
    exportView["single"].push(("Gene: ".concat(clientGenes[i])));
  }
  bodyFormData.append("CANCER",curCancer);
  axios({
    method: "post",
    url: (targeturl.concat("/backend/getgene.php")),
    data: bodyFormData,
    headers: { "Content-Type": "multipart/form-data" },
  })
    .then(function (response) {
      var totalmatch = response["data"]["single"];
      var outmatch = {"samples": resamt["samples"], "events": totalmatch};
      callback(clientGenes, exportView, outmatch);
  })	
}

export default gene;