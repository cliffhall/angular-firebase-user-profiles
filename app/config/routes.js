/**
 * angular-firebase-user-profiles
 * (c) 2016 Cliff Hall @ Futurescale, Inc
 *
 * Route Handler
 */
(function() {

    // Add the RouteHandler configuration to the module
    angular.module("angular-firebase-user-profiles")
        .config([
            '$routeProvider',
            'PAGES',
            RouteHandler
        ]);

    function RouteHandler($routeProvider, PAGES)
    {
        // Construct and initialize the instance
        var instance = this;
        instance.build = build;
        instance.initialize = initialize;
        instance.initialize();

        // Create the relative URL for the page from the route
        function build(page){
            return PAGES.PREFIX + page + PAGES.POSTFIX;
        }

        // Initialize the routes
        function initialize() {
            $routeProvider.when( PAGES.HOME,{
                templateUrl: instance.build(PAGES.HOME)
            })
            .when(PAGES.ACCOUNT,{
                templateUrl: instance.build(PAGES.ACCOUNT)
            })
            .when('/',{
                templateUrl: instance.build(PAGES.HOME)
            })
            .otherwise( { redirectTo: '/'} );
        }
    }

})(); // IIFE keeps global scope clean