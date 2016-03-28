/**
 * angular-firebase-user-profiles
 * (c) 2016 Cliff Hall @ Futurescale, Inc
 *
 * Message Broadcast Service
 */
(function() {

    // Add the BroadcastService to the module
    angular.module('angular-firebase-user-profiles')
        .factory(
            'BroadcastService',
            [
                '$rootScope',
                BroadcastServiceFactory
            ]
        );

    // Factory Method
    function BroadcastServiceFactory($rootScope)
    {
        var service = {};
        service.send = send;
        return service;

        function send(event, data){
            $rootScope.$broadcast(event, data);
        }
    }
})(); // IIFE keeps global scope clean
