class Task {
  constructor(id, title, description = "", status = "To Do") {
    this.id = id;
    this.title = title;
    this.description = description;
    this.status = status;
  }
}

module.exports = Task;
