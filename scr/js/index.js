$(document).ready(function(){

  callPianistsAPI();

  // var to hold wikipedia content from API
  var pianistsArray = [];

  $('.search').on('keyup', function(e) {
    if (e.target.value.length) {
      var matchedPianists = _.filter(pianistsArray, function(pianist) {
        var pianistToLower = pianist.toLowerCase();
        if (pianistToLower.includes(e.target.value)) {
          return pianist;
        }
    });

      renderPianistsOnScreen(matchedPianists)

      // add listener
      $('.pianist_container').on('click', function() {
        formatPianistNameAndCallApi($(this));
      });
    }
  });
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function formatPianistNameAndCallApi(jQueryPianistContainer) {
    var pianistName = jQueryPianistContainer.text();
    var pianistNameForQuery = pianistName.trim().split(' ').join('_');
    callPianistAPI(pianistNameForQuery);
  }

  function parseRawWikipediaContent(rawStringContent) {
    // see pattern here: http://regexr.com/3er2s
    return rawStringContent.replace(new RegExp(/[[\]]|\u21b5|{{div col end}}|{{div col\|cols=3}}|:fr:Jean-Marc Savelli|Jean-Marc Savelli|==+[A-Z].*|==+[A-Z].*|\|.*|Wojciech Żywny|{{DEFAULTSORT:Classical Pianists}}|Category:Lists of musicians by instrument|Category:Classical pianists|Category:Classical music lists|\(.*/, 'g'), '');
  }

  function makePianistsArrayAndSort(parsedStringContent) {
    var arrayOfPianists = parsedStringContent.split('*');
    arrayOfPianists.sort();

    // remove first 2 indexes (↵) because regex did not catch them--look into it-- and the last index, the intro text for the page, which becomes the last index after sorting
    arrayOfPianists = arrayOfPianists.slice(2, arrayOfPianists.length-1); 
    return arrayOfPianists;
  }

  function callPianistAPI(pianistNameForQuery) {
    // query api for that pianist page
    $.ajax({
      type: "GET",
      url: "http://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles="+pianistNameForQuery+"&callback=?",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function (data, textStatus, jqXHR) {
        var pages = data.query.pages;
        var pianistText,
            pianistName;

        $.each(pages, function(index, data) {
          pianistText = data.extract;
          pianistName = data.title;
        });

        $('.pianist-text').text(pianistText);
        $('.pianist-name').text(pianistName);
      },
      error: function (errorMessage) {
        console.warn('Error accesing wikipedia API');
      }
    });
  }

  function callPianistsAPI() {
    // query api for pianists list
    $.ajax({
      type: "GET",
      url: "http://en.wikipedia.org/w/api.php?format=json&action=query&titles=List_of_classical_pianists&prop=revisions&rvprop=content&callback=?",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function (data, textStatus, jqXHR) {
        var rawStringContent = data.query.pages['2377133'].revisions[0]['*'];
        var parsedStringContent = parseRawWikipediaContent(rawStringContent);          
        pianistsArray = makePianistsArrayAndSort(parsedStringContent);
        renderPianistsOnScreen(pianistsArray);
      },
      error: function (errorMessage) {
        console.warn('Error accesing wikipedia API');
      }
    });
  }

  function renderPianistsOnScreen(pianistsArray) {
    var pianists = '';

    $.each(pianistsArray, function(index, pianist) {
      var red = getRandomInt(80, 200);
      var green = getRandomInt(80, 200);
      var blue = getRandomInt(80, 200);
      var background = 'rgb('+ red + ',' + green + ',' + blue + ')';
      pianists += '<span class="pianist_container" style="background:' + background + '">' + pianist + '</span>';
    });
    
    $('.pianists-wrapper').html(pianists);

    // add listener
    $('.pianist_container').on('click', function() {
      formatPianistNameAndCallApi($(this));
    });
  }
});