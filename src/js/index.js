$(document).ready(() => {
  const regexForPianistsPage = /[[\]]|\u21b5|{{div col end}}|{{div col\|cols=3}}|:fr:Jean-Marc Savelli|Jean-Marc Savelli|==+[A-Z].*|==+[A-Z].*|\|.*|Wojciech Żywny|{{DEFAULTSORT:Classical Pianists}}|Category:Lists of musicians by instrument|Category:Classical pianists|Category:Classical music lists|\(.*/;
  callPianistsListApi();

  // let to hold wikipedia content from API
  let pianistsArray = [];

  $('.search').on('keyup', (e) => {
    if (e.target.value.length) {
      let matchedPianists = _.filter(pianistsArray, (pianist) => {
        let pianistToLower = pianist.toLowerCase().trim();
        let searchPattern = new RegExp('^' + e.target.value + '| ' + e.target.value); // matches beginning of string or string after space
        if (searchPattern.test(pianistToLower)) {
          return pianist;
        }
      });

      renderPianists(matchedPianists)

      // add listener
      // when using '=>' $(this) is bound to window, not to element that has the event
      $('.pianist_container').on('click', () => formatPianistNameAndCallApi(($(event.currentTarget))));
    } else {
      callPianistsListApi();
    }
  });

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function formatPianistNameAndCallApi(jQueryPianistContainer) {
    let pianistName = jQueryPianistContainer.text();
    let pianistNameForQuery = pianistName.trim().split(' ').join('_');
    callPianistAPI(pianistNameForQuery);
  }

  function parseRawWikipediaContent(rawStringContent) {
    // see pattern here: http://regexr.com/3er2s
    return rawStringContent.replace(new RegExp(regexForPianistsPage, 'g'), '');
  }

  function makePianistsArrayAndSort(parsedStringContent) {
    let arrayOfPianists = parsedStringContent.split('*');
    arrayOfPianists.sort();

    // remove first 2 indexes (↵) because regex did not catch them--look into it-- and the last index, the intro text for the page, which becomes the last index after sorting
    arrayOfPianists = arrayOfPianists.slice(2, arrayOfPianists.length-1);
    return arrayOfPianists;
  }

  // query api for that pianist page
  function callPianistAPI(pianistNameForQuery) {
    $.ajax({
      type: "GET",
      url: "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles="+pianistNameForQuery+"&callback=?",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: (data, textStatus, jqXHR) => {
        let pages = data.query.pages;
        let pianistText,
            pianistName;

        $.each(pages, (index, data) => {
          pianistText = data.extract;
          pianistName = data.title;
        });

        $('.pianist-text').text(pianistText);
        $('.pianist-name').text(pianistName);
      },
      error: (errorMessage) => console.warn('Error accesing wikipedia API')
    });
  }

  // query api for pianists list
  function callPianistsListApi() {
    $.ajax({
      type: "GET",
      url: "https://en.wikipedia.org/w/api.php?format=json&action=query&titles=List_of_classical_pianists&prop=revisions&rvprop=content&callback=?",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: (data, textStatus, jqXHR) => {
        let rawStringContent = data.query.pages['2377133'].revisions[0]['*'];
        let parsedStringContent = parseRawWikipediaContent(rawStringContent);
        pianistsArray = makePianistsArrayAndSort(parsedStringContent);
        renderPianists(pianistsArray);
      },
      error: (errorMessage) => console.warn('Error accesing wikipedia API')
    });
  }

  function renderPianists(pianistsArray) {
    let pianists = '';

    $.each(pianistsArray, (index, pianist) => {
      let red = getRandomInt(80, 200);
      let green = getRandomInt(80, 200);
      let blue = getRandomInt(80, 200);
      let background = 'rgb('+ red + ',' + green + ',' + blue + ')';
      pianists += '<span class="pianist_container" style="background:' + background + '">' + pianist + '</span>';
    });

    let content = pianists ? pianists : '<p class="feedback_message">No matches found for this search.</p>';

    $('.pianists-wrapper').html(content);

    // add listener
    // when using '=>' $(this) is bound to window, not to element that has the event
    $('.pianist_container').on('click', () => formatPianistNameAndCallApi($($(event.currentTarget))));
  }
});


