function autocomplete(inp, arr, history) {
  /*the autocomplete function takes three arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
    var a, b, h, ht, i, val = this.value;
    /*close any already open lists of autocompleted values*/
    closeAllLists();
    if (!val) { return false;}
    currentFocus = -1;
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the autocomplete container:*/
    this.parentNode.appendChild(a);
    /*for each item in the array...*/
    for (i = 0; i < arr.length; i++) {
      /*check if the item starts with the same letters as the text field value:*/
      if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        /*create a DIV element for each matching element:*/
        b = document.createElement("DIV");
        /*make the matching letters bold:*/
        b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
        b.innerHTML += arr[i].substr(val.length);
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
        b.addEventListener("click", function(e) {
            /*insert the value for the autocomplete text field:*/
            inp.value = this.getElementsByTagName("input")[0].value;
            /*close the list of autocompleted values,
            (or any other open lists of autocompleted values:*/
            closeAllLists();
        });
        a.appendChild(b);
      }
    }

    if (history != null){
      for(i = 0; i < history.length; i++){
      /* Create a DIV element for history */
      h = document.createElement("DIV");
      /* Add title to each value */
      h.setAttribute("class", "history");
      h.innerHTML = "<small>" + history[i].title + "</small>";
      /* Add timestamp to the showed values */
      ht = document.createElement("span");
      ht.setAttribute("class", "history-time");
      ht.innerHTML = history[i].time;
      h.appendChild(ht);
      a.appendChild(h);
      }
    }
  });


  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }

  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}

//create an array to save the input text
var searchHistory = [];

/* This function creates an array with the selected items and clean the input field */
function saveInputinArray(){
  var inputText = document.getElementById('myInput').value;
  var timeEvent = new Date();
  /* trim the date value to only date and time */
  var trimmedTime = timeEvent.toString().substr(0,21);
  /* push the title and time inside the searchHistory obj */
  searchHistory.push({title : inputText, time : trimmedTime});
  document.getElementById('myInput').value = '';
} 

/* Function to retrieve data from NYT servers */
function getMetadatafromNYT(callback){

  var jsonResp = null;
  var errorCode = NO_ERROR;

  /* create a call to the server of NYT with a specific api_key */
  var xmlhttp = new XMLHttpRequest();
  var api_key = "twZ9tqLTS8HLhHNgT8FTpfVAOlmMXCER";
  var url = "https://api.nytimes.com/svc/movies/v2/reviews/picks.json?api-key=" +  api_key; 

  xmlhttp.onreadystatechange = function(){
      //readyState == DONE and OK
      if (this.readyState == 4 && this.status == 200) {
          //Response in JSON form
          jsonResp = JSON.parse(this.responseText);
          errorCode = NO_ERROR;
          callback(jsonResp, errorCode);
      }else if(this.readyState == 4 && this.status != 200){
          //Problem on server side?
          jsonResponse = null;
          errorCode = ERROR_SERVER_PROBLEM;
          callback(jsonResp, errorCode);
      }
  }
  /* Send request */
  try{
      //true -> asynchronously
      xmlhttp.open("GET", url, true);
      xmlhttp.send();
  }catch(err){
      jsonResponse = null;
      errorCode = ERROR_INVALID_URL;
      callback(jsonResp, errorCode);
  }
}

const NO_ERROR = 0;
const ERROR_SERVER_PROBLEM = 1;
const ERROR_INVALID_URL = 2;

/* Create an array with the movies fetched from NYT and called the autocomplete function */
function loadTitle(movieTitles){
  let listOfMoviefromNYT = [];
  for (let results of movieTitles.results){
    listOfMoviefromNYT.push(results.display_title);
  }
  autocomplete(document.getElementById("myInput"), listOfMoviefromNYT, searchHistory);
}

/* Get the metadata from the NYT and invoke the loading title function or throw an error if any */
getMetadatafromNYT(function(nytData, errorCode){
    if(errorCode != NO_ERROR){
        /* On error, set to an appropriate state */
        setErrorState(errorCode);
    }else{
        /* Continue initialization */
        /* Set up and start main program */
        loadTitle(nytData);
    }
});



