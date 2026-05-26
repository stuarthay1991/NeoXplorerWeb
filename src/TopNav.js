import ReactDOM from 'react-dom';
import Form from 'react-bootstrap/Form'
import useStyles from './css/useStyles.js';
import Grid from '@material-ui/core/Grid';
import { isBuild } from './utilities/constants.js';
import React, { useRef } from "react";
import oncologo from './images/NeoXplorer.png';
import homeicon from './images/home.png';
import infoicon from './images/info.png';
import downloadicon from './images/download.png';
import contacticon from './images/contact.png';
import pubicon from './images/pub.png';

function TopNav() {
  const classes = useStyles();
  var oncoimg = isBuild ? <img src="/ICGS/Oncosplice/neo/OncoLOGO2.png" alt="Logo" width="202" height="50"></img> : <img src={oncologo} alt="Logo" width="202" height="50"></img>;

  const [maskPage, setMaskPage] = React.useState({"name": "data"});

  const prevMaskPage = useRef();

  const onSelectSplash = (e) => {
    window.location.href = "https://www.altanalyze.org/ICGS/Oncosplice/splash/";
  }

  const onSelectHome = (e) => {
    setMaskPage({"name": "data"});
  }

  const onSelectAbout = (e) => {
    //console.log("wat a dolla");
    setMaskPage({"name": "about"});
  }

  const onSelectPublications = (e) => {
    console.log("Publications selected")
  }

  React.useEffect(() => {
    if(prevMaskPage.current != undefined)
    {
      //console.log("PM 1");
      if(prevMaskPage.current != maskPage)
      {
        //console.log("PM 2", maskPage.name);
        if(maskPage.name == "data")
        {
          document.getElementById("aboutpanel").style.display = "none";
          document.getElementById("contactpanel").style.display = "none";
          try{
            document.getElementById("dropdownOptionsDiv").style.display = "block";
          }
          catch(err)
          {
            console.log(err);
          }
          try{
            document.getElementById("pc_dropdownOptionsDiv").style.display = "block";
            document.getElementById("pancancerpanel").style.display = "block";
          }
          catch(err)
          {
            console.log(err);
          }
          document.getElementById("navBarHolder").style.display = "block";
          document.getElementById("tabcontent").style.display = "block";
        }
        else
        {
          document.getElementById("aboutpanel").style.display = "block";
          document.getElementById("contactpanel").style.display = "none";
          document.getElementById("tabcontent").style.display = "none";
          try{
            document.getElementById("dropdownOptionsDiv").style.display = "none";
          }
          catch(err)
          {
            console.log(err);
          }
          try{
            document.getElementById("pc_dropdownOptionsDiv").style.display = "none";
            document.getElementById("pancancerpanel").style.display = "none";
          }
          catch(err)
          {
            console.log(err);
          } 
          document.getElementById("navBarHolder").style.display = "none";
        }
      }
    }
    prevMaskPage.current = maskPage;
  },  [maskPage.name])

  return (
    <>
      <style>{`
        ul.topnav {
          list-style: none;
          display: flex;
          gap: 10px;
        }
        ul.topnav li.topnav {
          display: inline;
          margin: 7px;
          padding: 1px;
        }
        ul.topnav li.topnav a.topnav {
          color: white;
          text-decoration: none;
          display: flex;
          font-size: 21px;
          align-items: center;
        }
        ul li a img {
          align-items: center;
          margin-right: 10px;
        }
      `}</style>
      <div id="neo-top-nav" className={classes.mainpane} style={{ fontFamily: 'Roboto', background: "#0073aa", color: "#0073aa", display: "flex", alignItems: "center", justifyContent: "space-between"}}>
        <div className={classes.cntr_special} onClick={onSelectSplash} style={{cursor: "pointer"}} title="Go to Splash Page">{oncoimg}</div>
        <div className={classes.mainpane_margin_type1}>
        </div>
        <div>
        <ul class="topnav">
                      <li class="topnav"><a href="#" onClick={onSelectHome} class="topnav"><img src={homeicon} height="30" width="30" alt="Home" class="icon"></img>Home</a></li>
                      <li class="topnav"><a href="#" onClick={onSelectAbout} class="topnav"><img src={infoicon} height="30" width="30" alt="About" class="icon"></img>About</a></li>
                      <li class="topnav"><a href="https://pubmed.ncbi.nlm.nih.gov/40333990/" onClick={onSelectPublications} class="topnav" target="_blank"><img src={pubicon} height="30" width="30" alt="Publications" class="icon"></img>Publications</a></li>
                      <li class="topnav"><a class="topnav" href="https://www.synapse.org/Synapse:syn12103642/files/" target="_blank"><img src={downloadicon} height="30" width="30" alt="Downloads" class="icon"></img>Downloads</a></li>
                      <li class="topnav"><a class="topnav" href="mailto: altanalyze@gmail.com"><img src={contacticon} height="30" width="30" alt="Contact" class="icon"></img>Contact</a></li>
        </ul>
        <div id="LoadingStatusDisplay" style={{display: "none"}}>Loading...</div>
        </div>
      </div>
    </>
  );
}

export default TopNav;
