//import toastr from 'toastr'
Template.accountProfile.helpers({
    allowDeleteOwnAccount() {
        return RocketChat.settings.get('Accounts_AllowDeleteOwnAccount');
    },

    realname() {
        return Meteor.user().name;
    },

    username() {
        return Meteor.user().username;
    },

    email() {
        return __guard__(__guard__(Meteor.user().emails, x1 => x1[0]), x => x.address);
    },

    emailVerified() {
        return __guard__(__guard__(Meteor.user().emails, x1 => x1[0]), x => x.verified);
    },

    allowUsernameChange() {
        return RocketChat.settings.get("Accounts_AllowUsernameChange") && (RocketChat.settings.get("LDAP_Enable") !== true);
    },

    allowEmailChange() {
        return RocketChat.settings.get("Accounts_AllowEmailChange");
    },

    usernameChangeDisabled() {
        return t('Username_Change_Disabled');
    },

    allowPasswordChange() {
        return RocketChat.settings.get("Accounts_AllowPasswordChange");
    },

    passwordChangeDisabled() {
        return t('Password_Change_Disabled');
    },

    customFields() {
        return Meteor.user().customFields;
    }
});

Template.accountProfile.onCreated(function() {
    let settingsTemplate = this.parentTemplate(3);
    if (settingsTemplate.child == null) { settingsTemplate.child = []; }
    settingsTemplate.child.push(this);

    this.clearForm = function() {
        return this.find('#password').value = '';
    };

    this.changePassword = function(newPassword, callback) {
        let instance = this;
        if (!newPassword) {
            return callback();

        } else {
            if (!RocketChat.settings.get("Accounts_AllowPasswordChange")) {
                toastr.remove();
                toastr.error(t('Password_Change_Disabled'));
                instance.clearForm();
                return;
            }
        }
    };

    return this.save = function(currentPassword) {
        let instance = this;

        let data = { currentPassword };

        if (_.trim($('#password').val()) && RocketChat.settings.get("Accounts_AllowPasswordChange")) {
            data.newPassword = $('#password').val();
        }

        if (_.trim($('#realname').val())) {
            data.realname = _.trim($('#realname').val());
        }

        if (_.trim($('#username').val()) !== Meteor.user().username) {
            if (!RocketChat.settings.get("Accounts_AllowUsernameChange")) {
                toastr.remove();
                toastr.error(t('Username_Change_Disabled'));
                instance.clearForm();
                return;
            } else {
                data.username = _.trim($('#username').val());
            }
        }

        if (_.trim($('#email').val()) !== __guard__(__guard__(Meteor.user().emails, x1 => x1[0]), x => x.address)) {
            if (!RocketChat.settings.get("Accounts_AllowEmailChange")) {
                toastr.remove();
                toastr.error(t('Email_Change_Disabled'));
                instance.clearForm();
                return;
            } else {
                data.email = _.trim($('#email').val());
            }
        }

        let customFields = {};
        $('[data-customfield=true]').each(function() {
            return customFields[this.name] = $(this).val() || '';
        });

        return Meteor.call('saveUserProfile', data, customFields, function(error, results) {
            if (results) {
                toastr.remove();
                toastr.success(t('Profile_saved_successfully'));
                swal.close();
                instance.clearForm();
            }

            if (error) {
                toastr.remove();
                return handleError(error);
            }
        });
    };
});

Template.accountProfile.onRendered(() =>
    Tracker.afterFlush(function() {
        // this should throw an error-template
        if (!RocketChat.settings.get("Accounts_AllowUserProfileChange")) { FlowRouter.go("home"); }
        SideNav.setFlex("accountFlex");
        return SideNav.openFlex();
    })
);

Template.accountProfile.events({
    ['click .submit button'](e, instance) {
        let user = Meteor.user();
        let reqPass = ((_.trim($('#email').val()) !== __guard__(__guard__(__guard__(user, x2 => x2.emails), x1 => x1[0]), x => x.address)) || _.trim($('#password').val())) && s.trim(__guard__(__guard__(__guard__(user, x5 => x5.services), x4 => x4.password), x3 => x3.bcrypt));
        if (!reqPass) {
            return instance.save();
        }

        return swal({
                title: t("Please_enter_your_password"),
                text: t("For_your_security_you_must_enter_your_current_password_to_continue"),
                type: "input",
                inputType: "password",
                showCancelButton: true,
                closeOnConfirm: false
            }

            , typedPassword => {
                if (typedPassword) {
                    toastr.remove();
                    toastr.warning(t("Please_wait_while_your_profile_is_being_saved"));
                    return instance.save(SHA256(typedPassword));
                } else {
                    swal.showInputError(t("You_need_to_type_in_your_password_in_order_to_do_this"));
                    return false;
                }
            }
        );
    },
    ['click .logoutOthers button'](event, templateInstance) {
        return Meteor.logoutOtherClients(function(error) {
            if (error) {
                toastr.remove();
                return handleError(error);
            } else {
                toastr.remove();
                return toastr.success(t('Logged_out_of_other_clients_successfully'));
            }
        });
    },
    ['click .delete-account button'](e) {
        e.preventDefault();
        if (s.trim(__guard__(__guard__(__guard__(Meteor.user(), x2 => x2.services), x1 => x1.password), x => x.bcrypt))) {
            return swal({
                    title: t("Are_you_sure_you_want_to_delete_your_account"),
                    text: t("If_you_are_sure_type_in_your_password"),
                    type: "input",
                    inputType: "password",
                    showCancelButton: true,
                    closeOnConfirm: false
                }

                , typedPassword => {
                    if (typedPassword) {
                        toastr.remove();
                        toastr.warning(t("Please_wait_while_your_account_is_being_deleted"));
                        return Meteor.call('deleteUserOwnAccount', SHA256(typedPassword), function(error, results) {
                            if (error) {
                                toastr.remove();
                                return swal.showInputError(t("Your_password_is_wrong"));
                            } else {
                                return swal.close();
                            }
                        });
                    } else {
                        swal.showInputError(t("You_need_to_type_in_your_password_in_order_to_do_this"));
                        return false;
                    }
                }
            );
        } else {
            return swal({
                    title: t("Are_you_sure_you_want_to_delete_your_account"),
                    text: t("If_you_are_sure_type_in_your_username"),
                    type: "input",
                    showCancelButton: true,
                    closeOnConfirm: false
                }

                , deleteConfirmation => {
                    if (deleteConfirmation === __guard__(Meteor.user(), x3 => x3.username)) {
                        toastr.remove();
                        toastr.warning(t("Please_wait_while_your_account_is_being_deleted"));
                        return Meteor.call('deleteUserOwnAccount', deleteConfirmation, function(error, results) {
                            if (error) {
                                toastr.remove();
                                return swal.showInputError(t("Your_password_is_wrong"));
                            } else {
                                return swal.close();
                            }
                        });
                    } else {
                        swal.showInputError(t("You_need_to_type_in_your_username_in_order_to_do_this"));
                        return false;
                    }
                }
            );
        }
    },

    ['click #resend-verification-email'](e) {
        e.preventDefault();

        e.currentTarget.innerHTML = e.currentTarget.innerHTML + ' ...';
        e.currentTarget.disabled = true;

        return Meteor.call('sendConfirmationEmail', __guard__(__guard__(Meteor.user().emails, x1 => x1[0]), x => x.address), (error, results) => {
            if (results) {
                toastr.success(t('Verification_email_sent'));
            } else if (error) {
                handleError(error);
            }

            e.currentTarget.innerHTML = e.currentTarget.innerHTML.replace(' ...', '');
            return e.currentTarget.disabled = false;
        });
    }
});

function __guard__(value, transform) {
    return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}