import { menu } from './menu.html';

Template.menu.onCreated(function(){

});

Template.menu.onRendered(function(){

});

Template.menu.helpers({

});

Template.menu.events({
  'click #back' (e, t) {
    e.preventDefault();
    FlowRouter.go('home');
  },
  "click .btn_logout"(e,t){
    e.preventDefault();

    Meteor.logout(function(){
      FlowRouter.go("signIn");
    });
  },
});
