/**
 * angular-firebase-user-profiles
 * (c) 2016 Cliff Hall @ Futurescale, Inc
 *
 * Navigation Controller
 */
(function() {

    // Add the NavController to the module
    angular.module("angular-firebase-user-profiles")
        .controller(
            'NavController',
            [
                '$rootScope',
                NavController
            ]
        );

    // Constructor
    function NavController($rootScope)
    {
        var instance = this;
        instance.isSelected = isSelected;
        instance.selectPage = selectPage;

        // Select a page
        function selectPage(setPage) {
            $rootScope.nav.page = setPage;
        }

        // Check selected page
        function isSelected(checkPage) {
            return $rootScope.nav.page === checkPage;
        }
    }
})(); // IIFE keeps global scope clean
