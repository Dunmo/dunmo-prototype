Template.tasksNav.events({
	'click #tasksAllBtn': function() {
		location.href = '/tasks/all';
	},
	'click #tasksBtn': function() {
		location.href = '/tasks';
	},

	'click a#signOut': function() {
		Meteor.logout();
	}
});

Template.tasksNav.helpers({

});
