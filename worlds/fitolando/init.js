main()
{
  /*your logic here call CurrentSimulator.sceneIsReady() on Finish*/
  include('game.js',()=>{
    build_game(()=>{
      CurrentSimulator.sceneIsReady()
      CurrentSimulator.onAgentJoin=(uuid,peer)=>{
        console.log("All the boilerplaye seems to be ready :D "+ uuid+ ' Entered the room') 
        CurrentSimulator.sendSceneToClient(uuid)
      }
    })
  })
}
