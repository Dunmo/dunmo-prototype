
Template.taskItem.rendered = function() {

  $(".dial").knob({
    readOnly: true,
    'fgColor': '#68B82B'
  });

  $('.dialdiv').attr('hidden', false);

};

Template.taskItem.helpers({

  importanceClass: function() {
    if (this.importance == 1) {
      return "lowImportance";
    } else if (this.importance == 2) {
      return "mediumImportance";
    } else {
      return "highImportance";
    }
  },

  importanceBangs: function() {
    if (this.importance == 1) {
      return "!";
    } else if (this.importance == 2) {
      return "!!";
    } else {
      return "!!!";
    }
  },

  overdueClass: function() {
    if(this.isOverdue) return "overdue";
    else               return "";
  },

  timeRemainingStr: function() {
    var annotation = "remaining";
    return this.timeRemainingStr() + " " + annotation;
  }

});

Template.taskItem.events({

  'click .complete': function(e) {
    if(this.isDone) {
      console.log('this.isDone: ', this.isDone);
      if(this.timeRemaining.toMilliseconds() === 0) {
        var task = this;
        this.setTimeRemaining(30*60*1000, function() {
          task.markDone(false);
        });
      } else {
        task.markDone(false);
      }
    } else {
      console.log('test');
      this.spendTime(this.timeRemaining.toMilliseconds());
      this.markDone();
    }
  },

  'click .btn.edit': function(e) {
    console.log('this._id: ', this._id);
    $('.edit-modal').attr('data-task-id', this._id);
  }

});

