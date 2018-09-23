/**
 * angular-firebase-user-profiles
 * (c) 2016 Cliff Hall @ Futurescale, Inc
 *
 * Profile Service
 */
(function() {

    // Add the ProfileService to the module
    angular.module('angular-firebase-user-profiles')
        .factory(
            'ProfileService',
            [
                '$rootScope',
                'BroadcastService',
                'EVENTS',
                'AUTH_PROVIDERS',
                'ACHIEVEMENTS',
                ProfileServiceFactory
            ]
        );

    // Factory Method
    function ProfileServiceFactory($rootScope,
                                   BroadcastService,
                                   EVENTS,
                                   AUTH_PROVIDERS,
                                   ACHIEVEMENTS)
    {
        let instance = {};
        instance.retrieve = retrieve;
        instance.create = create;
        instance.extract = extract;
        instance.update = update;
        instance.remove = remove;
        instance.addAchievement = addAchievement;
        return instance;

        // Retrieve the user's profile
        function retrieve() {
            // Get the user's uid
            let uid = $rootScope.account.authData.uid;

            // Get the profile
            $rootScope.db.users.child(uid).once('value', function (snapshot) {
                let profile = snapshot.val();
                BroadcastService.send(EVENTS.PROFILE_LOADED, profile);
            });
        }

        // Initialize a new user in the database
        function create(){
            // PREPARE
            let uid = $rootScope.account.authData.uid;
            let profile = instance.extract($rootScope.account.authData);

            // INITIALIZE
            $rootScope.db.users.child(uid).set(profile);
            $rootScope.account.profile = profile;
        }

        // Update the user profile in the database
        function update() {
            // PREPARE
            let uid = $rootScope.account.authData.uid;
            let profile = $rootScope.account.profile;

            // NEW USER ACTION
            if (profile.newUser) {
                instance.addAchievement(profile, ACHIEVEMENTS.PROFILE_COMPLETED);
                profile.newUser = false;
            }

            // UPDATE
            $rootScope.db.users.child(uid).update(profile);

            // NOTIFY
            BroadcastService.send(EVENTS.PROFILE_UPDATED, profile);
        }

        // Remove the user profile in the database
        function remove() {
            // REMOVE FROM DB
            let uid = $rootScope.account.authData.uid;
            $rootScope.db.users.child(uid).remove();
        }

        // Extract the initial user profile from the provider authData
        function extract(authData) {

            let name = {first: "", last: "", display: ""};
            let profile = {
                // The private bits
                uid: authData.uid,
                provider: authData.providerData[0].providerId,
                newUser: true,
                email: authData.email,
                // Publicly readable info
                expose: {
                    name: name,
                    bio: "",
                    image: "",
                    achievements: []
                }
            };

            let provider = authData.providerData[0];
            let fullName = provider.displayName;
            profile.expose.name.first = fullName.split(' ').slice(0, -1).join(' ') || "";
            profile.expose.name.last = fullName.split(' ').slice(-1).join(' ') || "";
            profile.expose.name.display = provider.displayName || "";
            profile.expose.image = provider.photoURL || null;

            return profile;
        }

        // Add an achievement to the user's profile
        function addAchievement( profile, achievement ) {
            if (!profile.expose.achievements) profile.expose.achievements = [];
            profile.expose.achievements.push( achievement );
        }
    }
})(); // IIFE keeps global scope clean
