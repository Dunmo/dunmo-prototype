
Template.doneItem.rendered = function() {

  $(".dial").knob({
    readOnly: true,
    'fgColor': '#68B82B'
  });

  $('.dialdiv').attr('hidden', false);

};

Template.doneItem.helpers({

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
  }

});

Template.doneItem.events({

  "click .complete": function(e) {
    console.log('this.isDone: ', this.isDone);
    if(this.timeRemaining.toMilliseconds() === 0) {
      var task = this;
      this.setTimeRemaining(30*60*1000, function() {
        task.markDone(false);
      });
    } else {
      task.markDone(false);
    }
  },

  "click .edit": function(e) {
    console.log('this._id: ', this._id);
    $("#editModal").attr("data-task-id", this._id);
  }

});

