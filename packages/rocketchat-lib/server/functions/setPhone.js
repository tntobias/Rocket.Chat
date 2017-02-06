RocketChat._setPhone = function(userId, phone) {

	phone = s.trim(phone);

	if (!userId) {
		throw new Meteor.Error('error-invalid-user', 'Invalid user', { function: '_setPhone' });
	}

	if (!phone) {
		throw new Meteor.Error('error-invalid-phone', 'Invalid phone', { function: '_setPhone' });
	}

	const user = RocketChat.models.Users.findOneById(userId);

	if (user.phone && user.phone[0] && user.phone[0].phoneNumber === phone) {
		return user;
	}

	RocketChat.models.Users.setPhone(user._id, phone);
	user.phone = phone;
	return user;
};

RocketChat.setPhone = RocketChat.RateLimiter.limitFunction(RocketChat._setPhone, 1, 60000, {
	0: function(userId) { return !userId || !RocketChat.authz.hasPermission(userId, 'edit-other-user-info'); }
});