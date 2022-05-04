const Web3 = require('web3');
require('dotenv').config()
const axios = require('axios');

let web3Main = new Web3(Web3.givenProvider || process.env.MAINNODEPROVIDER);
let web3Side = new Web3(Web3.givenProvider || process.env.SIDENODEPROVIDER);
SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY;
const MainBridge_address = process.env.MAINBRIDGEADDRESS; 
const SideBridge_address = process.env.SIDEBRIDGEADDRESS;
const gateway_address = web3Main.eth.accounts.privateKeyToAccount(SIGNER_PRIVATE_KEY).address;
const MainBridge_abi = '[{"inputs": [{"internalType": "address", "name": "_mainToken", "type": "address"}, {"internalType": "address", "name": "_gateway", "type": "address"}], "stateMutability": "nonpayable", "type": "constructor", "name": "constructor"}, {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "requester", "type": "address"}, {"indexed": true, "internalType": "bytes32", "name": "mainDepositHash", "type": "bytes32"}, {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}, {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}], "name": "TokensLocked", "type": "event"}, {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "requester", "type": "address"}, {"indexed": true, "internalType": "bytes32", "name": "sideDepositHash", "type": "bytes32"}, {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}, {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}], "name": "TokensUnlocked", "type": "event"}, {"inputs": [{"internalType": "address", "name": "_requester", "type": "address"}, {"internalType": "uint256", "name": "_bridgedAmount", "type": "uint256"}, {"internalType": "bytes32", "name": "_mainDepositHash", "type": "bytes32"}], "name": "lockTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [{"internalType": "address", "name": "_requester", "type": "address"}, {"internalType": "uint256", "name": "_bridgedAmount", "type": "uint256"}, {"internalType": "bytes32", "name": "_sideDepositHash", "type": "bytes32"}], "name": "unlockTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function"}]';
const SideBridge_abi = '[{"inputs": [{"internalType": "address", "name": "_gateway", "type": "address"}], "stateMutability": "nonpayable", "type": "constructor", "name": "constructor"}, {"anonymous": false, "inputs": [{"indexed": true, "internalType": "uint256", "name": "timestamp", "type": "uint256"}], "name": "BridgeInitialized", "type": "event"}, {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "requester", "type": "address"}, {"indexed": true, "internalType": "bytes32", "name": "mainDepositHash", "type": "bytes32"}, {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}, {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}], "name": "TokensBridged", "type": "event"}, {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "requester", "type": "address"}, {"indexed": true, "internalType": "bytes32", "name": "sideDepositHash", "type": "bytes32"}, {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}, {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}], "name": "TokensReturned", "type": "event"}, {"inputs": [{"internalType": "address", "name": "_requester", "type": "address"}, {"internalType": "uint256", "name": "_bridgedAmount", "type": "uint256"}, {"internalType": "bytes32", "name": "_mainDepositHash", "type": "bytes32"}], "name": "bridgeTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [{"internalType": "address", "name": "_childTokenAddress", "type": "address"}], "name": "initializeBridge", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [{"internalType": "address", "name": "_requester", "type": "address"}, {"internalType": "uint256", "name": "_bridgedAmount", "type": "uint256"}, {"internalType": "bytes32", "name": "_sideDepositHash", "type": "bytes32"}], "name": "returnTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function"}]';
const MainBridge = new web3Main.eth.Contract(JSON.parse(MainBridge_abi),MainBridge_address);
const SideBridge = new web3Side.eth.Contract(JSON.parse(SideBridge_abi),SideBridge_address);
const main_chain_no = process.env.MAINCHAINNUMBER
const side_chain_no = process.env.SIDECHAINNUMBER

let gasPriceMain = 0;
let gasPriceSide = 0;
let gasPrice = 0;
let autoBridgeProcess  = 1;
let txId = 0;

async function getTransactionautoflag(){
    await axios.get(process.env.GETTRANSACTIONPROCESSAPI)
    .then((res) => {
        autoBridgeProcess =  res.data.data.status;    
        return autoBridgeProcess;
    }).catch((err) => {
        console.error(err);
    });
}

async function getGasPrice(){
    await axios.get(process.env.MAINCHAINGASPRICEAPI)         
    .then((res) => {
        //console.log(`Status: ${res.status}`);
        gasPrice =  res.data.result;  
        //console.log("GAS Price main",gasPrice);
        gasPriceMain = gasPrice;
        //return gasPrice;    
    }).catch((err) => {
        console.error("gasprice error 1",err);
    }); 

    await axios.get(process.env.SIDECHAINGASPRICEAPI)         
    .then((res) => {
        //console.log(`Status: ${res.status}`);
        gasPrice =  res.data.result;  
        //console.log("GAS Price side",gasPrice);
        gasPriceSide = gasPrice;
        //return gasPrice;    
    }).catch((err) => {
        console.error("gasprice error 2",err);
    });  
    }

async function saveTransaction(details){ 
    
    await axios.post(process.env.SAVETRANSACTIONAPI, details)        
    .then((res) => {
        console.log(`Status: ${res.status}`);           
        let id = Object.values(res.data)        
        id = JSON.parse(id[1])
        txId = id.id 
    }).catch((err) => {
        console.error("Error in saving transaction to server",err);
         ;
    });
    
}


let lockRequest =
    async function lockrequest(data){        
            transactionDetails = {
            id:0,
            transaction_hash:data[1],
            wallet_address:data[0],
            amount:web3Main.utils.hexToNumberString(data[2].data),
            status:1,
            from_chain:main_chain_no,
            to_chain:side_chain_no,
            process_trans_status : autoBridgeProcess,
            from_trans_hash:0,
            to_trans_hash:0,
            from_gas_price:0,
            to_gas_price:0,
            remarks :"started"    
        };
        
    try {    
        await getTransactionautoflag();
        console.log("autoflag",autoBridgeProcess);
        await getGasPrice();         
        console.log("\nMain gas price",gasPriceMain);
        console.log("\nSide gas price",gasPriceSide);
    if (autoBridgeProcess==0){
        console.log("MANUAL TOKEN BRIDGE PROCESS INITIATED");
        console.log("transaction details sending to bridge server"); 
        await saveTransaction(transactionDetails);                
        }

    else if (autoBridgeProcess == 1){     
        console.log("\n\n               AUTO BRIDGE PROCESS STARTED\n");
        console.log("                   1. Bridge request recieved\n");
        console.log("\n                 FROM    : ",data[0]);
        console.log("\n                 TXHASH  : ",data[1]);
        console.log("\n                 AMOUNT  : ",data[2].data,"\n"); 

        console.log("\n\ntx details in Auto bridge process stage 1 \n",transactionDetails)        
        await saveTransaction(transactionDetails);
        let txid = txId
        const functionCall = MainBridge.methods.lockTokens(data[0],data[1],data[2].data).encodeABI();
        const gatewayNonce = await web3Main.eth.getTransactionCount(gateway_address);
        console.log("nonce 1:",gatewayNonce);
        console.log("gasPriceMain.FastGasPrice:",gasPriceMain.FastGasPrice);
        console.log("gas price side.Fast gas price:",gasPriceSide.FastGasPrice);
        const transactionBody = {
            to: MainBridge_address,
            nonce:gatewayNonce,
            data:functionCall,
            gas:40000,            
            gasPrice:web3Side.utils.toWei(gasPriceMain.FastGasPrice,"gwei")
        }
        
        signedTransaction = await web3Main.eth.accounts.signTransaction(transactionBody,SIGNER_PRIVATE_KEY);
        try {      
        fulfillTx = await web3Main.eth.sendSignedTransaction(signedTransaction.rawTransaction);        
        console.log("lock tokens tx status",fulfillTx.status)
        if (fulfillTx.status==true)
        {   
            console.log("\n\n               2. Tokens Locked in the main bridge",fulfillTx.transactionHash)
            transactionDetails.id=txid
            transactionDetails.from_trans_hash=fulfillTx.transactionHash; 
            transactionDetails.remarks = "2. Tokens Locked in the main bridge"
            console.log("\n\ntx details in lock stage\n",transactionDetails)
            saveTransaction(transactionDetails);
            processBridgeRequestBridge(data,transactionDetails);
        }
        }        
        catch(error){
            console.log("send tx error",error)
            transactionDetails.status=5;
            transactionDetails.remarks = error.message            
        }  
    }
}
catch(error){
    console.log("Lock request function error",error)
    
    }
}



async function processBridgeRequestBridge(data,transactionDetails) {    
    
    try
    {
    const functionCall = SideBridge.methods.bridgeTokens(data[0],data[2].data,data[1]).encodeABI();
    const gatewayNonce = await web3Side.eth.getTransactionCount(gateway_address);
    console.log("gasPriceSide.",gasPriceSide.FastGasPrice)
    const transactionBody = {
        to: SideBridge_address,
          nonce:gatewayNonce,
          data:functionCall,
          gas:400000,
          gasPrice:web3Side.utils.toWei ("10","gwei")
    }
    console.log("nonce side",transactionBody.nonce);    
    signedTransaction = await web3Side.eth.accounts.signTransaction(transactionBody,SIGNER_PRIVATE_KEY);
    transactionDetails.to_trans_hash= signedTransaction.transactionHash;
    console.log("\n\n               3. Minting tokens in the Side chain", "\n\n");
    console.log(" \n\n              4. Sending Tokens to the requester  ","\n\n");
}
catch (error){console.log("error in Bridge request function", error)
}
    try {
        console.log( signedTransaction  );
    fulfillTx = await web3Side.eth.sendSignedTransaction(signedTransaction.rawTransaction);
    console.log("fulfillTx: \n\n\n" + JSON.stringify(fulfillTx))    
    if (fulfillTx.status==true){
    console.log("\n\n\n\n\n\n             TOKENS BRIDGED SUUCESSFULLY \n\n\n\n\n\n\n\n");
    transactionDetails.status=3;
    transactionDetails.remarks = "Token send to the destination wallet";    
    }   

    }
    catch (error) {
        console.log("Error in Minting and sending from side chain",error)
        transactionDetails.remarks = "Error in Minting and sending from side chain";
        transactionDetails.status = 5;
    }

    console.log("transaction details saved:\n",transactionDetails);
    await saveTransaction(transactionDetails);
    return fulfillTx;
}

module.exports =  {   
    lockRequest
    }