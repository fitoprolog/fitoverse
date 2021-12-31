class Simulator extends Brain {

  constructor(signalingServerURI,worldName,worldURI,persistanceURI)
  {
    super(signalingServerURI,worldName,worldName,persistanceURI);
    window.engine = new BABYLON.NullEngine();
    window.scene = new BABYLON.Scene(engine);
    Ammo().then(()=> {
      scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0),new BABYLON.AmmoJSPlugin(false))
      get(`${worldURI}/init.js`,(data)=>{
        data.text().then( (initCode)=>{
          eval('('+initCode.replace('main','function')+')()')
        })
      },()=>{
        this.panic('there was an error trying to load init.js file')
      })
    });
  }

  sceneIsReady(){
    console.log("The scene is ready and  working in background, time to start signaling via websockets");
    engine.runRenderLoop(function () {
      scene.render();
    })
    this.startHandshake();
  }

  sendSceneToClient(uuid){
    let data = BABYLON.SceneSerializer.Serialize(scene)
    var strScene = JSON.stringify(data);
    let datum = {
      command : "signal",
      type    : "load-scene",
      uid     : uuid,
      payload : strScene,
      world   : this.worldName,
    }
    this.signalSocket.send(JSON.stringify(datum))
  }
  addNodeToClients(){
  }
  removeNodeFromClients(nodeName){
  }
  updateNodeFromClients(nodeName,incremental){
  }
}
