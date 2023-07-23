var AudioContextStarted = false;

$(document).ready(function(){
  if( isMobile() ) {
    StartAudioContext(Tone.context, $("body"), function(){});
    document.ontouchmove = function(event){
      event.preventDefault();
    }
  }
})
