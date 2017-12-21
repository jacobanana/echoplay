var AudioContextStarted = false;

$(document).ready(function(){
  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    StartAudioContext(Tone.context, $("body"), function(){});
    document.ontouchmove = function(event){
      event.preventDefault();
    }
  }
})
