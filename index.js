const express = require("express");
const app = express();
var initialisation = require ('./app');

app.listen(3000, () => {
  console.log("Application started and Listening on port 3000");
});

app.get("/", (req, res) => {
  
  //res.send(__dirname);
    res.sendFile(__dirname + "/bridge.html");
    console.log("dir name",__dirname);
    
});

//submitConfigurationDetails();

function submitConfigurationDetails(){
    console.log("inside index function")
    initialisation.initialisation();
}