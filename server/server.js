import {
    Meteor
} from 'meteor/meteor';
import {
    WebApp
} from 'meteor/webapp';

import '/imports/api/methods/method'
import '/imports/api/methods/account'
import '/imports/api/methods/receipe'

import '/imports/api/methods/scrappers/www.foodnetwork.com'
import '/imports/api/methods/scrappers/www.food.com'
import '/imports/api/methods/scrappers/www.bettycrocker.com'
import '/imports/api/methods/scrappers/www.epicurious.com'
import '/imports/api/methods/scrappers/www.thekitchn.com'
import '/imports/api/methods/scrappers/www.tasteofhome.com'
import '/imports/api/methods/scrappers/www.simplyrecipes.com'
import '/imports/api/methods/scrappers/www.myrecipes.com'
import '/imports/api/methods/scrappers/www.eatingwell.com'

import '/imports/api/methods/scrappers/www.delish.com'
import '/imports/api/methods/scrappers/www.taste.com.au'
import '/imports/api/methods/scrappers/www.cookinglight.com'
import '/imports/api/methods/scrappers/www.jamieoliver.com'
import '/imports/api/methods/scrappers/www.foodandwine.com'
import '/imports/api/methods/scrappers/www.bonappetit.com'

import '/imports/api/publishers/common-pub'
import '/imports/api/publishers/receipe'


// Accounts package config //

Meteor.startup(() => {
    process.env["MAIL_URL"] = "smtp://kathiriyabm9111210@gmail.com:9shjnnd11@smtp.gmail.com:587/";
    if (Meteor.isCordova) {
        Meteor.defer(() => {
            Router.go('/');
        });
    }
    if (Meteor.settings && Meteor.settings.env && _.isObject(Meteor.settings.env)) {
        for (const variableName in Meteor.settings.env) {
            process.env[variableName] = Meteor.settings.env[variableName];
        }
    }
    WebApp.rawConnectHandlers.use(function(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    });

});