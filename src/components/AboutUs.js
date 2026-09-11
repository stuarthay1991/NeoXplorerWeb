import React from 'react';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import { isBuild } from '../utilities/constants.js';
import workflow from '../images/workflow.png';

function AboutUs() {
    var workflowimg = isBuild ? <img width="66%" height="66%" src={"/ICGS/Oncosplice/smart/workflow.png"} alt="workflow" /> : <img width="66%" height="66%" src={workflow} alt="workflow" />;

	return(
    <div style={{width: "100%", backgroundColor: "#0f6a8b", position: "relative"}}>
    <div style={{margin: 40, marginTop: 25, backgroundColor: "white"}}>
    <div style={{color: "#0f6a8b", marginTop: 25, marginLeft: 80, marginRight: 80, textAlign: "left"}}>
        <div style={{textAlign: "center"}}>
        <strong><p style={{fontSize: 28}}>What is OncoSplice?</p></strong>
        <br></br>
        {workflowimg}
        <br></br>
        </div>
        <Box>
        <div style={{marginTop: 20, fontSize: 18, textAlign: "left"}}>

        <p>OncoSplice is an NIH supported research project (<a href="https://reporter.nih.gov/search/gxCJoumpGUCBdoMsV60Ycw/project-details/9495857">R01CA226802</a>) focused on defining and understanding novel splicing-defined patient subtypes across human cancers. The OncoSplice web-browser provides interactive access to diverse cancer datasets, enabling the selection of different patient subsets from existing clinical annotations (XenaBrowser) and splicing-events (known and novel). OncoSplice signatures are defined using the OncoSplice analysis workflow (<a href="https://github.com/venkatmi/oncosplice">https://github.com/venkatmi/oncosplice</a>) and in particular the software splice-ICGS. OncoSplice is a branch of the software AltAnalyze (<a href="http://altanalyze.org">http://altanalyze.org</a>).</p>
        <p>The OncoSplice webportal is developed in ReactJS and PostgresSQL and is currently in active development (alpha version). A manuscript describing OncoSplice and the OncoSplice webportal are currently in preparation. For questions, please contact the relevant OncoSplice team members.</p>
        <br />
        <div style={{textAlign: "left", fontSize: 12}}>
        <Grid container spacing={3}>
            <Grid item xs={6}>
                <div style={{margin: 5}}>
                <Grid container spacing={2}>
                <Grid item><strong>Principle Investigator</strong></Grid>
                <Grid item>Nathan Salomonis</Grid>
                <Grid item justify="flex-end"><a href="mailto: Nathan.Salomonis@cchmc.org">Nathan.Salomonis@cchmc.org</a></Grid>
                </Grid>
                </div>
                <div style={{margin: 5}}>
                <Grid container spacing={2}>
                <Grid item><strong>Lead Website Architect</strong></Grid>
                <Grid item>Stuart Hay</Grid>
                <Grid item justify="flex-end"><a href="mailto: Stuart.Hay@cchmc.org">Stuart.Hay@cchmc.org</a></Grid>
                </Grid>
                </div>
                <div style={{margin: 5}}>
                <Grid container spacing={2}>
                <Grid item><strong>UI-UX Developer</strong></Grid>
                <Grid item>Adriana Navarro Sainz</Grid>
                <Grid item justify="flex-end"><a href="mailto: Adriana.NavarroSainz@cchmc.org">Adriana.NavarroSainz@cchmc.org</a></Grid>
                </Grid>
                </div>
            </Grid>
            <Grid item xs={6}>
                <div style={{margin: 5}}>
                <Grid container spacing={2}>
                <Grid item><strong>Co-Lead Data Scientist</strong></Grid>
                <Grid item>Anukana Bhattacharjee</Grid>
                <Grid item justify="flex-end"><a href="mailto: Anukana.Bhattacharjee@cchmc.org">Anukana.Bhattacharjee@cchmc.org</a></Grid>
                </Grid>
                </div>
                <div style={{margin: 5}}>
                <Grid container spacing={2}>
                <Grid item><strong>Co-Lead Data Scientist</strong></Grid>
                <Grid item>Audrey Crowther</Grid>
                <Grid item justify="flex-end"><a href="mailto: Audrey.Crowther@cchmc.org">Audrey.Crowther@cchmc.org</a></Grid>
                </Grid>
                </div>
                <div style={{margin: 5}}>
                <Grid container spacing={2}>
                <Grid item><strong>OncoSplice Development Lead</strong></Grid>
                <Grid item>Meenakshi Venkatasubramanian</Grid>
                <Grid item justify="flex-end"><a href="mailto: mixi03@gmail.com">mixi03@gmail.com</a></Grid>
                </Grid>
                </div>
            </Grid>
        </Grid>
        </div>
        </div>
        </Box>
    </div>
    </div>
    </div>
    );
}

export default AboutUs;
