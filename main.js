// $('.table-container').hide();
var omdb_url = 'http://www.omdbapi.com/?';
var $movieSearch = $('.search-form');
var $searchBar = $('input[name=search]')[0];
var FIREBASE_URL = "https://movie-time.firebaseio.com/";
var $movieDetails = $(".movie-info-display");
var $table = $("table");
var fb = new Firebase(FIREBASE_URL);
var $loginBtn = $('.login-button');
var $logoutBtn = $('doLogout');
var $table = $("table");
var $tableHeader = $(".table-header");

var onLoggedOut = $('.onLoggedOut');
var onLoggedIn = $('.onLoggedIn');
var headerSection = $('.header-section');
// var uid = fb.getAuth().uid;
// var token = fb.getAuth().token;
// var postUrl = `${FIREBASE_URL}/users/${uid}/movie-time.json?auth=${token}`;

/////////


$('.onTempPassword form').submit(function () {
  var email = fb.getAuth().password.email;
  var oldPw = $('.onTempPassword input:nth-child(1)').val();
  var newPw = $('.onTempPassword input:nth-child(2)').val();

  fb.changePassword({
    email: email,
    oldPassword: oldPw,
    newPassword: newPw
  }, function(err) {
    if (err) {
      alert(err.toString());
    } else {
      fb.unauth();
    }
  });

  event.preventDefault();
})

$('.doResetPassword').click(function () {
  var email = $('.onLoggedOut input[type="email"]').val();

  fb.resetPassword({
    email: email
  }, function (err) {
    if (err) {
      alert(err.toString());
    } else {
      alert('Check your email!');
    }
  });
});

$('.doLogout').click(function () {
  window.location.reload();
  fb.unauth();

})

$('.doRegister').click(function () {
  var email = $('.onLoggedOut input[type="email"]').val();
  var password = $('.onLoggedOut input[type="password"]').val();

  fb.createUser({
    email: email,
    password: password
  }, function (err, userData) {
    if (err) {
      alert(err.toString());
    } else {
      doLogin(email, password);
    }
  });

  event.preventDefault();
});

$('.onLoggedOut form').submit(function () {
  var email = $('.onLoggedOut input[type="email"]').val();
  var password = $('.onLoggedOut input[type="password"]').val();

  doLogin(email, password);
  event.preventDefault();
});

function clearLoginForm () {
  $('input[type="email"]').val('');
  $('input[type="password"]').val('');
}

function saveAuthData (authData) {
  $.ajax({
    method: 'PUT',
    url: `${FIREBASE_URL}/users/${authData.uid}/profile.json`,
    data: JSON.stringify(authData)
  });
}

function doLogin (email, password, cb) {
  fb.authWithPassword({
    email: email,
    password: password
  }, function (err, authData) {
    if (err) {
      alert(err.toString());
    } else {
      saveAuthData(authData);
      typeof cb === 'function' && cb(authData);
    }
  });
}

function getUserData (cb) {
  var uid = fb.getAuth().uid;
  var token = fb.getAuth().token;
  var getUrl = `${FIREBASE_URL}/users/${uid}/movie-data.json?auth=${token}`;
  $.get(getUrl, cb);
  console.log("what does this function do?")
}

function getMovies () {
  $.get(`${FIREBASE_URL}users/${fb.getAuth().uid}/movie-time.json?auth=${fb.getAuth().token}`, function(data){
    Object.keys(data).forEach(function(id){
      addTableDetail(data[id], id);
    });
  });
}

fb.onAuth(function (authData) {
  var onLoggedOut = $('.onLoggedOut');
  var onLoggedIn = $('.onLoggedIn');
  var onTempPassword = $('.onTempPassword');
  var headerUser = $('.header-user-section');

  if (authData && authData.password.isTemporaryPassword) {
    onTempPassword.removeClass('hidden');
    onLoggedIn.addClass('hidden');
    onLoggedOut.addClass('hidden');
    headerUser.removeClass('hidden');
  } else if (authData) {
    onLoggedIn.removeClass('hidden');
    headerUser.removeClass('hidden');
    onLoggedOut.addClass('hidden');
    onTempPassword.addClass('hidden');
    $table.show();
    $tableHeader.show();
    $('.onLoggedIn h2').text(`Hello ${authData.password.email}!`);
    $('.header h2').text(`${authData.password.email}`);
    getMovies();
  } else {
    onLoggedOut.removeClass('hidden');
    onLoggedIn.addClass('hidden');
    onTempPassword.addClass('hidden');
    headerUser.addClass('hidden');
    $table.hide();
    $tableHeader.hide();
  }

  clearLoginForm();
});



/////////


$movieSearch.on('submit', function() {
  var movie = $searchBar.value;
  var URL = omdb_url + "t=" + movie + "&r=json";
  console.log(URL);
  $.get(URL, function(data) {
    addMovieDetail(data);
  })
  return false;
})

function addMovieDetail(data, id) {
  var $target = $(".movie-detail");
  var $targetPoster = $(".movie-poster");

    if (data.Title === undefined) {
    $target.empty();
    $target.append("<h2>Sorry friend, that's not a movie!</h2>");
  } else {
    var poster = data.Poster === "N/A" ? "http://i.imgur.com/rXuQiCm.jpg?1" : data.Poster;
    $target.empty();
    $targetPoster.empty();
    $targetPoster.append("<img src=" + poster + "></img>");
    $target.append("<h2 class='h2 movie-title'>" + data.Title + "</h2>");
    $target.append("<h3>" + data.Year + "</h3>");
    $target.append("<h3>" + "Rated: " + data.Rated + "</h3>");
    $target.append("<p>" + data.Plot + "</p>");
    $target.append("<input class='btn btn-default watch-button' type='submit' value='Add Movie to List'></input>");

  }
}

$movieDetails.on('click', '.watch-button', function () {
  var movie = $searchBar.value;
  var URL = omdb_url + "t=" + movie + "&r=json";
  var uid = fb.getAuth().uid;
  var token = fb.getAuth().token;
  var postUrl = `${FIREBASE_URL}users/${fb.getAuth().uid}/movie-time.json?auth=${fb.getAuth().token}`;
  // $('.table-container').show();
  $.get(URL, function (data) {
    $.post(postUrl, JSON.stringify(data), function (res) {
      addTableDetail(data, res.name);
    })

    clearForms();
    // res = { name: '-Jk4dfDd123' }
  });
  event.preventDefault();
})


function addTableDetail(data, id){
  $table.append("<tr></tr>");
  var $target = $("tr:last");
  $target.attr("data-id", id);
  var poster = data.Poster === "N/A" ? "http://i.imgur.com/rXuQiCm.jpg?1" : data.Poster;
  $target.append("<td><img class='watch-list-poster' src=" + poster + "></img></td>");
  $target.append("<td class='movie-title-list'>"+ data.Title +"</td>");
  $target.append("<td>"+ data.Year +"</td>");
  $target.append("<td>"+ data.imdbRating +"</td>");
  $target.append("<button class='btn btn-danger'>"+ "x" +"</button>");
}

$table.on('click', 'button', function(){
  var $movie = $(this).closest('tr');
  var $id = $movie.attr('data-id');
  $movie.remove();
  var deleteURL = `${FIREBASE_URL}users/${fb.getAuth().uid}/movie-time` + '/' + $id + '.json';
  $.ajax({
  url: deleteURL,
  type: 'DELETE'
  });
})


//-JqDfGhzJZM6zdgFybuo
//

