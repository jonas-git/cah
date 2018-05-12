const login_form = document.querySelector('.login-container form');
const login_input_field = login_form.querySelector('input#user-name');
const login_submit_button = login_form.querySelector('button');

// The user name input field must contain at least one character:
const user_name_min_length = 1;
login_input_field.addEventListener('input', function (e) {   
  login_submit_button.disabled = this.value.length < user_name_min_length;
});

const socket = io(); // initialise a socket connection

login_submit_button.addEventListener('click', function (e) {
  // send the login credentials
  socket.emit('login', {
    'user-name': login_input_field.value
  });
});
