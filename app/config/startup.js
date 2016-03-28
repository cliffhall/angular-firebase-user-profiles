/**
 * angular-firebase-user-profiles
 * (c) 2016 Cliff Hall @ Futurescale, Inc
 *
 * Startup - Define constants and initialize $rootScope
 */
(function() {

    // Add the constants to the module and initialize it
    angular.module("angular-firebase-user-profiles")
        .constant('PAGES', {
            PREFIX:     'app/views',
            POSTFIX:    '.html',
            HOME:       '/home',
            ACCOUNT:    '/account',
        })
        .constant('EVENTS', {
            PROFILE_LOADED: 'profile-loaded',
            PROFILE_UPDATED: 'profile-updated',
            PROFILE_CHANGED: 'profile-changed',
            PROFILE_REMOVED: 'profile-removed'
        })
        .constant('AUTH_PROVIDERS',{
            PASSWORD: 'password',
            GOOGLE: 'google',
            GITHUB: 'github',
            FACEBOOK: 'facebook',
            TWITTER: 'twitter'
        })
        .constant('USER_FORMS', {
            SIGN_IN: 'sign-in',
            SIGN_UP: 'sign-up',
            SIGN_OUT: 'sign-out',
            FORGOT_PASS: 'forgot-password',
            CHANGE_PASS: 'change-password',
            DELETE_USER: 'delete-user',
            PROFILE: 'profile'
        })
        .constant('DB_NODES', {
            BASE: 'https://ng-user-profiles.firebaseio.com/',
            USERS: 'users'
        })
        .constant('ACHIEVEMENTS', {
            PROFILE_COMPLETED: 'Profile Completed'
        })
        .run([
            '$rootScope',
            '$location',
            'PAGES',
            'USER_FORMS',
            'AUTH_PROVIDERS',
            'DB_NODES',
            initialize
        ]);

    // Scope initialization
    function initialize($rootScope,
                        $location,
                        PAGES,
                        USER_FORMS,
                        AUTH_PROVIDERS,
                        DB_NODES) {

        // Database-related scope initialization
        var db = {};
        db.base = new Firebase( DB_NODES.BASE );
        db.users = db.base.child( DB_NODES.USERS );
        $rootScope.db = db;

        // Nav-related scope initialization
        var nav = {};
        nav.PAGES = PAGES;
        nav.page = $location.$$path || PAGES.HOME;
        $rootScope.nav = nav;

        // Account-related scope initialization
        var account = {};
        account.profile = null;
        account.editing = false;
        account.confirmDelete = false;
        account.authData = db.base.getAuth();
        account.USER_FORMS = USER_FORMS;
        account.AUTH_PROVIDERS = AUTH_PROVIDERS;
        account.emailInput = null;
        account.passwordInput = null;
        account.passwordConfirmInput = null;
        account.newPasswordInput = null;
        account.message = null;
        account.errorState = false;
        account.selectedUserForm = (account.authData)
            ? USER_FORMS.PROFILE
            : USER_FORMS.SIGN_IN;
        $rootScope.account = account;

    }

})(); // IIFE keeps global scope clean