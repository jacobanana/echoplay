var AudioContextStarted = false;

$(document).ready(function(){
  if( isMobile() ) {
    StartAudioContext(Tone.context, $("body"), function(){});
    document.ontouchmove = function(event){
      event.preventDefault();
    }
  } else {
    document.querySelector('div').addEventListener('click', function() {
      if(Tone.context.state !== "running"){
        Tone.context.resume().then(() => {
          console.log('Playback resumed successfully');
        });  
      }
    });
  }
})
