var AudioContextStarted = false;

function isMobile(){
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

$(document).ready(function(){
  if( isMobile() ) {
    StartAudioContext(Tone.context, $("body"), function(){});
    document.ontouchmove = function(event){
      event.preventDefault();
    }
  }
})
