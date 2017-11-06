Accounts.urls.resetPassword = (token) => {
    return Meteor.absoluteUrl('reset-password/' + token);
};

Accounts.urls.verifyEmail = (token) => {
    return Meteor.absoluteUrl('verify-email/' + token);
};

// Accounts.onCreateUser(function (options, user) {
//     if (!user.services.facebook) {
//         return user;
//     }
//     user.profile.name = user.services.facebook.name;
//     user.emails = [{
//       address: user.services.facebook.email,
//       verified : true
//     }];
//
//     return user;
// });

// Accounts.validateLoginAttempt(function (loginAttempt) {
//
//     if (!loginAttempt.allowed) {
//           throw new Meteor.Error(901,loginAttempt.error.reason);
//     } else {
//         if(loginAttempt.user.services && loginAttempt.user.services.facebook){
//           return true;
//         }
//
//         // In some cases this method isn't invoked with a correct user object...
//         if (!loginAttempt.user) {
//             throw new Meteor.Error(903, informationMessages.notValidUser);
//         }
//
//         if (!loginAttempt.user.emails[0].verified) {
//                 throw new Meteor.Error(902, informationMessages.emailVerifiedFirst);
//         }
//
//
//         // We have a correct login!
//         return true;
//     }
// });

ServiceConfiguration.configurations.remove({
    service: 'facebook'
});

ServiceConfiguration.configurations.insert({
    service: 'facebook',
    appId: '276668129445079',
    secret: 'b3b3cb89fe1aed697b0227b73668625a',
    // appId: '337832873240070',
    // secret: '314b1973782707425412cbff68768085'
});
