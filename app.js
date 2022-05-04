require('dotenv').config()
var nodeWebSocket = require ('./nodeWebSocket');
const BscnodeUrl = process.env.BSCNODEWSURL;
//let initialisation = function initialise(){
//Connect with Node websocket and subscribe to event
try {    
    console.log("\n\n                  Starting the LYOBRIDGE :- Lock Token SIde                      ");
    console.log("\14                   -----------------------------------------                    \n\n");
    console.log("\t",process.env.MAINCHAIN,"     ------------->      ",  process.env.SIDECHAIN,"\n\n");
    nodeWebSocket.createWebSocket(BscnodeUrl);      
}
catch (error) {
    console.error("Initialisation APP error",error);
}
//}
//initialisation.initialise();
// module.exports =  {   
//     initialisation
//     }