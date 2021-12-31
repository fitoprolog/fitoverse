main()
{
  /*your logic here call CurrentSimulator.sceneIsReady() on Finish*/
  include('game.js',()=>{
    build_game(()=>{
      CurrentSimulator.sceneIsReady()
      CurrentSimulator.onAgentJoin=(peer)=>{
        console.log(peer)
        console.log("All the boilerplaye seems to be ready :D "+ peer.uuid+ ' Entered the room') 
        CurrentSimulator.sendSceneToClient(peer.uuid)
      }
    })
  })
}
