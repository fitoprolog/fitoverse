class SignalingBrain {

  constructor(signalingServerURI,worldName){
    this.worldName = worldName
    this.signalingServerURI = signalingServerURI.replace("http","ws")
    this.Status="creating"
    this.allPeers={}
  }

  addPeer(uuid)
  {
    new Peer(uuid,worldName,this);
  }
  
  startHandshake(){

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
          console.log("adding " + pdata.uid)
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
  
  //overridable
  onAgentJoin(peer){
  }

  onAgentLeave(){
  }

  onAgentData(data,peer){
  }
}
