import 'regenerator-runtime/runtime';
import React from 'react';
import ReactDOM from 'react-dom';
import targeturl from './targeturl.js';
import '@fontsource/roboto';
import {Helmet} from "react-helmet";
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { isBuild } from './utilities/constants.js';
import './App.css';

import MainPanel from './MainPanel.js';
import TopNav from './TopNav.js';
//Versioninga
//console.log('process.argv', process.argv);
var version = "0.1";
if(module.hot){
    module.hot.accept()
}
//App function is the top level function, all components are underneath this function. At this level the routing is controlled.
function App() {
  if(module.hot){
    module.hot.accept()
  }

  var routeurl = isBuild ? "/ICGS/Oncosplice/smart/index.html" : "/app";
  //console.log(process.env.NODE_ENV)
  /*
  if(process.env.NODE_ENV == "production")
  {
    console.log("Let's go")
  }
  else
  {
    console.log("Let's stop")
  }*/
  //This is a list of pages visited on this website on the cache. It is not in use now but could be useful later.
  var pages = [];

  const onAddPage = (invalue) => {
    pages.push(invalue);
  }

  return (
    //The <Redirect> component always ensures that the "splash page" for the website is the "build query" tab.
    //In the "Route" component, any parameter supplied after the base url is encoded as a parameter in the child component, "MainPane".
    //MainPane is the component which controls everything below the header; 99% of this web application's content falls under it.
    //For further information, please see "MainPane" component.
    <Router>
    <div style={{ marginLeft: 10, marginRight: 10, fontFamily: 'Roboto' }}>
    <Helmet>
      <script src="https://d3js.org/d3.v5.js" type="text/javascript" />
    </Helmet>
    <TopNav />
    <Switch>
      <Route exact path={routeurl.concat("/:page?")} render={props => <MainPanel {...props} addPage={onAddPage} pagelist={pages}/>} />
      <Route exact path={routeurl.concat("/:page?/:options?/:signature?/:simple?/:gene?/:coord?")} render={props => <MainPanel {...props} addPage={onAddPage} pagelist={pages}/>} />
    </Switch>
    </div>
    </Router>
  );

}


ReactDOM.render(<App />, document.getElementById("root"));
