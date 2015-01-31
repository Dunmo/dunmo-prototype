
/*
 * User
 * =========
 * name : String
 * email : String<unique>
 *
 */

Meteor.users.helpers({
  tasks: function() {
    return fetchTasks({ ownerId: this._id }, { sort: [[ 'dueAt', 'asc' ]] });
  },

  todos: function() {
    return fetchTasks({ownerId: this._id, isDone: false }, { sort: [[ 'dueAt', 'asc' ]] });
  },

  doneTasks: function() {
    return fetchTasks({ownerId: this._id, isDone: true }, { sort: [[ 'dueAt', 'asc' ]] });
  },

  // output: tasks sorted by dueAt, importance, and timeRemaining, in that order
  sortedTasks: function() {
    return basicSort(this.tasks());
  },

  // output: todos sorted by dueAt, importance, and timeRemaining, in that order
  sortedTodos: function() {
    return basicSort(this.todos());
  },

  //task: tasksDoneOn(date), historical
  //task: tasksDueAt(date), based on due date

  lastWeeksDayLists: function() {
    return fetchDayLists({
      ownerId: this._id,
      date: {
        $gte: Date.sevenDaysAgoStart().getTime(),
        $lt: Date.todayStart().getTime()
      }
    });
  },

  // TODO averageTimeSpent
  // output: average free time (Duration object) based on past 7 days
  averageFreetime: function() {
    var lastWeek = this.lastWeeksDayLists();
    var avgLength;
    if (lastWeek.length === 0) {
      avgLength = 4*60*60*1000; // number of milliseconds in 4 hours
    } else {
      var lenths = _.map(_.pluck(lastWeek, 'timeSpent'), function(duration) {
        return duration.toMilliseconds();
      });
      avgLength = _.avg(lengths);
    };

    return new Duration(avgLength);
  },

  // input: a date object
  // output: the dayList object for that date sans todos
  dayList: function(date) {
    var user = this;
    var dayList = findOneDayList({ ownerId: user._id, date: date });

    if(!dayList) {
      var id = DayLists.insert({
        ownerId: user._id,
        date: date,
        timeRemaining: user.averageFreetime(),
        timeSpent: new Duration(0)
      });
      dayList = findOneDayList(id);
    }

    return dayList;
  },

  // output: a list of dayLists from today until the latest due date of any todo
  //         dayLists are sans todos
  freetimes: function() {
    var averageFreetime = this.averageFreetime();

    // get all unfinished tasks
    var todos = this.todos();

    // create all the dayLists from today until the furthest due date, sorted by date
    var startDate = Date.todayStart();
    var todaysFreetime = this.dayList(startDate);
    var freetimes = [ todaysFreetime ];
    if (todos.length === 0) return freetimes;
    else var endDate = _.last(todos).dueAt;

    var d = startDate;
    d.setDate(d.getDate() + 1);
    while(d <= endDate) {
      // TODO: grab existing dayLists from db
      freetimes.push({
        ownerId: this._id,
        date: new Date(d),
        timeRemaining: averageFreetime,
        timeSpent: Duration(0)
      });
      d.setDate(d.getDate() + 1);
    }

    return freetimes;
  },

  // returns timeRemaining on date as Duration
  timeRemaining: function(date, milliseconds) {
    if(typeof date === 'number') {
      milliseconds = date;
      date = null;
    }
    if(!date) date = Date.todayStart();
    var dayList = this.dayList(date);
    console.log('dayList: ', dayList);
    if(milliseconds) {
      DayLists.update(dayList._id, { $set: { timeRemaining: milliseconds }});
      return new duration(milliseconds);
    } else return dayList.timeRemaining;
  },

  // returns timeSpent on date as Duration
  timeSpent: function(date, milliseconds) {
    if(typeof date === 'number') {
      milliseconds = date;
      date = null;
    }
    if(!date) date = Date.todayStart();
    var dayList = this.dayList(date);
    console.log('dayList: ', dayList);
    if(milliseconds) {
      DayLists.update(dayList._id, { $set: { timeSpent: milliseconds }});
      return new duration(milliseconds);
    } else return dayList.timeSpent;
  },

  incrementTimeRemaining: function(date, milliseconds) {
    if(typeof date === 'number') {
      milliseconds = date;
      date = null;
    }
    if(!date) date = Date.todayStart();
    var dayList = this.dayList(date);
    DayLists.update(dayList._id, { $inc: { timeRemaining: milliseconds }});
    var current = dayList.timeRemaining.toMilliseconds();
    return new Duration(current + milliseconds);
  },

  incrementTimeSpent: function(date, milliseconds) {
    if(typeof date === 'number') {
      milliseconds = date;
      date = null;
    }
    if(!date) date = Date.todayStart();
    var dayList = this.dayList(date);
    DayLists.update(dayList._id, { $inc: { timeSpent: milliseconds }});
    var current = dayList.timeSpent.toMilliseconds();
    return new Duration(current + milliseconds);
  },

  spendTime: function(milliseconds) {
    this.incrementTimeSpent(milliseconds);
    this.incrementTimeRemaining(-milliseconds);
  },

  // output: A list of dayLists, each filled with todos. Todos are sorted by
  //         dueAt, importance, and timeRemaining, in that order. Each dayList
  //         will contain as many todos as will fit. If this results in any
  //         overdue todos, they will be added to the end of the dueAt dayList
  //         with the attribute { overdue: true }.
  todoList: function() {
    var user      = this;
    var freetimes = user.freetimes();
    var todos     = user.sortedTodos();

    dayLists = user._generateTodoList(freetimes, todos, 'greedy');

    return dayLists;
  },

  // a private helper function for todoList
  _generateTodoList: function(freetimes, todos, algorithm) {
    if(algorithm !== 'greedy') {
      console.log(algorithm, ' not implemented, use \'greedy\'');
      return [];
    }

    var user = this;

    var todoList  = lodash.map(freetimes, function(freetime) {
      if(todos.length > 0) {
        var ret     = user._generateDayList(freetime, todos);
        var dayList = ret[0];
        todos       = ret[1];
        return dayList;
      } else {
        return null;
      }
    });

    return lodash.compact(todoList);
  },

  // a private helper function for todoList
  _generateDayList: function(freetime, todos) {
    var user      = this;
    var dayList   = R.cloneDeep(freetime);
    var remaining = R.cloneDeep(freetime.timeRemaining);
    dayList.todos = [];

    while(remaining.toSeconds() > 0 && todos.length > 0) { // TODO: remaining.toTaskInterval() > 0 ?
      var ret   = user._appendTodo(dayList, todos, remaining);
      dayList   = ret[0];
      todos     = ret[1];
      remaining = ret[2];
    }

    if(todos.length > 0) {
      var ret = this._appendOverdue(dayList, todos);
      dayList = ret[0];
      todos   = ret[1];
    }

    return [ dayList, todos ];
  },

  // a private helper function for todoList
  _appendTodo: function(dayList, todos, remaining) {
    var todo = todos[0];

    // TODO: what about overdue items on the first day?
    // TODO: todo.timeRemaining.toTaskInterval() > remaining.toTaskInterval() ?
    if(todo.timeRemaining.toSeconds() > remaining.toSeconds()) {
      var ret   = todo.split(remaining);
      todo      = ret[0];
      todos[0]  = ret[1];
      dayList.todos.push(todo);
      remaining = new Duration(0);
    } else {
      dayList.todos.push(todo);
      todos.shift();
      remaining = remaining.toMilliseconds() - todo.timeRemaining.toMilliseconds();
      remaining = new Duration(remaining); // TODO: Duration operations
    }

    if (todo.title === "Paco!") {console.log("todos: ", todos);}

    return [ dayList, todos, remaining ];
  },

  // a private helper function for todoList
  // assume dayList is "full"
  _appendOverdue: function(dayList, todos) {
    var todo = todos[0];

    while(todo && (todo.dueAt <= dayList.date.endOfDay())) {
      todo.isOverdue = true;
      dayList.todos.push(todo);
      todos.shift();
      todo = todos[0];
    }

    return [ dayList, todos ]
  }

});
