import { appLayout }from './appLayout.html';

Template.appLayout.onCreated(function(){

});

Template.appLayout.onRendered(function(){
  let height = $( window ).height();
  let width = $( window ).width();
  var isiDevice = /ipad|iphone|ipod/i.test(navigator.userAgent.toLowerCase());
  var isAndroid = /android/i.test(navigator.userAgent.toLowerCase());
  var isWindowsPhone = /windows phone/i.test(navigator.userAgent.toLowerCase());
  if (isiDevice || isAndroid || isWindowsPhone){
    $('body').css({
     'width' : width+'px',
     'height' : height+'px'
   });
  }
  else{
    $('body').addClass('web');
  }


});

Template.appLayout.helpers({
  helper: function(){

  }
});

Template.appLayout.events({
  "event": function(e, t){

  }
});
