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
            GOOGLE: 'google.com',
            GITHUB: 'github.com',
            FACEBOOK: 'facebook.com',
            TWITTER: 'twitter.com'
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
            USERS: 'users'
        })
        .constant('ACHIEVEMENTS', {
            PROFILE_COMPLETED: 'Profile Completed'
        })
        .constant('FIREBASE_CONFIG', {
                apiKey: "AIzaSyAYfP7q0CSlu3swEMGDmueGDmS17jinSMQ",
                authDomain: "ng-user-profiles.firebaseapp.com",
                databaseURL: "https://ng-user-profiles.firebaseio.com",
                projectId: "ng-user-profiles",
                storageBucket: "ng-user-profiles.appspot.com",
                messagingSenderId: "635929619423"
        })
        .run([
            '$rootScope',
            '$location',
            'PAGES',
            'USER_FORMS',
            'AUTH_PROVIDERS',
            'FIREBASE_CONFIG',
            'DB_NODES',
            initialize
        ]);

    // Scope initialization
    function initialize($rootScope,
                        $location,
                        PAGES,
                        USER_FORMS,
                        AUTH_PROVIDERS,
                        FIREBASE_CONFIG,
                        DB_NODES) {

        // Initialize app
        firebase.initializeApp(FIREBASE_CONFIG);

        // Database-related scope initialization
        let db = {};
        db.users = firebase.database().ref( DB_NODES.USERS );
        $rootScope.db = db;

        // Nav-related scope initialization
        let nav = {};
        nav.PAGES = PAGES;
        nav.page = $location.$$path || PAGES.HOME;
        $rootScope.nav = nav;

        // Account-related scope initialization
        let account = {};
        account.profile = null;
        account.editing = false;
        account.confirmDelete = false;
        account.authData = null;
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