fetch('assets/data.json?script-defer')
.then((response) => response.text())
.then((data) => console.log("script-defer : " + data));