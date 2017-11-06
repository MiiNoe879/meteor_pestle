import {
    user
} from '/imports/api/collections/user';


Meteor.publish('currentUser', function(){
    return user.find({
        "_id": this.userId
    });
});
