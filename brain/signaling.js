class SignalingBrain {

  constructor(signalingServerURI,worldName){
    this.worldName = worldName
    this.signalingServerURI = signalingServerURI.replace("http","ws")
    this.Status="creating"
    this.allPeers={}
  }

  addPeer(uuid)
  {
    this.allPeers[uuid]=new SimplePeer({
      initiator: true,
      trickle:false,
    });
    let p = this.allPeers[uuid];
    p.name = uuid; 
    p.on('error', err => {
      console.log('SOMETHING WENT WRONG  WITH PEER', err)
    })
    p.on('close', data=>{
      console.log(`BYE BYE ${p.name}`);
      delete this.allPeers[p.name];
    });
    p.on('signal', data => {
      let sdata = {
        command : "signal",
        type    : "webrtc",
        payload : data,
        uid     : uuid,
        world   : worldName,
      };
      this.signalSocket.send(JSON.stringify(sdata));
    });
    p.on('connect', (conn) => {
      this.onAgentJoin(uuid,p)
      p.isReady = true;
    });
    p.on('data', (data)=>{
      this.onAgentCommand(uuid,data,p)
    });
  }
  
  startHandshake(){
    console.log(this.signalingServerURI)
    this.signalSocket = new WebSocket(this.signalingServerURI);
    let signalSocket = this.signalSocket
    signalSocket.onerror = console.log;

    signalSocket.onmessage =(data)=>
    {
      let pdata = JSON.parse(data.data);

      if (pdata.command == "signal")
      {
        console.log(pdata)
        if (this.Status == "warming-up")
        {
          let ndata = data.data;
          ndata.payload = undefined;
          ndata.error   = "NOTREADY";
          ndata.world   = world;
          signalSocket.send(JSON.stringify(ndata));
          return;
        }
        if (pdata.type ==  "webrtc")
        {
          let node = this.allPeers[pdata.uid];
          if (!node)
          {
            console.log("something went wrong node doesn't exists");
            signalSocket.send(JSON.stringify({
              command : "signal",
              type    : "custom",
              payload : "WHORU",
              world   : world,
            }));
          }
          else 
          {
            node.signal(pdata.payload);
          }
          return;
        }

        if (pdata.payload == "join")
        {
          this.addPeer(pdata.uid);  
          console.log("adding" + pdata.uid)
        }
        else 
        {
          let pnode = this.allPeers[pdata.uid];
          if (typeof(pnode)== 'undefined')
          {
            signalSocket.send(JSON.stringify({
              uid     : pdata.uid,
              command : 'signal',
              payload : 'BIHJOINFIRST',
              world   : world,
            }));
            return;
          }
        }
      }

      if (this.Status == "login" && pdata.msg != "ALLHAIL")
      {
        console.log("couldn't take the brain position");
        return;
      }
      if (this.Status == "warming-up" && pdata.msg == "READY2ROCK")
      {
        this.Status = "ready";
        console.log("the brain is ready, now player nodes can connect");
        return;
      }
      if (this.Status == "login" && pdata.msg == "ALLHAIL")
      {
        this.Status = "warming-up";
        signalSocket.send(JSON.stringify({command:"signal",payload:"ready"}))
        console.log("I am the brain now");
        return;
      }
      console.warn("There is a not considered condition D:");
      console.log(pdata);
    }
    signalSocket.onopen = ()=>
    {
      this.Status="login"
      signalSocket.send(JSON.stringify({
        command : "login",
        uid     : "brain",
        pwd     : this.brainKey,
        world   : this.worldName,
      }));
    }
  }

  panic(msg){
    this.Status="fatal"
    throw msg
  }
  error(msg){
  }
  warn(msg)
  {
  }

  addNodeToClients(){
  }
  removeNodeFromClients(nodeName){
  }
  updateNodeFromClients(nodeName,incremental){
  }

  sendSceneToClient(uuid){
    let data = BABYLON.SceneSerializer.Serialize(scene)
    var strScene = JSON.stringify(data);
    data = {
      command : "signal",
      type    : "load-scene",
      uid     : uuid,
      payload : strScene,
      world   : worldName,
    }
    this.signalSocket.send(JSON.stringify(data))
  }

  /*Overridable "User" layer functions*/
  onAgentJoin(uuid,peer){
  }

  onAgentLeave(){
  }

  onAgentCommand(uuid,data,peer){
  }
}
