create_particles=function()
{
  var particleSystem = new BABYLON.ParticleSystem("wtf", 2000, scene);
  //Texture of each particle
  particleSystem.particleTexture = new BABYLON.Texture("/textures/flare.png", scene);
  // Where the particles come from
  particleSystem.emitter = BABYLON.Vector3.Zero(); // the starting location
  // Colors of all particles
  particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
  particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
  particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
  // Size of each particle (random between...
  particleSystem.minSize = 0.1;
  particleSystem.maxSize = 0.5;
  // Life time of each particle (random between...
  particleSystem.minLifeTime = 0.3;
  particleSystem.maxLifeTime = 1.5;
  // Emission rate
  particleSystem.emitRate = 1000;
  /******* Emission Space ********/
  particleSystem.createPointEmitter(new BABYLON.Vector3(-7, 8, 3), new BABYLON.Vector3(7, 8, -3));
  // Speed
  particleSystem.minEmitPower = 1;
  particleSystem.maxEmitPower = 3;
  particleSystem.updateSpeed = 0.005;
  // Start the particle system
  particleSystem.start();
  particleSystem.thiswerks= true;
  let p=0;
  /*setInterval(function(){
       particleSystem.position.x = 3*Math.sin(p);
       particleSystem.position.z= 3*Math.cos(p);
       p+=0.1;

    },0.33);*/
}
build_game=function(onready){
  console.log(scene)
  var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
  var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 1, -1), scene);
  var camera = new BABYLON.ArcRotateCamera("godcamera", 0, 0.8, 1, BABYLON.Vector3.Zero(), scene); 
  var terrainMaterial = new BABYLON.TerrainMaterial("terrainMaterial", scene);
  terrainMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
  terrainMaterial.specularPower = 64;

  terrainMaterial.mixTexture = new BABYLON.Texture(incpath('mixMap.png'), scene);
  // Diffuse textures following the RGB values of the mix map
  // diffuseTexture1: Red
  // diffuseTexture2: Green
  // diffuseTexture3: Blue
  terrainMaterial.diffuseTexture1 = new BABYLON.Texture(incpath('a.jpg'), scene);
  terrainMaterial.diffuseTexture2 = new BABYLON.Texture(incpath('b.jpg'), scene);
  terrainMaterial.diffuseTexture3 = new BABYLON.Texture(incpath('c.jpg'), scene);

  var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", 
    incpath('heightMap.png'), 100, 100, 100, 0, 10, scene, false,()=>{
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, 
      BABYLON.PhysicsImpostor.MeshImpostor, { mass: 0});
      onready()
  });
  ground.position.y = 0;
  ground.material = terrainMaterial;
  create_particles();
}
