//console.log('process.argv', process);

/*if(process.argv[2] == "local")
{
	var targeturl = "/build";
}
else
{
	var targeturl = "/ICGS/Oncosplice/testing";
}*/
/*var localurl = "/material-app";
var serverurl = "/ICGS/Oncosplice/testing";
var buildurl = "/ICGS/Oncosplice/build";
var hoturl = "/ICGS/Oncosplice/hotload";
const targeturl = serverurl;*/
if(process.env.NODE_ENV == "build")
{
	var targeturl = "/ICGS/Oncosplice/smart"
}
else
{
	var targeturl = "http://localhost:8888/materialapp";
}

export default targeturl;