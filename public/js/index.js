const loading_container = document.querySelector('.loading-container');
const login_container = document.querySelector('.login-container');
const main_container = document.querySelector('.main-container');
const lobby_container = document.querySelector('.lobby-container');
const game_container = document.querySelector('.game-container');

let socket = io();
let _config = null;
let _client = null;

const login_form = login_container.querySelector('form');
const login_input_field = login_form.querySelector('input#login-name');
const login_submit_button = login_form.querySelector('button');

socket.on('config', function (config) {
  _config = config;

  // The user name input field has a minimum amount of characters.
  login_input_field.addEventListener('input', function (e) {   
    login_submit_button.disabled = this.value.length < _config.min_name_length;
  });

  login_submit_button.addEventListener('click', function (e) {
    // Send the login credentials.
    socket.emit('login', {
      'name': login_input_field.value
    });

    // Reenable the loading screen until the login has succeeded.
    loading_container.classList.remove('disabled');
  });

  // Disable the loading screen.
  loading_container.classList.add('disabled');
});

const intro_name_span = main_container.querySelector('span#intro-name');

socket.on('login_ack', function (client) {
  _client = client;
  intro_name_span.innerText = _client.name;

  // The login has been acknowledged, so show the main screen.
  main_container.classList.remove('disabled');
  login_container.classList.add('disabled');
  loading_container.classList.add('disabled');
});

(function () {
  let oldName = null;

  // Once the users starts renaming store the old name,
  // in case the new name would be too short.
  intro_name_span.addEventListener('focus', function (e) {
    oldName = this.innerText;
  });

  // When enter is pressed save the new name.
  intro_name_span.addEventListener('keypress', function (e) {
    if (e.which === 13) {
      e.preventDefault();
      const name = this.innerText;
      if (name.length >= _config.min_name_length)
        socket.emit('rename', name);
      else
        this.innerText = oldName;
      this.blur();
    }
  });
})();

const main_toolbar = main_container.querySelector('menu.main-toolbar');
const lobby_toolset = main_toolbar.querySelector('.lobby-toolset');
const game_toolset = main_toolbar.querySelector('.game-toolset');
const global_toolset = main_toolbar.querySelector('.global-toolset');
const create_game_button = lobby_toolset.querySelector('button.create-game');
const logout_button = global_toolset.querySelector('button.logout');

logout_button.addEventListener('click', function (e) {
  // Reset everything to the initial state.
  login_submit_button.disabled = true;
  login_input_field.value = '';
  loading_container.classList.remove('disabled');
  login_container.classList.remove('disabled');
  main_container.classList.add('disabled');
  lobby_container.classList.remove('disabled');
  game_container.classList.add('disabled');
  lobby_toolset.classList.remove('disabled');
  game_toolset.classList.add('disabled');

  socket.on('logout_ack', function () {
    _client = null;
    loading_container.classList.add('disabled');
  });
  socket.emit('logout');
});
