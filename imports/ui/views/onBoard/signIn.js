import { signIn } from './signIn.html';

Template.signIn.onCreated(function(){

});

Template.signIn.onRendered(function(){
});

Template.signIn.helpers({
  helper: function(){

  }
});

Template.signIn.events({
  "click #back": function(e, t){
    e.preventDefault();
    FlowRouter.go('/');
  },
  "submit #loginForm": function(e, t){
    e.stopPropagation();
    e.preventDefault();
    loginUser($('#email').val(),$('#pwd').val());
  },
  'click #facebookButton': function () {
      loginWithFacebook();
  },
});
