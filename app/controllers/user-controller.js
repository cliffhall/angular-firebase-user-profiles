/**
 * angular-firebase-user-profiles
 * (c) 2016 Cliff Hall @ Futurescale, Inc
 *
 * User Controller
 */
(function() {

    // Add the UserController to the module
    angular.module("angular-firebase-user-profiles")
        .controller(
            'UserController',
            [
                '$rootScope',
                '$timeout',
                'ProfileService',
                'AUTH_PROVIDERS',
                'USER_FORMS',
                'EVENTS',
                UserController
            ]
        );

    // Constructor
    function UserController($rootScope,
                            $timeout,
                            ProfileService,
                            AUTH_PROVIDERS,
                            USER_FORMS,
                            EVENTS) {

        // Construct and initialize the instance
        var instance = this;
        instance.createUser = createUser;
        instance.signUserIn = signUserIn;
        instance.signUserOut = signUserOut;
        instance.signInWithOAuth = signInWithOAuth;
        instance.useOAuthRedirect = useOAuthRedirect;
        instance.useOAuthPopup = useOAuthPopup;
        instance.retrieveProfile = retrieveProfile;
        instance.onProfileLoaded = onProfileLoaded;
        instance.onProfileReady = onProfileReady;
        instance.updateProfile = updateProfile;
        instance.initUserInDb = initUserInDb;
        instance.showAccountScreen = showAccountScreen;
        instance.changePassword = changePassword;
        instance.sendResetEmail = sendResetEmail;
        instance.confirmDelete = confirmDelete;
        instance.cancelDelete = cancelDelete;
        instance.deleteUser = deleteUser;
        instance.finishDeleteUser = finishDeleteUser;
        instance.onAuthStateChanged = onAuthStateChanged;
        instance.setMessage = setMessage;
        instance.clearMessage = clearMessage;
        instance.showForm = showForm;
        instance.selectForm = selectForm;
        instance.isSignedIn = isSignedIn;
        instance.saveProfile = saveProfile;
        instance.resetFormFlags = resetFormFlags;
        instance.resetPasswordInputs = resetPasswordInputs;
        instance.initialize = initialize;
        instance.initialize();

        // Initialize the UserController
        function initialize(){

            // Register the callback to be fired every time auth state changes
            firebase.auth().onAuthStateChanged(instance.onAuthStateChanged);

            // Listen for PROFILE_LOADED event
            $rootScope.$on(EVENTS.PROFILE_LOADED, instance.onProfileLoaded);

            // Listen for PROFILE_UPDATED event
            $rootScope.$on(EVENTS.PROFILE_UPDATED, instance.onProfileReady);

            // Listen for PROFILE_CHANGED event
            $rootScope.$on(EVENTS.PROFILE_CHANGED, instance.updateProfile);
        }

        // Create a user
        function createUser() {

            let email = $rootScope.account.emailInput;
            let password = $rootScope.account.passwordInput;

            firebase.auth()
                .createUserWithEmailAndPassword(email, password)
                .catch(function(error) {
                    instance.delaySetMessage(error.message, true);

                });
        }

        // Sign the user in with email and password
        function signUserIn(){
            let email    = $rootScope.account.emailInput;
            let password = $rootScope.account.passwordInput;

            firebase.auth()
                .signInWithEmailAndPassword(email, password)
                .catch(function(error) {
                    instance.setMessage(error.message, true);
                    instance.selectForm(USER_FORMS.SIGN_IN);
                });
        }

        // Sign the user out
        function signUserOut(){
            firebase.auth()
                .signOut()
                .catch(function(error){
                    console.log(error.message);
                });
        }

        // Sign the user in with an OAuth provider
        function signInWithOAuth(provider_const) {
            let provider;
            switch (provider_const){
                case AUTH_PROVIDERS.FACEBOOK:
                    provider = new firebase.auth.FacebookAuthProvider();
                    break;
                case AUTH_PROVIDERS.TWITTER:
                    provider = new firebase.auth.TwitterAuthProvider();
                    break;
                case AUTH_PROVIDERS.GOOGLE:
                    provider = new firebase.auth.GoogleAuthProvider();
                    break;
                case AUTH_PROVIDERS.GITHUB:
                    provider = new firebase.auth.GithubAuthProvider();
                    break;
            }

            $rootScope.account.emailInput = "";
            instance.resetPasswordInputs();
            instance.useOAuthPopup(provider);
        }

        // Use popup for OAuth sign-in
        function useOAuthPopup(provider) {
            firebase.auth()
                .signInWithPopup(provider)
                .then(function(result) {
                    $rootScope.account.authData = result.user;
                    instance.selectForm(USER_FORMS.PROFILE);
                })
                .catch(function(error) {
                    if (error) {
                        instance.useOAuthRedirect(provider);
                    }
                });
        }


        // Use redirect for OAuth sign-in
        function useOAuthRedirect(provider) {
            firebase.auth()
                .signInWithRedirect(provider)
                .then(function(result) {
                    $rootScope.account.authData = result.user;
                })
                .catch(function(error){
                    instance.delaySetMessage(error.message, true);
                });
        }

        // Retrieve the signed-in user's profile
        function retrieveProfile() {
            ProfileService.retrieve();
        }

        // Handle the PROFILE_LOADED event
        function onProfileLoaded(event, profile) {
            $rootScope.account.profile = profile;
            if (profile) {
                instance.onProfileReady();
            } else {
                instance.initUserInDb();
            }
        }

        // Handle the PROFILE_LOADED and PROFILE_UPDATED events
        function onProfileReady(event, profile){
            instance.resetFormFlags();
            instance.showAccountScreen();
        }

        // The profile has changed (perhaps by another controller) and needs saving
        function updateProfile(event) {
            ProfileService.update();
        }

        // Initialize a new user in the database
        function initUserInDb(){
            ProfileService.create();
            instance.resetFormFlags();
            instance.showAccountScreen();
        }

        // Show the account screen
        function showAccountScreen() {
            instance.selectForm(USER_FORMS.PROFILE);
            if ($rootScope.account.profile.newUser) {
                $rootScope.account.editing = true;
                instance.setMessage("Complete your profile to unlock your first achievement!", false);
            }
            $timeout($rootScope.digest,2000,true);
        }

        // Change the user's password
        function changePassword() {
            let newPassword = $rootScope.account.newPasswordInput;
            firebase.auth()
                .currentUser
                .updatePassword(newPassword)
                .then(function() {
                    instance.setMessage("Password changed successfully.", false);
                    instance.resetPasswordInputs();
                    $timeout(instance.showAccountScreen,350,true);
                })
                .catch(function(error){
                    instance.delaySetMessage(error.message, true);
                });
        }

        // Send the user a password reset email
        function sendResetEmail() {
            let email = $rootScope.account.emailInput;

            // Get the user and set the password
            firebase.auth()
                .sendPasswordResetEmail(email)
                .then(function(){
                    instance.setMessage("Password reset email sent successfully.", false);
                })
                .catch(function(error){
                    instance.delaySetMessage(error.message, true);
                });
        }

        // Confirm that the user wishes to remove the account
        function confirmDelete(){
            instance.resetPasswordInputs();
            $rootScope.account.confirmDelete = true;
        }

        // Cancel the account deletion
        function cancelDelete(){
            instance.clearMessage();
            instance.selectForm(USER_FORMS.PROFILE);
            $rootScope.account.confirmDelete = false;
        }

        // Delete the user's account
        function deleteUser(email, password) {
            ProfileService.remove();

            firebase.auth().currentUser
                .delete()
                .then( function(){
                    instance.finishDeleteUser();
                })
                .catch(function(error) {
                    instance.setMessage(error.message, true);
                    $timeout($rootScope.digest,1000,true);
                });
        }

        // Complete the account removal
        function finishDeleteUser(){
            instance.signUserOut();
            instance.resetFormFlags();
            instance.setMessage("Account removed. Sorry to see you go.", false);
            instance.selectForm(USER_FORMS.SIGN_IN);
            instance.resetPasswordInputs();
            $rootScope.account.emailInput = "";
            $rootScope.account.authData = null;
            $rootScope.account.profile = null;
            $timeout($rootScope.digest,2000,true);
        }

        // Callback invoked when the authentication state changes
        function onAuthStateChanged(authData) {
            $rootScope.account.authData = authData;
            if (authData) {
                instance.retrieveProfile();
            } else {
                $rootScope.account.profile = null;
                instance.resetFormFlags();
                instance.selectForm(USER_FORMS.SIGN_IN);
            }
        }

        // Set the account message and error state for the last operation
        function setMessage( message, error ) {
            $rootScope.account.message = message;
            $rootScope.account.errorState = (error);
        }

        // Clear the account message and error state
        function clearMessage() {
            $rootScope.account.message = null;
            $rootScope.account.errorState = false;
        }

        // Show the given user form if it is selected
        function showForm(selectedForm, checkForm){
            return ( selectedForm === checkForm );
        }

        // Select a particular form
        function selectForm(form){
            $rootScope.account.selectedUserForm = form;
        }

        // Is the user signed in?
        function isSignedIn(authData) {
            return (authData != null);
        }

        // Save the user's profile
        function saveProfile() {
            ProfileService.update();
            instance.resetFormFlags();
        }

        // Reset the form editing flags
        function resetFormFlags(){
            $rootScope.account.editing = false;
            $rootScope.account.confirmDelete = false;
            $rootScope.account.formSubmitted = false;
        }

        // Reset the password inputs
        function resetPasswordInputs() {
            $rootScope.account.passwordInput = "";
            $rootScope.account.newPasswordInput = "";
            $rootScope.account.passwordConfirmInput = "";
        }
    }
})(); // IIFE keeps global scope clean