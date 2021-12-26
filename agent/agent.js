class Agent{
  constructor(world,signalServerURI,username){
    this.Status="starting"
    this.world = world; 
    this.signalServerURI = "ws://"+signalServerURI;
    this.username = username;
  }
  onError(){
  }
  onSimulatorCommand(payload){
  }
  onSimulatorDie(){
  }
  onSimulatorSynchronized(){
  }
  startTheMagic(){
    this.signalSocket = new WebSocket(this.signalServerURI);
    let signalSocket = this.signalSocket;
    signalSocket.onmessage=(data)=>{
      let pdata;
      if ( typeof(data.data) !== "string" ) 
      {
        data.data.text().then((tdata)=>signalSocket.onmessage({data:tdata}));
        return;
      }
      else 
        pdata = JSON.parse(data.data)

      if (pdata.command == "signal" && pdata.type =="load-scene")
      {
        load_scene_from_data(pdata.payload)
        return;
      }

      if (pdata.command == "signal" && pdata.type == "webrtc")
      {
        this.peer.signal(pdata.payload);
        return;
      }

      if (signalSocket.leStatus == "login" && pdata.msg == "WELCOME")
      {
        signalSocket.leStatus = "sync";
        this.peer = new SimplePeer();
        let peer = this.peer
        peer.on('signal', data => {
          signalSocket.send(JSON.stringify({
            command : "signal",
            payload : data, 
            type    : "webrtc",
            world   :  this.world,
          }));
        });

        peer.on('error', error=>{
          console.log('P2P FAIL SHIT', error);
        });

        peer.on('connect', (conn) => {
          console.log("The handshake with the brain was successfull :D");
          signalSocket.leStatus= "ready"
          peer.send(JSON.stringify({
            command : "ping",
            world   : this.world, 
          }));
          peer.LeIsReady = true;

        })
        peer.on('data',(data)=>{
          var string = new TextDecoder("utf-8").decode(data);
          data = JSON.parse(string);
          try{
            brain_commands_handler(data)
          }catch(e){
            onError();
          }
        })
        signalSocket.send(JSON.stringify({
          command : "signal",
          payload : "join",
          world   : this.world,
        }));
        return;
      }
      console.log("There is a not considered condition D:");
      console.log(pdata)
    }
    signalSocket.onopen=()=>{
      signalSocket.leStatus = "login"
      signalSocket.send(JSON.stringify({
        command : 'login',
        uid     : this.username,
        world   : this.world,
      }));
    }
  }
}
