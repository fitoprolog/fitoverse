class Peer {
  constructor(uuid,worldName,signaler){
    this.peer=new SimplePeer({
      initiator: true,
      trickle:false,
    });
    let peer = this.peer;
    signaler.allPeers[uuid] = this.peer;
    console.log(signaler.allPeers)
    peer.uuid = uuid; 
    peer.on('error', err => {
      console.log('SOMETHING WENT WRONG  WITH PEER', err)
    })
    peer.on('close', data=>{
      console.log(`BYE BYE ${peer.name}`);
      delete signaler.allPeers[peer.name];
    });
    peer.on('signal', data => {
      let sdata = {
        command : "signal",
        type    : "webrtc",
        payload : data,
        uid     : uuid,
        world   : worldName,
      };
      console.log("aja");
      signaler.signalSocket.send(JSON.stringify(sdata));
    });
    peer.on('connect', (conn) => {
      signaler.onAgentJoin(peer)
      peer.isReady = true;
    });
    peer.on('data', (data)=>{
      signaler.onAgentData(data,peer)
    });
  }
}
