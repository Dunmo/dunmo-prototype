
Template.newTaskNav.events({
  "click a#confirm-new-task": function (event) {

    // validation
    $("div.form-group").removeClass("has-error");
    if ($("input#title").val() == "") {
      $("div#title-group").addClass("has-error");
      return false;
    }
    if ($("select#task-hours").val() == 0 && $("select#task-minutes").val() == 0) {
      $("div#length-group").addClass("has-error");
      return false;
    }
    if ($("#datetimepicker input").val() == "") {
      $("div#date-group").addClass("has-error");
      return false;
    }
    if ($("div#importance-group label.active").length == 0) {
      $("div#importance-group").addClass("has-error");
      return false;
    }

    // if ($("div.form-group.has-error").length == 0) {
    //
    // }

    var todo = {};
    todo.title = $('#title').val();
    todo.dueAt = new Date($('#datetimepicker input').val());
    todo.totalLength = $('#task-hours').val() * 60 * 60 + $('#task-minutes').val() * 60;
    todo.importance = $("div#importance-group label.active").children("input").eq(0).val()
    insertTodo(todo, function (err, id) {
      if(err) console.log(err);
      else console.log('id: ', id);
      Router.go('/tasks');
    });
  }
});
