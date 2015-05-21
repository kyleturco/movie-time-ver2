$('.table-container').hide();
var omdb_url = 'http://www.omdbapi.com/?';
var $movieSearch = $('.search-form');
var $searchBar = $('input[name=search]')[0];
var FIREBASE_URL = "https://movie-time.firebaseio.com/";
var $movieDetails = $(".movie-info-display");
var $table = $("table");
var fb = new Firebase(FIREBASE_URL);
var $loginBtn = $('.login-button');

var onLoggedOut = $('.onLoggedOut');
var onLoggedIn = $('.onLoggedIn');
var headerSection = $('.header-section');

//all the JS for the login process

//temporary password section

// $('.onTempPassword form').submit(function () {
//   var email = fb.getAuth().password.email;
//   var oldPw = $('.onTempPassword input:nth-child(1)').val();
//   var newPw = $('.onTempPassword input:nth-child(2)').val();
  
//   fb.changePassword({
//     email: email,
//     oldPassword: oldPw,
//     newPassword: newPw
//   }, function(err) {
//     if (err) {
//       alert(err.toString());
//     } else {
//       fb.unauth();
//     }
//   });
  
//   event.preventDefault();
// })

// $('.doResetPassword').click(function () {
//   var email = $('.onLoggedOut input[type="email"]').val();
  
//   fb.resetPassword({
//     email: email
//   }, function (err) {
//     if (err) {
//       alert(err.toString());
//     } else {
//       alert('Check your email!');
//     }
//   });
// });

// $('.doLogout').click(function () {
//   fb.unauth();
// })

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

fb.onAuth(function (authData){

  if (authData && authData.password) {
    onLoggedOut.removeClass('hidden');
    headerSection.addClass('hidden');
    $('.onLoggedIn h1').text(`What it is ${authData.password.email}? Enter a movie to get started`);
  } else {
    onLoggedIn.removeClass('hidden');
    onLoggedOut.addClass('hidden');
  }
});

$loginBtn.on('click', function() {
  console.log("hello!!!!");
  var authData = fb.getAuth();
  if (authData && authData.password) {
    onLoggedOut.addClass('hidden');
    headerSection.removeClass('hidden');
    } else {
      alert("Your password no work!");
    }
  });

// fb.onAuth(function (authData) {
//   var onLoggedOut = $('.onLoggedOut');
//   var onLoggedIn = $('.onLoggedIn');
//   var onTempPassword = $('.onTempPassword');

//   if (authData && authData.password.isTemporaryPassword) {
//     onTempPassword.removeClass('hidden');
//     onLoggedIn.addClass('hidden');
//     onLoggedOut.addClass('hidden');
//   } else if (authData) {
//     onLoggedIn.removeClass('hidden');
//     onLoggedOut.addClass('hidden');
//     onTempPassword.addClass('hidden');
//     $('.onLoggedIn h1').text(`Hello ${authData.password.email}`);    
//   } else {
//     onLoggedOut.removeClass('hidden');
//     onLoggedIn.addClass('hidden');
//     onTempPassword.addClass('hidden');
//   }
  
//   clearLoginForm();
// });


//all the JS for the movie part

$.get(`${FIREBASE_URL}/movie-time.json`, function(data){
  if (data===null){
    $table.hide();
  } else {
    Object.keys(data).forEach(function(id){
      addTableDetail(data[id], id);
    });
  }
});

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
 
$movieDetails.on('click', '.watch-button', function() {
  console.log("hello!!!");
  var movie = $searchBar.value;
  var url = omdb_url + "t=" + movie + "&r=json";
  $('.table-container').show();
  $.get(url, function (data) {
    $.post(`${FIREBASE_URL}/movie-time.json`, JSON.stringify(data), function(res){
      addTableDetail(data, res.name);
    })
  }, 'jsonp');
 });


function addTableDetail(data, id){
  var $table = $("table");
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
  console.log($id);
  $movie.remove();
  var deleteURL = `${FIREBASE_URL}/movie-time.json`.slice(0, -5) + '/' + $id + '.json';
  $.ajax({
  url: deleteURL,
  type: 'DELETE'
  });
})