var canvas = document.getElementById("renderCanvas");
window.engine = new BABYLON.Engine(canvas, true);
window.scene  = new BABYLON.Scene(engine);
var thumbstickComponent
var inspectionMode = false
var VRMode = false 
window.camera=undefined;
var map ={}
/*------------------------------Peripherals section -------------------------*/
scene.actionManager = new BABYLON.ActionManager(scene);

scene.actionManager.registerAction(
     new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
       
       map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        
       if (evt.sourceEvent.key == 'z' || evt.sourceEvent.key == 'Z')
          inspectionMode = true;

}));

scene.actionManager.registerAction(
   new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
    map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    
    if (evt.sourceEvent.key == 'z' || evt.sourceEvent.key == 'Z')
       inspectionMode = false;
    /*if (evt.sourceEvent.key==' ' && playerPeer.LeIsReady)
        playerPeer.send(JSON.stringify({t:'kd',d: ' '}));  */

}));

scene.registerAfterRender(function () {

  /*if (thumbstickComponent)
  {
    let scale = thumbstickComponent.axes.y
    let scaleTest = Math.abs(scale) >0.01
    if ((map["w"] || map["W"]) || scaleTest ) {
       
       if (!scaleTest) scale=1
       playerPeer.send(JSON.stringify({
                       t : 'kd', d : 'w', a:playerAngle,s: scale }));
       console.log(playerAngle)
    };
    
  }
  if (playerAngle > 2*Math.PI) playerAngle = 0;
  if (playerAngle < 0 ) playerAngle = 2*Math.PI;

  if (!inspectionMode) update_camera_position();*/
});

var controller_handler = function(controller){

  controller.onMotionControllerInitObservable.add((motionController) => {
    controller.onMeshLoadedObservable.add((mesh)=>{
      BABYLON.SceneLoader.ImportMesh(null, "assets/", motionController.handness + "_hand.glb"
        , scene,  (meshes, particleSystems, skeletons)=> {

          var leParent = motionController.rootMesh.parent;
          motionController.rootMesh.dispose()
          console.log(motionController.rootMesh.parent)
          meshes[0].parent=leParent
          meshes[0].isPickable = false;
          meshes[0].rotation = new BABYLON.Vector3(-Math.PI/2, 0, 0);
        });
    });
    if (motionController.handness === 'right') {
      const xr_ids = motionController.getComponentIds();
      thumbstickComponent = motionController.getComponent(xr_ids[2]);
      thumbstickComponent.onAxisValueChangedObservable.add((axes) => {
        console.log(axes);
      });
    }
  });
}

/*---------------------End of peripherals section *---------------------------*/


/*---------------------Rendering logic section *-------------------------------*/
var preload_ui_elements=function(){
  window.scene  = new BABYLON.Scene(engine);
  window.camera = new BABYLON.ArcRotateCamera("godcamera", 0, 0.8, 1, BABYLON.Vector3.Zero(), scene);
  scene.createDefaultXRExperienceAsync({
      inputOptions : {
        doNotLoadControllerMesh : true ,
      }
    }).then( (w)=>{
      window.fullwebxr = w;
      window.webXR = w.baseExperience;
      window.camera = webXR.camera;
      //w.input.onControllerAddedObservable.add(controller_handler);
      VRMode=true;
    });
}

var load_scene_from_data=function(data){
  preload_ui_elements();
  BABYLON.SceneLoader.Append("", "data:" + data, scene, function (scene) {
  });
}

engine.runRenderLoop(function () {
  if (!camera || !scene)
    return ;
  scene.render();
});

window.addEventListener("resize", function () {
  engine.resize();
});
var brain_commands_handler=function(data){
}
