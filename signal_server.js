const WebSocket = require('ws');
const uuid  = require('uuidv4')
const master_key='fabolousmasterkeyxd'
const wss = new WebSocket.Server({ port: 8181 });
const dummy_credentials = {
}
const ALLOW_ANONYMOUS = true;

var brainNodes={
}

setInterval(()=>{
  for(let v in brainNodes){
    let n = brainNodes[v];
    if (n.readyState !== WebSocket.OPEN)
      delete brainNodes[v]
  }
},1000)

wss.on('connection', function connection(ws) {
   
  ws.on('close', function(ws){
     if (ws.uid == 'brain')
     {
        wss.clients.forEach((client)=>{
         
          if (client.readyState === WebSocket.OPEN && ws.world == client.world){
            client.send('{"msg": "BRAINLET"}');
            client.close();
          }
        });
        delete brainNodes[ws.world]; 
     }
     else  
     {
       if (!brainNodes[ws.world]) return;
       brainNodes[ws.world].send(JSON.stringify({
         msg: "GOINGDOWN",
         uid: ws.uid,
       }));
     }
  })

  ws.on('message', function incoming(data) {

     var pdata={};
         
     try
     {
       pdata = JSON.parse(data);
     }
     catch(e)
     {
       console.log('Invalid json '  + data);
       return;
     }
     console.log(pdata)
     
     /*
      * Start of Session manager section 
      *
      **/
     if (typeof(ws.uid) == 'undefined')
     {
       if (pdata.command != 'login')
       {
         ws.send('{ "msg" : "LOGBITCH"}')
         return 
       }

       if ( typeof(pdata.uid) == 'undefined')
       {
         ws.send('{ "msg" : "UIDBITCH"}');
         return;
       }
       if (typeof(pdata.world) == 'undefined')
       {
         ws.send('{ "msg" : "WYGOINGNG"}');
         return;
       }

       if (pdata.uid == 'brain')
       {
         if (brainNodes[pdata.world])
         {
           ws.send('{ "msg" : "HASKINGBYE"}');
           ws.close()
           return;
         }
         ws.send('{ "msg" : "ALLHAIL"}');
         ws.world = pdata.world; 
         brainNodes[pdata.world] = ws;
         ws.uid = pdata.uid;
         return;
       }
       else
       {
         if (!brainNodes[pdata.world] || !brainNodes[pdata.world].ready)
         {
           ws.send('{ "msg" : "BRAINLETMODE"}');
           ws.close();
           return;
         }
         wss.clients.forEach((client)=>{
           if (client.readyState === WebSocket.OPEN) 
           {
             if (client.uid == pdata.uid && pdata.world == client.world) 
             {
               brainNodes[pdata.world].send(JSON.stringify({
                 msg  : "BYE",
                 uuid : client.uid,
               }));
             }
           }
         });
       }
       ws.uid = pdata.uid;
       ws.world = pdata.world;
       ws.send('{ "msg" : "WELCOME"}');
       return; 
     }//--End of session manager section 

     if (pdata.command == "signal")
     {
       if (pdata.payload == "ready" && ws == brainNodes[ws.world])
       {
         brainNodes[ws.world].ready = true;
         brainNodes[ws.world].send('{"msg":"READY2ROCK"}');
         return;
       }
       //communication from brainNode to clients 
       if (ws == brainNodes[ws.world])
       {
         if (!pdata.uid) 
         {
           brainNode[ws.world].send('{"msg" : "WHO???"}');
           return;
         }
         wss.clients.forEach((client)=>{
            if (client.readyState === WebSocket.OPEN)
            {
              if (client.uid == pdata.uid && client.world == ws.world)
              {
                client.send(data);
                return;
              }
            }
         });
         return; 
       }
       pdata.uid = ws.uid; 
       brainNodes[ws.world].send(JSON.stringify(pdata))
       return;
     }
     ws.send('{"msg" : "ENGRUSHMF"}');
  });
});
console.log('signal server up and running')
