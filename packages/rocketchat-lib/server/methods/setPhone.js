Meteor.methods({
	setPhone: function(phone) {

		check (phone, String);

		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'setPhone'});
		}

		const user = Meteor.user();

		if (user.phone && user.phone[0] && user.phone[0].phoneNumber === phone) {
			return phone;
		}

		if (!RocketChat.setPhone(user._id, phone)) {
			throw new Meteor.Error('error-could-not-change-phone', 'Could not change phone', {method: 'setPhone'});
		}

		return phone;
	}
});

RocketChat.RateLimiter.limitMethod('setPhone', 1, 1000, {
	userId: function(/*userId*/) { return true; }
});