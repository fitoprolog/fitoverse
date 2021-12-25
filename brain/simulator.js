class Simulator extends Brain {

  constructor(signalingServerURI,worldName,worldURI,persistanceURI)
  {
    super(signalingServerURI,worldName,worldName,persistanceURI);
    window.engine = new BABYLON.NullEngine();
    window.scene = new BABYLON.Scene(engine);
    Ammo().then(()=> {
      scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0),
        new BABYLON.AmmoJSPlugin(false))
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
    console.log("The scene and working in background, time to start signaling via websockets")
    engine.runRenderLoop(function () {
      scene.render();
    })
    this.startHandshake();
  }

}
