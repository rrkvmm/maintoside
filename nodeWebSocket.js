const Web3 = require('web3');
const ethereumBloomFilters = require('ethereum-bloom-filters');
require('dotenv').config()
var tokenLockRequest = require ('./contractInteraction');

// Websocket
let createWebSocket = 
async function createWebSocket (nodeUrl) {    
console.log("----------Configuring NodeWebSocket-----------",nodeUrl);
var options = {
    timeout: 30000, // ms
    // // Useful for credentialed urls, e.g: ws://username:password@localhost:8546
    // headers: {
    //   authorization: 'Basic username:password'
    // },
    clientConfig: {
      // Useful if requests are large
      maxReceivedFrameSize: 100000000,   // bytes - default: 1MiB
      maxReceivedMessageSize: 100000000, // bytes - default: 8MiB
      // Useful to keep a connection alive
      keepalive: true,
      keepaliveInterval: 60000 // ms
    },
    // Enable auto reconnection
    reconnect: {
        auto: true,
        delay: 5000, // ms
        maxAttempts: 5,
        onTimeout: false
    }
};

try {
var Web3WS = new Web3(new Web3.providers.WebsocketProvider(nodeUrl,options));
console.log("----------Subscribing Blockheader event------ ",nodeUrl)
//Subscribe to the event for new block headers.
var subscription = Web3WS.eth.subscribe('newBlockHeaders', function(error, result){
    if (!error) {
        return;
    }
    console.error(error);
})
.on("connected", function(subscriptionId){
    
    console.log("----------SUCCESS : subscribed with ID -------",subscriptionId);
    console.log("\n\nBlock #")
})
.on("data", function(blockHeader){    

        Web3WS.eth.getBlock(blockHeader.number).then((data)=>{
        const logsBloom1 = data.logsBloom                                    
        let a = ethereumBloomFilters.isContractAddressInBloom(logsBloom1,process.env.MAINTOKENADDRESS)        
        console.log(blockHeader.number)
        if(a)         
        {   console.log("main token address")
            transactions = data.transactions; 
            console.log(transactions)    
            for (i=0;i<transactions.length;i++)
            {                    
            Web3WS.eth.getTransactionReceipt(transactions[i]).then((data)=>{ 
            const logsBloom2 = data.logsBloom
            let b = ethereumBloomFilters.isContractAddressInBloom(logsBloom2,process.env.MAINTOKENADDRESS) 
            if(b)
            {  
                let address = JSON.stringify(data.logs[0].topics[2])
                let address1 = address.slice(27,67)      
                address1=("0x"+address1);
                address1=JSON.stringify(address1)
                let Bridgeaddress =process.env.MAINBRIDGEADDRESS.toLocaleLowerCase();
                Bridgeaddress = JSON.stringify(Bridgeaddress);
                console.log("\nComparing the related addresses\n",Bridgeaddress,address1);            
                if (address1 == Bridgeaddress ) 
                {                
            console.log("\n\n               B R I D G E  T R A  N S A C T I O N   D E T E C T E D ! !       ")
            console.log("               TX HASH:",data.transactionHash);           
            let lockData = [data.from,data.transactionHash,data.logs[0]]
            tokenLockRequest.lockRequest(lockData);
           }  
           console.log(console.log("\n               T O K E N  T R A  N S A C T I O N   D E T E C T E D ! !       \n\n"));
         }                             
          });                     
         }                                
        }       
    });    
})
.on("error", console.error);
}
catch(error){
    console.log("Node websocket error / Tx detection error",error);
}
}

module.exports =  {    
createWebSocket
}