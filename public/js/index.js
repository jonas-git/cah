const login_form = document.querySelector('.login-container form');
const login_input_field = login_form.querySelector('input#user-name');
const login_submit_button = login_form.querySelector('button');
const loading_container = document.querySelector('.loading-container');

const socket = io();
let game_config = null;

// The login submit button is disabled by default,
// since the input field does not contain anything yet.
login_submit_button.disabled = true;

socket.on('config', function (config) {
  game_config = config;

  // The user name input field has a minimum amount of characters.
  login_input_field.addEventListener('input', function (e) {   
    login_submit_button.disabled = this.value.length < config.min_name_length;
  });

  login_submit_button.addEventListener('click', function (e) {
    // Send the login credentials.
    socket.emit('login', {
      'user-name': login_input_field.value
    });
  });

  // Disable the loading screen.
  loading_container.classList.add('disabled');
});
