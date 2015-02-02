
confirmEditTask = function(taskId) {
  // event.preventDefault();
  // validation
  var task = {};
  var $parent = $('.edit-task');
  var title = $parent.find('.title').val();
  var hours = $parent.find('.task-hours').val();
  var minutes = $parent.find('.task-minutes').val();
  var datetime = $parent.find('#datetimepicker input').val();
  var $importance = $parent.find('#importance-group');

  if (title != "") {
    task.title = title;
  }
  if (!(hours == 0 && minutes == 0)) {
    task.timeRemaining = fromSeconds((hours * 60 * 60) + (minutes * 60));
  }
  if (datetime != "") {
    task.dueAt = new Date(datetime);
  }
  if ($importance.length != 0) {
    task.importance = $importance.children("input").eq(0).val();
  }

  updateTask(taskId, task, function (err, id) {
    $('#editModal').modal('hide');
  });
};
