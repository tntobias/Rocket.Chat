Meteor.methods({
	saveUserProfile(settings, customFields) {
		check(settings, Object);

		if (!RocketChat.settings.get('Accounts_AllowUserProfileChange')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'saveUserProfile'
			});
		}

		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'saveUserProfile'
			});
		}

		const user = RocketChat.models.Users.findOneById(Meteor.userId());

		function checkPassword(user = {}, currentPassword) {
			if (user.services && user.services.password && user.services.password.bcrypt && user.services.password.bcrypt.trim()) {
				return true;
			}

			if (!currentPassword) {
				return false;
			}

			const passCheck = Accounts._checkPassword(user, {
				digest: currentPassword,
				algorithm: 'sha-256'
			});

			if (passCheck.error) {
				return false;
			}

			return true;
		}

		if ((settings.newPassword) && RocketChat.settings.get('Accounts_AllowPasswordChange') === true) {
			if (!checkPassword(user, settings.currentPassword)) {
				throw new Meteor.Error('error-invalid-password', 'Invalid password', {
					method: 'saveUserProfile'
				});
			}

			Accounts.setPassword(Meteor.userId(), settings.newPassword, {
				logout: false
			});
		}

		if (settings.realname) {
			Meteor.call('setRealName', settings.realname);
		}

		if (settings.username) {
			Meteor.call('setUsername', settings.username);
		}

		if (settings.phone) {
			Meteor.call('setPhone', settings.phone);
		}

		if (settings.email) {
			if (!checkPassword(user, settings.currentPassword)) {
				throw new Meteor.Error('error-invalid-password', 'Invalid password', {
					method: 'saveUserProfile'
				});
			}

			Meteor.call('setEmail', settings.email);
		}

		RocketChat.models.Users.setProfile(Meteor.userId(), {});

		RocketChat.saveCustomFields(Meteor.userId(), customFields);

		return true;
	}
});
