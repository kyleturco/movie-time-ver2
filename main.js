$('.table-container').hide();
var omdb_url = 'http://www.omdbapi.com/?';
var $movieSearch = $('.search-form');
var $searchBar = $('input[name=search]')[0];
var FIREBASE_URL = "https://movie-time.firebaseio.com/movie-time.json";
var $movieDetails = $(".movie-info-display");
var $table = $("table");

$.get(FIREBASE_URL, function(data){
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
    $.post(FIREBASE_URL, JSON.stringify(data), function(res){
      addTableDetail(data, res.name);
    })
  }, 'jsonp');
 });


function addTableDetail(data, id){
  console.log(id);
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
  var deleteURL = FIREBASE_URL.slice(0, -5) + '/' + $id + '.json';
  $.ajax({
  url: deleteURL,
  type: 'DELETE'
  });
})