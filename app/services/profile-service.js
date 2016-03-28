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
        var instance = {};
        instance.retrieve = retrieve;
        instance.create = create;
        instance.extract = extract;
        instance.update = update;
        instance.remove = remove;
        instance.fromPassword = fromPassword;
        instance.fromFacebook = fromFacebook;
        instance.fromGoogle = fromGoogle;
        instance.fromTwitter = fromTwitter;
        instance.fromGithub = fromGithub;
        instance.addAchievement = addAchievement;
        return instance;

        // Retrieve the user's profile
        function retrieve() {
            // Get the user's uid
            var uid = $rootScope.account.authData.uid;

            // Get the profile
            $rootScope.db.users.child(uid).once('value', function (snapshot) {
                var profile = snapshot.val();
                BroadcastService.send(EVENTS.PROFILE_LOADED, profile);
            });
        }

        // Initialize a new user in the database
        function create(){
            // PREPARE
            var uid = $rootScope.account.authData.uid;
            var profile = instance.extract($rootScope.account.authData);

            // INITIALIZE
            $rootScope.db.users.child(uid).set(profile);
            $rootScope.account.profile = profile;
        }

        // Update the user profile in the database
        function update() {
            // PREPARE
            var uid = $rootScope.account.authData.uid;
            var profile = $rootScope.account.profile;

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
            var uid = $rootScope.account.authData.uid;
            $rootScope.db.users.child(uid).remove();
        }

        // Extract the initial user profile from the provider authData
        function extract(authData){

            var name = {first:"", last:"", display:""};
            var profile = {
                uid: authData.uid,
                provider: authData.provider,
                newUser: true,
                email: "",
                name: name,
                bio: "",
                image: "",
                achievements:[]
            };

            switch (authData.provider) {
                case AUTH_PROVIDERS.PASSWORD:
                    return instance.fromPassword(authData, profile);
                    break;

                case AUTH_PROVIDERS.FACEBOOK:
                    return instance.fromFacebook(authData, profile);
                    break;

                case AUTH_PROVIDERS.GOOGLE:
                    return instance.fromGoogle(authData, profile);
                    break;

                case AUTH_PROVIDERS.TWITTER:
                    return instance.fromTwitter(authData, profile);
                    break;

                case AUTH_PROVIDERS.GITHUB:
                    return instance.fromGithub(authData, profile);
                    break;
            }
        }

        // Extract from Password provider
        function fromPassword(authData, profile){
            profile.email = authData.password.email;
            profile.image = authData.password.profileImageURL || null;
            return profile;
        }

        // Extract from Facebook provider
        function fromFacebook(authData, profile){
            profile.name.first = authData.facebook.cachedUserProfile.first_name || "";
            profile.name.last = authData.facebook.cachedUserProfile.last_name || "";
            profile.name.display = authData.facebook.displayName || "";
            profile.image = authData.facebook.profileImageURL || null;
            return profile;
        }

        // Extract from Google provider
        function fromGoogle(authData, profile){
            profile.name.first = authData.google.cachedUserProfile.given_name || "";
            profile.name.last = authData.google.cachedUserProfile.family_name || "";
            profile.name.display = authData.google.displayName || "";
            profile.image = authData.google.profileImageURL || null;
            return profile;
        }

        // Extract from Twitter provider
        function fromTwitter(authData, profile){
            var fullName = authData.twitter.displayName;
            profile.name.first = fullName.split(' ').slice(0, -1).join(' ') || "";
            profile.name.last = fullName.split(' ').slice(-1).join(' ') || "";
            profile.name.display = authData.twitter.displayName || "";
            profile.image = authData.twitter.profileImageURL || null;
            return profile;
        }

        // Extract from Github provider
        function fromGithub(authData, profile){
            var fullName = authData.github.displayName;
            profile.name.first = fullName.split(' ').slice(0, -1).join(' ') || "";
            profile.name.last = fullName.split(' ').slice(-1).join(' ') || "";
            profile.name.display = authData.github.displayName || "";
            profile.image = authData.github.profileImageURL || null;
            return profile;
        }

        // Add an achievement to the user's profile
        function addAchievement( profile, achievement ) {
            if (!profile.achievements) profile.achievements = [];
            profile.achievements.push( achievement );
        }
    }
})(); // IIFE keeps global scope clean
