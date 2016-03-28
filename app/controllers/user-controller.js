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
        instance.authStateChanged = authStateChanged;
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
            $rootScope.db.base.onAuth(instance.authStateChanged);

            // Listen for PROFILE_LOADED event
            $rootScope.$on(EVENTS.PROFILE_LOADED, instance.onProfileLoaded);

            // Listen for PROFILE_UPDATED event
            $rootScope.$on(EVENTS.PROFILE_UPDATED, instance.onProfileReady);

            // Listen for PROFILE_CHANGED event
            $rootScope.$on(EVENTS.PROFILE_CHANGED, instance.updateProfile);
        }

        // Create a user
        function createUser() {
            $rootScope.db.base.createUser({
                    email    : $rootScope.account.emailInput,
                    password : $rootScope.account.passwordInput
                },
                function(error, userData) {
                    if (error) {
                        instance.setMessage(error.message, true);
                    } else {
                        instance.signUserIn();
                    }
                    $rootScope.$digest();
                });
        }

        // Sign the user in with email and password
        function signUserIn(){
            $rootScope.db.base.authWithPassword({
                email    : $rootScope.account.emailInput,
                password : $rootScope.account.passwordInput
            }, function(error, authData) {
                if (error) {
                    instance.setMessage(error.message, true);
                    instance.selectForm(USER_FORMS.SIGN_IN);
                } else {
                    instance.resetPasswordInputs();
                    instance.selectForm(USER_FORMS.PROFILE);
                }
                $rootScope.$digest();
            });
        }

        // Sign the user out
        function signUserOut(){
            $rootScope.db.base.unauth();
        }

        // Sign the user in with an OAuth provider
        function signInWithOAuth(provider) {
            $rootScope.account.emailInput = "";
            instance.resetPasswordInputs();
            instance.useOAuthPopup(provider);
        }

        // Use popup for OAuth sign-in
        function useOAuthPopup(provider) {
            $rootScope.db.base.authWithOAuthPopup(provider, function(error, authData) {
                if (error) {
                    if (error.code === "TRANSPORT_UNAVAILABLE") {
                        instance.useOAuthRedirect(provider);
                    } else {
                        instance.setMessage(error.message, true);
                    }
                } else {
                    $rootScope.account.authData = authData;
                    instance.selectForm(USER_FORMS.PROFILE);
                }
                $rootScope.$digest();
            });
        }

        // Use redirect for OAuth sign-in
        function useOAuthRedirect(provider) {
            $rootScope.db.base.authWithOAuthRedirect(provider, function(error) {
                if (error) {
                    instance.setMessage(error.message, true);
                } else {
                    // We'll never get here, as the page will redirect on success.
                }
                $rootScope.$digest();
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
            $rootScope.db.base.changePassword({
                email    : $rootScope.account.authData.password.email,
                oldPassword : $rootScope.account.passwordInput,
                newPassword : $rootScope.account.newPasswordInput
            }, function(error) {
                if (error) {
                    instance.setMessage(error.message, true);
                } else {
                    instance.setMessage("Password changed successfully.", false);
                    instance.resetPasswordInputs();
                }
                $rootScope.$digest();
            });
        }

        // Send the user a password reset email
        function sendResetEmail() {
            $rootScope.db.base.resetPassword({
                email : $rootScope.account.emailInput
            }, function(error) {
                if (error) {
                    instance.setMessage(error.message, true);
                } else {
                    instance.setMessage("Password reset email sent successfully.", false);
                    instance.resetPasswordInputs();
                }
                $rootScope.$digest();
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
            var provider = $rootScope.account.authData.provider;
            if (provider === AUTH_PROVIDERS.PASSWORD) {
                $rootScope.db.base.removeUser({
                    email    : email,
                    password : password
                }, function(error) {
                    if (error) {
                        instance.setMessage(error.message, true);
                        $timeout($rootScope.digest,1000,true);
                    } else {
                        instance.finishDeleteUser();
                    }
                });
            } else {
                instance.finishDeleteUser();
            }
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
        function authStateChanged(authData) {
            $rootScope.account.authData = authData;
            instance.clearMessage();
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