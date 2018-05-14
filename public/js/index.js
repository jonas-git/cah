const loading_container = document.querySelector('.loading-container');
const login_container = document.querySelector('.login-container');
const main_container = document.querySelector('.main-container');
const lobby_container = document.querySelector('.lobby-container');
const game_container = document.querySelector('.game-container');

const login_form = login_container.querySelector('form');
const login_input_field = login_form.querySelector('input#login-name');
const login_submit_button = login_form.querySelector('button');

const intro_name_span = main_container.querySelector('span#intro-name');

const main_toolbar = main_container.querySelector('menu.main-toolbar');
const lobby_toolset = main_toolbar.querySelector('.lobby-toolset');
const game_toolset = main_toolbar.querySelector('.game-toolset');
const global_toolset = main_toolbar.querySelector('.global-toolset');

const create_game_button = lobby_toolset.querySelector('button.create-game');
const leave_game_button = game_toolset.querySelector('button.leave-game');
const theme_selector = global_toolset.querySelector('select#theme-selector');

const socket = io();
let _config = null;
let _client = null;
const state = {
  connected: false,
  reconnected: false
};

socket.on('error', function (error) { console.error('SOCK_ERR', error); });
socket.on('connect', function () { state.connected = true; });
socket.on('reconnect', function (attempt) { state.connected = state.reconnected = true; });
socket.on('disconnect', function () { state.connected = state.reconnected = false; });


// Before anything the application waits for the client config
// to arrive via the socket connection. 
socket.on('config', function (config) {
  console.log('config', arguments);
  _config = config;

  // Complete the character amount hint in the placeholder.
  login_input_field.placeholder = login_input_field.placeholder.replace(/#/, _config.min_name_length);

  // Restrict the number of characters to the config's minimum.
  login_input_field.addEventListener('input', function (e) {   
    login_submit_button.disabled = this.value.length < _config.min_name_length;
  });

  // Event Handler for when the login button is clicked.
  login_submit_button.addEventListener('click', function (e) {
    socket.emit('login', {
      credentials: {
        name: login_input_field.value
      }
    }, function (data, error) {
      if (error) {
        console.log('ERR "', error.message, '"');
        loading_container.classList.add('disabled');
        return false;
      }

      _client = data.client;
      intro_name_span.innerText = _client.name;
      main_container.classList.remove('disabled');
      login_container.classList.add('disabled');
      loading_container.classList.add('disabled');
    });

    loading_container.classList.remove('disabled');
  });

  // Do not affect the loading screen by the theme during the initial page load,
  // otherwise it might rapidly change color before the transition ended.
  if (!state.reconnected) {
    loading_container.classList.add('no-theme');
    loading_container.addEventListener('transitionend', function onAfterTransition(e) {
      loading_container.removeEventListener('transitionend', onAfterTransition);
      loading_container.classList.remove('no-theme');
    });
  }

  // Add all available themes to the theme selector.
  for (index in _config.themes) {
    const option = document.createElement('option');
    option.text = _config.themes[index].name;
    theme_selector.add(option, index);
  }

  // Use the theme of the last session (stored as a cookie)
  // or fall back to the default theme.
  const theme_index = Cookies.get('theme_index') || _config.default_theme_index;
  document.body.classList.add(_config.themes[theme_index].css_class);
  theme_selector.selectedIndex = theme_index;

  // Event handler for changes in the theme selector.
  (function () {
    let old_theme_index = theme_index;
    theme_selector.addEventListener('change', function (e) {
      const theme_index = this.selectedIndex;
      document.body.classList.remove(_config.themes[old_theme_index].css_class);
      document.body.classList.add(_config.themes[theme_index].css_class);
      Cookies.set('theme_index', theme_index);
      old_theme_index = theme_index;
    });
  })();

  // Everything's done. Hide the loading screen.
  loading_container.classList.add('disabled');
});


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

  socket.emit('logout', {}, function (data, error) {
    loading_container.classList.add('disabled');
    _client = null;
  });
});


(function () {
  let old_name = null;

  // Once the users starts renaming store the old name,
  // in case the new name is considered invalid afterwards.
  intro_name_span.addEventListener('focus', function (e) {
    old_name = this.innerText;
  });

  // Once the span is blurred, save the new name.
  intro_name_span.addEventListener('blur', function (e) {
    const name = this.innerText;
    if (name.length >= _config.min_name_length)
      if (name.length === old_name.length && name !== old_name || true)
        socket.emit('rename', {
          name: name
        }, function (data, error) {
          if (error) {
            intro_name_span.innerText = data.name;
            console.log('ERR "', error.message, '"');
            return false;
          }
        });
    else
      this.innerText = old_name;
  });

  // When enter is pressed blur the span.
  intro_name_span.addEventListener('keypress', function (e) {
    if (e.which === 13) {
      e.preventDefault();
      this.blur();
    }
  });
})();


create_game_button.addEventListener('click', function (e) {
  loading_container.classList.remove('disabled');

  // Switch the toolset and the shown subcontainer.
  lobby_toolset.classList.add('disabled');
  game_toolset.classList.remove('disabled');
  lobby_container.classList.add('disabled');
  game_container.classList.remove('disabled');

  socket.emit('game_create', {}, function (data, error) {
    // ...
    loading_container.classList.add('disabled');
  });
});


leave_game_button.addEventListener('click', function (e) {
  loading_container.classList.remove('disabled');

  // Switch the toolset and the shown subcontainer.
  lobby_toolset.classList.remove('disabled');
  game_toolset.classList.add('disabled');
  lobby_container.classList.remove('disabled');
  game_container.classList.add('disabled');

  socket.emit('game_leave', {}, function (data, error) {
    // ...
    loading_container.classList.add('disabled');
  });
});

