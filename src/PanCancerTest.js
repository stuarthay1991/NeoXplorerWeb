import useStyles from './css/useStyles.js';
import '@fontsource/roboto';
import Button from '@material-ui/core/Button';
import { Resizable, ResizableBox } from "react-resizable";
import { makeStyles, withStyles } from '@material-ui/core/styles';
import React, { useRef } from "react";
import Box from '@material-ui/core/Box';
import SetExonPlot from './plots/exonPlot.js';
import SetDoubleBarChart from './plots/doubleBarChart.js';
import SetStackedBarChart from './plots/stackedBarChart.js';
import Grid from '@material-ui/core/Grid';
import axios from 'axios';
import { useTable, useSortBy, usePagination } from 'react-table';
import Plot from 'react-plotly.js';
import './App.css';
import { v4 as uuidv4 } from 'uuid';
import {isBuild, apiBaseUrl, rootTableColumnSpliceObj, rootTableColumnGeneObj, BLCA_vals, tableStyledDiv} from './utilities/constants.js';
import SetConcordanceGraph from './plots/concordanceGraph.js';
import SetVennDiagram from './plots/vennDiagram.js';
import loadingGif from './images/loading.gif';
//import SetConcordanceGraph from './plots/concordanceGraph.js';

var routeurl = apiBaseUrl;

const Styles = tableStyledDiv;

