/**
 * angular-firebase-user-profiles
 * (c) 2016 Cliff Hall @ Futurescale, Inc
 *
 *  Create the Angular module for the application and declare its dependencies
 */
(function() {

    angular.module("angular-firebase-user-profiles",
        [
            'ngRoute',
            'ngSanitize',
            'ngMessages'
        ]);

})(); // IIFE keeps global scope clean
