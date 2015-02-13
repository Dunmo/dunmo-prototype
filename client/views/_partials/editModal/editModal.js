Template.editModal.rendered = function() {

  var $taskHours = $('.edit-task .task-hours');
  for (var i = 0; i < 101; i++) {
    $taskHours.append($("<option/>").val(i).text(i));
  }

  var $taskMinutes = $('.edit-task .task-minutes');
  for (var i = 0; i < 60; i += 5) {
    $taskMinutes.append($("<option/>").val(i).text(i));
  }

  // TODO: change data context somehow?
  $('.edit-modal').on('show.bs.modal', function(e) {
    var $modal = $(e.target);
    var taskId = $modal.attr('data-task-id');
    var task = Tasks.findOne(taskId);

    // fill fields with data
    $('.edit-task input.title').val(task.title);

    var importance = task.importance;
    if(importance == 1) {
      $('.edit-task label.imp-one').addClass('active');
      $('.edit-task label.imp-two').removeClass('active');
      $('.edit-task label.imp-three').removeClass('active');

      $('.edit-task label.imp-one input').attr('checked', true);
      $('.edit-task label.imp-two input').attr('checked', false);
      $('.edit-task label.imp-three input').attr('checked', false);
    } else if(importance == 2) {
      $('.edit-task label.imp-one').removeClass('active');
      $('.edit-task label.imp-two').addClass('active');
      $('.edit-task label.imp-three').removeClass('active');

      $('.edit-task label.imp-one input').attr('checked', false);
      $('.edit-task label.imp-two input').attr('checked', true);
      $('.edit-task label.imp-three input').attr('checked', false);
    } else {
      $('.edit-task label.imp-one').removeClass('active');
      $('.edit-task label.imp-two').removeClass('active');
      $('.edit-task label.imp-three').addClass('active');

      $('.edit-task label.imp-one input').attr('checked', false);
      $('.edit-task label.imp-two input').attr('checked', false);
      $('.edit-task label.imp-three input').attr('checked', true);
    }

    var timeRemaining = task.timeRemaining; // Duration
    var hr = Math.floor(timeRemaining.toSeconds() / 60 / 60);
    var min = 5 * Math.round(timeRemaining.minutes() / 5);
    if(min > 55) {
      min = 0;
      hr++;
    }
    $('.edit-task .task-hours').val(hr);
    $('.edit-task .task-minutes').val(min);

    var dueAt = task.dueAt;
    $("#datetimepicker").datetimepicker({
      pick12HourFormat: true,
      defaultDate: dueAt
    });
  });
};

Template.editModal.events({
  'click .confirm': function (e) {
    var taskId = $(e.target).closest('.modal').attr('data-task-id');
    confirmEditTask(taskId);
  }
});
