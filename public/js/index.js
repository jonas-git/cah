const loading_container = document.querySelector('.loading-container');
const login_container = document.querySelector('.login-container');
const lobby_container = document.querySelector('.lobby-container');

const login_form = login_container.querySelector('form');
const login_input_field = login_form.querySelector('input#name');
const login_submit_button = login_form.querySelector('button');

const lobby_name_span = lobby_container.querySelector('span#lobby-intro-name');

const socket = io();
let _config = null;
let _client = null;

socket.on('config', function (config) {
  _config = config;

  // The user name input field has a minimum amount of characters.
  login_input_field.addEventListener('input', function (e) {   
    login_submit_button.disabled = this.value.length < config.min_name_length;
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

socket.on('login_success', function (client) {
  _client = client;
  lobby_name_span.innerText = client.name;

  (function () {
    let oldName = null;
    lobby_name_span.addEventListener('focus', function (e) {
      oldName = this.innerText;
    });
    // When enter is pressed save the new name
    lobby_name_span.addEventListener('keypress', function (e) {
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

  lobby_container.classList.remove('disabled');
  login_container.classList.add('disabled');
  loading_container.classList.add('disabled');
});
