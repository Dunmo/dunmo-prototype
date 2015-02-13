Template.signupForm.events({

  'submit #signup-form' : function(e, t){
      e.preventDefault();
      var email = t.find('#signup-email').value
        , password = t.find('#signup-password').value;

        // Trim and validate the input

      Accounts.createUser({email: email, password : password}, function(err){
          if (err) {
            alert('attempt failed');
          } else {
            Router.go('/tasks');
          }

        });

      return false;
    }
});
