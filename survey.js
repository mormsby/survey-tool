// mocking an array of objects of the different survey segments
var surveySegments = [
    {
      name: "rating",
      value: null
    }, 
    {
      name: "satisfaction",
      value: null
    },
    {
      name: "question_1",
      value: null
    },
    {
      name: "question_2",
      value: null
    },
    {
      name: "question_3",
      value: null
    }
];

var constants = {
    collectorInterface:{
      identify:"/identify.gif",
      profile:"/profile.gif"
    },
    datasetTokens:{
      dev:"c2e02c92c73211e3aaf844fb42fffe8c",
      staging: "b6822676c73211e3aaf844fb42fffe8c",
      prod : "afc0a6c8c73211e3aaf844fb42fffe8c"
    }
};

var APIConfig = {
  // change this property to point to different 
  datasetEnvironmentToken : constants.datasetTokens.prod,
  host: "http://ec2-54-237-65-62.compute-1.amazonaws.com:8081"
};

/*
    Responsible for submitting the user's response on the survey to an API
*/
function submitSurvey(){

    // building the URL for the data to be submitted to
    var submitToApiEndpt = APIConfig.host + constants.collectorInterface.profile + "?dataset=" + APIConfig.datasetEnvironmentToken;

    // add the survey segments that were set to the query string of the API call
    traverseSurveySegment(function(index){
        if(surveySegments[index].value != null){
            submitToApiEndpt = submitToApiEndpt + "&" + surveySegments[index].name + "=" + surveySegments[index].value;
        }
    });

    // executing the sending of data to the API
    createDataElement(submitToApiEndpt);
}

/*
    @param callBackFn - a function that will execute on each element of the surveySegment array
    Loops through the surveySegment array and execute a call back function on each element in the array
*/
function traverseSurveySegment(callBackFn){
    for (var index in surveySegments){
      callBackFn(index);
    }
}

/*
    @param name - the name of the segment that is to be set
    @param value - the new value for the segment
    Calls the traverseSurveySegment and passes in a function to look for the segment passed in and assign the new value to it
*/
function setSegment(name, value){
    traverseSurveySegment(function(index){
        if(name == surveySegments[index].name){
          surveySegments[index].value = value;
        }
    });
}

/*
    Add all reset functions here so that there can be one point to reset any values that need to be
*/
function reset(){
  
}

/*
    @param endpointUrl - the URL that the request is being made to
    Creates an image tag that is used to make the .gif http request
*/
function createDataElement(endpointUrl){
    //Gets the head section of the page
    var headerElement = document.getElementsByTagName('head')[0];
    //Creates the script tag for member data inside the head
    var dataElement = document.createElement('img');     
    //dataElement.type = 'text/javascript';
    dataElement.src=endpointUrl;
    dataElement.onload = function() { //removes the tag when finished.
      //headerElement.removeChild(dataElement);
    };
    headerElement.appendChild(dataElement);
}