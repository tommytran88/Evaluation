// * ~~~~~~~~~~~~~~~~~~~ Api ~~~~~~~~~~~~~~~~~~~
const Api = (() => {
  const baseUrl = "http://localhost:3000";
  const todopath = "todos";

  const getTodos = () =>
    fetch([baseUrl, todopath].join("/")).then((response) => response.json());

  const deleteTodo = (id) =>
    fetch([baseUrl, todopath, id].join("/"), {
      method: "DELETE",
    });

  const addTodo = (todo) =>
    fetch([baseUrl, todopath].join("/"), {
      method: "POST",
      body: JSON.stringify(todo),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    }).then((response) => response.json());

  const updateTodoContent = (id, title) => {
    fetch([baseUrl, todopath, id].join("/"), {
      method: "PATCH",
      body: JSON.stringify({
        title: title,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    }).then((response) => response.json());
  };

  const updateTodoStatus = (id, status) => {
    fetch([baseUrl, todopath, id].join("/"), {
      method: "PATCH",
      body: JSON.stringify({
        completed: status,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    }).then((response) => response.json());
  };

  return {
    getTodos,
    deleteTodo,
    addTodo,
    updateTodoContent,
    updateTodoStatus,
  };
})();

// * ~~~~~~~~~~~~~~~~~~~ View ~~~~~~~~~~~~~~~~~~~
const View = (() => {
  const domstr = {
    todocontainer: "#todolist_container",
    inputbox: ".todolist_input",
    inputbutton: ".todolist_input_btn",
    todopendingcontainer: "#todolist_pending_container",
    todocompletedcontainer: "#todolist_completed_container",
    inputid: "#input",
  };

  const status = {
    updating: true,
  };

  const render = (ele, tmp) => {
    ele.innerHTML = tmp;
  };
  const createTmp = (updateStatus, arr) => {
    let tmp = "";

    arr.forEach((todo) => {
      if (!updateStatus[todo.id]) {
        if (todo.completed === false) {
          tmp += `
                <li>
                  <span>${todo.title}</span>
                  <button class="updatebtn" id="update${todo.id}">Edit</button>
                  <button class="deletebtn" id="${todo.id}">Delete</button>
                  <button class="statusbtn" id="status${todo.id}">-></button>
                </li>
              `;
        } else if (todo.completed === true) {
          tmp += `
              <li>
                  <button class="statusbtn" id="status${todo.id}"><-</button>
                  <span>${todo.title}</span>
                  <button class="updatebtn" id="update${todo.id}">Edit</button>
                  <button class="deletebtn" id="${todo.id}">Delete</button>
              </li>
              `;
        }
      } else {
        if (todo.completed === false) {
          tmp += `
                <li>
                  <input type="text" value="${todo.title}" id="input${todo.id}">
                  <button class="updatebtn" id="update${todo.id}">Edit</button>
                  <button class="deletebtn" id="${todo.id}">Delete</button>
                  <button class="statusbtn" id="status${todo.id}">-></button>
                </li>
              `;
        } else if (todo.completed === true) {
          tmp += `
              <li>
                  <button class="statusbtn" id="status${todo.id}"><-</button>
                  <input type="text" value="${todo.title}" id="input${todo.id}">
                  <button class="updatebtn" id="update${todo.id}">Edit</button>
                  <button class="deletebtn" id="${todo.id}">Delete</button>
              </li>
              `;
        }
      }
    });

    return tmp;
  };

  return {
    render,
    createTmp,
    domstr,
    status,
  };
})();

// * ~~~~~~~~~~~~~~~~~~~ Model ~~~~~~~~~~~~~~~~~~~
const Model = ((api, view) => {
  const { getTodos, deleteTodo, addTodo, updateTodoContent, updateTodoStatus } =
    api;

  class Todo {
    constructor(title) {
      this.title = title;
      this.completed = false;
    }
  }

  class State {
    #todolist = [];
    #todopendinglist = [];
    #todocompletedlist = [];
    #updateStatus = {};

    get todolist() {
      return this.#todolist;
    }
    set todolist(newtodolist) {
      this.#todolist = newtodolist;

      this.#todocompletedlist = newtodolist.filter((todo) => {
        return todo.completed === true;
      });
      this.#todopendinglist = newtodolist.filter((todo) => {
        return todo.completed === false;
      });

      const todopendingcontainer = document.querySelector(
        view.domstr.todopendingcontainer
      );
      const pendingTmp = view.createTmp(
        this.#updateStatus,
        this.#todopendinglist
      );

      const todocompletedcontainer = document.querySelector(
        view.domstr.todocompletedcontainer
      );

      const completedTmp = view.createTmp(
        this.#updateStatus,
        this.#todocompletedlist
      );
      // setTimeout(() => {
      view.render(todopendingcontainer, pendingTmp);
      view.render(todocompletedcontainer, completedTmp);
      // }, 0);
    }

    get updateStatus() {
      return this.#updateStatus;
    }

    set updateStatus(newObj) {
      this.#updateStatus = newObj;
    }
  }

  return {
    getTodos,
    deleteTodo,
    addTodo,
    updateTodoContent,
    updateTodoStatus,
    State,
    Todo,
  };
})(Api, View);

// * ~~~~~~~~~~~~~~~~~~~ Controller ~~~~~~~~~~~~~~~~~~~
const Controller = ((model, view) => {
  const state = new model.State();

  const deleteTodo = () => {
    const todocontainer = document.querySelector(view.domstr.todocontainer);
    todocontainer.addEventListener("click", (event) => {
      if (event.target.className === "deletebtn") {
        state.todolist = state.todolist.filter(
          (todo) => +todo.id !== +event.target.id
        );
        model.deleteTodo(+event.target.id);
      }
    });
  };

  const addTodo = () => {
    const inputbox = document.querySelector(view.domstr.inputbox);
    const inputbtn = document.querySelector(view.domstr.inputbutton);
    inputbox.addEventListener("keyup", (event) => {
      if (event.key === "Enter" && event.target.value.trim() !== "") {
        const todo = new model.Todo(event.target.value);
        model.addTodo(todo).then((todofromBE) => {
          state.todolist = [todofromBE, ...state.todolist];
        });
        event.target.value = "";
      }
    });
    inputbtn.addEventListener("click", (event) => {
      if (inputbox.value.trim() !== "") {
        const todo = new model.Todo(inputbox.value);
        model.addTodo(todo).then((todofromBE) => {
          state.todolist = [todofromBE, ...state.todolist];
        });
        event.target.value = "";
      }
    });
  };

  const updateTodoContent = () => {
    const todocontainer = document.querySelector(view.domstr.todocontainer);
    todocontainer.addEventListener("click", (event) => {
      const btnId = +event.target.id.substring(6, event.target.id.length);
      if (event.target.className === "updatebtn") {
        if (!state.updateStatus[btnId]) {
          state.updateStatus[btnId] = true;
          state.todolist = state.todolist;
        } else if (state.updateStatus[btnId]) {
          state.updateStatus = {};
          const inputstr = document.querySelector(
            view.domstr.inputid + btnId
          ).value;
          model.updateTodoContent(btnId, inputstr);
          state.todolist = state.todolist.map((todo) => {
            if (+todo.id === +btnId) todo.title = inputstr;
            return todo;
          });
        }
      }
    });
  };

  const updateTodoStatus = () => {
    const todocontainer = document.querySelector(view.domstr.todocontainer);
    todocontainer.addEventListener("click", (event) => {
      if (event.target.className === "statusbtn") {
        const btnId = +event.target.id.substring(6, event.target.id.length);
        state.todolist = state.todolist.map((todo) => {
          if (+todo.id === +btnId) {
            model.updateTodoStatus(+todo.id, !todo.completed);
            todo.completed = !todo.completed;
          }
          return todo;
        });
      }
    });
  };

  const init = () => {
    model.getTodos().then((todos) => {
      state.todolist = todos.reverse();
    });
  };

  const bootstrap = () => {
    init();
    deleteTodo();
    addTodo();
    updateTodoContent();
    updateTodoStatus();
  };

  return { bootstrap };
})(Model, View);

Controller.bootstrap();
