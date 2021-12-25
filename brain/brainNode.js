const brainKey = "fabolousmasterkeyxd";
const world = 'fitolando';
const pDelta=0.4;

var brain = new WebSocket("ws://127.0.0.1:8181");
brain.leStatus = "login";
window.playerNodesP2P = {}; 
var leCounter=0;

//---------------------headless game side---------------------
var engine = new BABYLON.NullEngine(); 
window.scene = new BABYLON.Scene(engine);

var harcoded = 
{
  mixMap : `worlds/${world}/mixMap.png`,
  diff1  : `worlds/${world}/a.jpg`,
  diff2  : `worlds/${world}/b.jpg`,
  diff3  : `worlds/${world}/c.jpg`,
  heightMap : `worlds/${world}/heightMap.png`,
}

var create_particles = function()
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

var create_scene = function(onready)
{
  var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
  var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 1, -1), scene);
  var camera = new BABYLON.ArcRotateCamera("playercam", 0, 0.8, 1, BABYLON.Vector3.Zero(), scene); 
  var terrainMaterial = new BABYLON.TerrainMaterial("terrainMaterial", scene);
  terrainMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
  terrainMaterial.specularPower = 64;

  terrainMaterial.mixTexture = new BABYLON.Texture(`worlds/${world}/mixMap.png`, scene);
  // Diffuse textures following the RGB values of the mix map
  // diffuseTexture1: Red
  // diffuseTexture2: Green
  // diffuseTexture3: Blue
  terrainMaterial.diffuseTexture1 = new BABYLON.Texture(`worlds/${world}/a.jpg`, scene);
  terrainMaterial.diffuseTexture2 = new BABYLON.Texture(`worlds/${world}/b.jpg`, scene);
  terrainMaterial.diffuseTexture3 = new BABYLON.Texture(`worlds/${world}/c.jpg`, scene);

  var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", 
    `worlds/${world}/heightMap.png`, 100, 100, 100, 0, 10, scene, false,()=>{
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, 
      BABYLON.PhysicsImpostor.MeshImpostor, { mass: 0});
      onready()
  });
  ground.position.y = 0;
  ground.material = terrainMaterial;
  engine.runRenderLoop(function () {
      scene.render();
  });

  create_particles();

  let broadCastPhysicalChanges = function()
  {
     scene.rootNodes.forEach((node)=>{
       if(node.name == "playercam" || !node.position || !node.rotationQuaternion) return;
       let pdata = {
         t : 'p',
         n : node.name,
         d : [node.position.x,node.position.y,node.position.z,
              node.rotationQuaternion.x, 
              node.rotationQuaternion.y,
              node.rotationQuaternion.z,
              node.rotationQuaternion.w]
       }
       pdata = JSON.stringify(pdata);
       for(let name in playerNodesP2P)
       {
         if ( playerNodesP2P[name].LeIsReady)
         {
           try{
            playerNodesP2P[name].send(pdata);
           }catch(e){
              console.log(`NODE ${name} FAILING`);
           }
         }
       }
       if (node.prim)
       {
         if (Math.abs(node.physicsImpostor.getLinearVelocity().y) <= 0.1)
           node.physicsImpostor.applyImpulse(new BABYLON.Vector3(0.0,0.8*Math.random(),0), 
                                   node.getAbsolutePosition())
       }
     });
  }
  setInterval(broadCastPhysicalChanges,1);
}

var populate_boxes = function()
{
  for (let o = 0; o != 30;o++)
  {
    
    let color = new BABYLON.Color4(Math.random(),Math.random(),Math.random(),1);
    let fcolors =[] 
    for (let f=0;f!=6;f++) fcolors.push(color);

    let trash = BABYLON.MeshBuilder.CreateBox(uuidv4(),
                {height: 0.8,width: 0.8, depth: 0.8 , faceColors:fcolors}, scene);
    trash.prim = true;
    trash.position.x = 50-100*Math.random();
    trash.position.z = 50-100*Math.random();
    trash.position.y = 10;
    trash.physicsImpostor=new BABYLON.PhysicsImpostor(trash, 
                          BABYLON.PhysicsImpostor.BoxImpostor,
                          {mass: 0.5, friction: 1, restitution: 0.3});

  }
}


var broadcast_node_to_players = function(a,exclude)
{
  if (typeof(a)=='string')
    a = scene.getElementByID(a)
  a = BABYLON.SceneSerializer.SerializeMesh(a);
  a = JSON.stringify(a);
  for (var name in playerNodesP2P)
  {
    if (name == exclude ) continue;
    playerNodesP2P[name].send(JSON.stringify({
      t : 'am',
      d : a,
    }));
  }
}

var remove_node_from_players = function(id)
{
  let node = scene.getNodeByID(id);
  if (node) node.dispose();
  for (var name in playerNodesP2P)
  {
    playerNodesP2P[name].send(JSON.stringify({
      t : 'dm',
      d : id 
    }));
  }
}

var add_player_to_scene = function(uid)
{
  let nplayer  = BABYLON.MeshBuilder.CreateBox(uid, {height: 1,width: 1, depth: 1}, scene);
  nplayer.position.y=10;
  nplayer.player = new BABYLON.PhysicsImpostor(nplayer, BABYLON.PhysicsImpostor.BoxImpostor,
                              {mass: 0.1, friction: 1, restitution: 0.3});
  return nplayer; 
}

//end---of---- headless----game----side

var brain_logic= function(data,p,uid)
{
  var string = new TextDecoder("utf-8").decode(data);
  console.log("WTF",string)
  data = JSON.parse(string)
  let box = scene.getNodeByName(p.name);
  
  if (data.t == "up")
  { 
    box.position.z =data.d[1]; 
    box.position.x =data.d[0];
  }

  if(data.t == 'kd')
  {
    if (data.d == "w")
    {
       let scale = data.s != undefined ? data.s : 1 
       box.position.z +=pDelta * Math.cos(data.a) * scale;
       box.position.x +=pDelta * Math.sin(data.a) * scale;
    }
    
    if (!box) return;
    if (data.d == " " &&  Math.abs(box.player.getLinearVelocity().y) <= 1)
      box.player.applyImpulse(new BABYLON.Vector3(0.0,1.0,0), box.getAbsolutePosition())
  }
}

var prepare_peer=function(uid)
{
  playerNodesP2P[uid]=new SimplePeer({
     initiator: true,
     trickle:false,
  });
  let p =playerNodesP2P[uid];
  p.name = uid; 
  p.on('error', err => {
     console.log('SOMETHING WENT WRONG  WITH PEER', err)
  })
  p.on('close', data=>{
    console.log(`BYE BYE ${p.name}`);
    delete playerNodesP2P[p.name];
    remove_node_from_players(p.name);
  });
  p.on('signal', data => {
     let sdata = {
       command : "signal",
       type    : "webrtc",
       payload : data,
       uid     : uid,
       world   : world,
     };
     brain.send(JSON.stringify(sdata));
  });
  p.on('connect', (conn) => {
    console.log('player ', uid , ' handshake was succesfull :D');
    console.log(conn) 
    var nplayer= add_player_to_scene(uid);
    let datas = BABYLON.SceneSerializer.Serialize(scene)
    var strScene = JSON.stringify(datas);
    datas = {
      command : "signal",
      type    : "load-scene",
      uid     : uid,
      payload : strScene,
      world   : world,
    }
    brain.send(JSON.stringify(datas));
    broadcast_node_to_players(nplayer,uid);
    p.LeIsReady = true;
  });
  p.on('data', function(data){brain_logic(data,p,uid);});
}

brain.onmessage = function(data)
{
  let pdata = JSON.parse(data.data);

  if (pdata.command == "signal" && brain.leStatus == "ready" && pdata.payload=="join")
  {
    prepare_peer(pdata.uid)
    return;
  }
  
  if (pdata.command == "signal" && brain.leStatus == "warming-up")
  {
    let ndata = data.data;
    ndata.payload = undefined;
    ndata.error   = "NOTREADY";
    ndata.world   = world;
    brain.send(JSON.stringify(ndata));
    return;
  }

  if (pdata.command == "signal" /*&& brain.leStatus == "ready"*/)
  {
     if (pdata.type ==  "webrtc")
     {
       let node = playerNodesP2P[pdata.uid];
       if (!node)
       {
         console.log("something went wrong node doesn't exists");
         brain.send(JSON.stringify({
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
       prepare_peer(pdata.uid);  
     }
     else 
     {
       
       let pnode = playerNodesP2P[pdata.uid];
       
       if (typeof(pnode)== 'undefined')
       {
          brain.send(JSON.stringify({
            uid     : pdata.uid,
            command : 'signal',
            payload : 'BIHJOINFIRST',
            world   : world,
          }));
          return;
       }
       
     }
  }

  if (brain.leStatus == "login" && pdata.msg != "ALLHAIL")
  {
    console.log("couldn't take the brain position");
    return;
  }
  if (brain.leStatus == "warming-up" && pdata.msg == "READY2ROCK")
  {
    brain.leStatus = "ready";
    console.log("the brain is ready, now player nodes can connect");
    return;
  }
  if (brain.leStatus == "login" && pdata.msg == "ALLHAIL")
  {
    brain.leStatus = "warming-up";
    initialize_brain(function(){

      Ammo().then(()=> {
        scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0),
                            new BABYLON.AmmoJSPlugin(false))
        create_scene(populate_boxes)
        brain.leStatus = "ready";
      });    
      brain.send(JSON.stringify({
        command : "signal",
        payload : "ready",
        world   : world,
      }));
    });
    console.log("I am the brain now");
    return;
  }
  console.warn("There is a not considered condition D:");
  console.log(pdata);
}

brain.onopen = function()
{
  brain.send(JSON.stringify({
    command : "login",
    uid     : "brain",
    pwd     : brainKey,
    world   : world,
  }));
}
