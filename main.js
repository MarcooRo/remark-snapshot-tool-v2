const http = require('http');
const fs = require('fs');
var axios = require('axios');
//const url = require('url');
//const util = require('util');
const alasql = require('alasql');
const querystring = require('querystring');
const { exec } = require('child_process');
const shell = require('shelljs');
const port = 3000;
const { ApiPromise } = require('@polkadot/api');
const WsProvider = require('@polkadot/api');


function requestDb(req, body, res) {
    console.log('Start function request');
    let userInput = body.nftId;
    let userInputBlock = body.blockLimit;
    let userRmrkV = body.rmrkV;

    //var rmrk1 = exec("https://cloudflare-ipfs.com`dig precon-lite.rmrk.link TXT | grep ipfs | cut -f 2 -d '"' | cut -f 2 -d '='`");
    //var rmrk2 = exec("https://cloudflare-ipfs.com`dig precon-rmrk2.rmrk.link TXT | grep ipfs | cut -f 2 -d '"+"' | cut -f 2 -d '='`");

    var a = 'echo "https://cloudflare-ipfs.com`';
    var b1 = "dig precon-lite.rmrk.link TXT | grep ipfs | cut -f 2 -d '";
    var b2 = "dig precon-rmrk2.rmrk.link TXT | grep ipfs | cut -f 2 -d '";
    var c = '"';
    var d = "' | cut -f 2 -d '='`";
    var e = '"';
    var str1 = a + b1 + c + d + e;
    var str2 = a + b2 + c + d + e;

    if(userRmrkV == 'rmrk1'){
        console.log('remark 1');
        var rmrk1 = shell.exec(
            str1,
            { async: false },
        );
        var url = rmrk1.stdout;
    }

    if(userRmrkV == 'rmrk2'){
        console.log('remark 2');
        var rmrk2 = shell.exec(
            str2,
            { async: false },
        );
        var url = rmrk2;
    }

    axios.get(url)
    .then(async response => {
        console.log('Download dump');
        let jsonObj = JSON.parse(JSON.stringify(response.data));
        if (typeof userInput != undefined && userInput != "") {
            await saveFile(userInputBlock, userInput, jsonObj);
            fs.readFile(`Remark-snapshot-wallet_${userInput}.xlsx`, function(err, content) {
                if (err) {
                    res.writeHead(400, { 'Content-type': 'text/html' })
                    console.log(err);
                    res.end("Something wrong, no such file was generated");
                } else {
                    res.setHeader('Content-disposition', 'attachment; filename=' + `Remark-snapshot-wallet_${userInput}.xlsx`);
                    res.end(content);
                }
            });
        }

    })
    .catch(err => {
        console.log(err)
    });
}

const server = http.createServer(function(req, res) {
    let body = [];
    req.on('data', chunk => {
        body += chunk.toString();
        console.log(body);
    });
    if (req.method.toLocaleLowerCase() == 'post') {
        req.on('end', () => {
            body = querystring.parse(body);
            requestDb(req, body, res)
        });
    } else {
        res.writeHead(200, { 'ContentType': 'text/html' })
        fs.readFile('index.html', function(error, data) {
            if (error) {
                res.writeHead(404);
                res.write("error");
            } else {
                res.write(data)
            }
            res.end()
        })
    }
})

server.listen(port, function(error) {
    if (error) {
        console.log(error);
    }
})


async function saveFile(userInputBlock, collectionId, jsonObj) {
    console.log('start file');
    if(userInputBlock != ''){
        // cerca il blocco di stop
        console.log('strat ciclo with block');
        const provider = new WsProvider.WsProvider('wss://kusama-rpc.polkadot.io/');
        const api = await ApiPromise.create({ provider });
        var sheet_1_data = [{ NFT_ID: 0, OWNER_ID: 0, BLOCK: 0, DATA: 0 }];
        for (var i in jsonObj.nfts){
            if (i.includes(collectionId)){
                // ciclare changes
                console.log('-----------------------');
                console.log(i);

                var owner = 'No owner';
                var block = userInputBlock;
                var updatedAtBlock = jsonObj.nfts[`${i}`].updatedAtBlock;
                var ownerLast = jsonObj.nfts[`${i}`].owner;
                var genesisBlock = jsonObj.nfts[`${i}`].block;

                if(genesisBlock > userInputBlock){
                    var block = userInputBlock;
                    var owner = 'no mint at this time';
                    break;
                } else if(updatedAtBlock <= userInputBlock){
                    var block = updatedAtBlock;
                    var owner = ownerLast;
                    break;
                }else{
                    for ( var index = 0, len = jsonObj.nfts[`${i}`].changes.length; index < len; index++ ){
                        
                        var field = jsonObj.nfts[`${i}`].changes[index].field;
                        var blockCheck = jsonObj.nfts[`${i}`].changes[index].block;
                        var coller = jsonObj.nfts[`${i}`].changes[index].caller;
                        var opType = jsonObj.nfts[`${i}`].changes[index].opType;
                            
                        if(field == 'owner' && blockCheck <= userInputBlock){
                            // questo cambio è avvenuto prima del check?
                            var block = blockCheck
                            var owner = jsonObj.nfts[`${i}`].changes[index].new // new owner 
                        } else {
                            if(opType == 'DELIST'){
                                var block = userInputBlock
                                var owner = coller
                            }
                        }

                    } // end ciclo chagnes
                }

                console.log('block', block)
                console.log('owner', owner)

                const blockHash = await api.rpc.chain.getBlockHash(block);
                const signedBlock = await api.rpc.chain.getBlock(blockHash);
                var date = signedBlock.block.extrinsics[0].args[0].toString();
                var d = new Date(Math.floor(date)); // The 0 there is the key, which sets the date to the epoch
                sheet_1_data.push({ NFT_ID: i, OWNER_ID: owner, BLOCK: block, DATA: d.toLocaleString() });

            }// end if include 
        }// end for jsonObj
        var opts = [{ sheetid: 'NFT_ID', header: true }, { sheetid: 'OWNER_ID', header: false }, { sheetid: 'PRICE', header: false }, { sheetid: 'BLOCK', header: false }, { sheetid: 'DATA', header: false }];
        var result = alasql(`SELECT * INTO XLSX("Remark-snapshot-wallet_${collectionId}.xlsx",?) FROM ?`, [opts, [sheet_1_data]]);    
    }// end if userInputBlock != ''

    if(userInputBlock == ''){
        var sheet_1_data = [{ NFT_ID: 0, OWNER_ID: 0 }];
        for (var i in jsonObj.nfts){
            if (i.includes(collectionId)){
                console.log(i);
                sheet_1_data.push({ NFT_ID: i, OWNER_ID: jsonObj.nfts[`${i}`].owner });
            }
        }
        var opts = [{ sheetid: 'NFT_ID', header: true }, { sheetid: 'OWNER_ID', header: false }];
        var result = alasql(`SELECT * INTO XLSX("Remark-snapshot-wallet_${collectionId}.xlsx",?) FROM ?`, [opts, [sheet_1_data]]);
    }
    //exec("rm -rf *.xlsx");
}
