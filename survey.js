// mocking an array of objects of the different survey segments
var surveySegments = [
    {
      name: "rating",
      value: null,
      type: "radio",
      show: true,
      question: 
        {
          description: "Which of these colors do you like the least?",
          answers: [
            {
              text: "Red"
            },
            {
              text: "Green"
            },
            {
              text: "Blue"
            }
          ]
        }
    }, 
    {
      name: "satisfaction",
      value: null,
      type: "radio",
      show: false,
    },
    {
      name: "question_1",
      value: null,
      type: "radio",
      show: true,
      question: 
        {
          description: "What is your opinion on the overall look of this site?",
          answers: [
            {
              text: "Professional"
            },
            {
              text: "Good"
            },
            {
              text: "Normal"
            },
            {
              text: "Horrible"
            }
          ]
        }
    },
    {
      name: "question_2",
      value: null,
      type: "textarea",
      show: false,
      question: 
        {
          description: "Comments/Suggestions (Optional)"
        }
    },
    {
      name: "question_3",
      value: null,
      type: "radio",
      show: false
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
    },
    questionAnswerHtmlElements:{
      radio:"radio",
      checkbox:"checkbox",
      textarea:"textarea"
    }
};

var APIConfig = {
  // change this property to point to different 
  datasetEnvironmentToken : constants.datasetTokens.prod,
  host: "http://ec2-54-237-65-62.compute-1.amazonaws.com:8081"
};

function buildModalInDom(){
  // ensures the survey modal only gets built once
  if($("div#survey.modal").length == 0){
    $('body').append('<div class="modal fade" id="survey" tabindex="-1" role="dialog" aria-labelledby="survey" aria-hidden="true">'+
        '<div class="modal-dialog">'+
            '<div class="modal-content">'+
                '<div class="modal-header">'+
                    '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
                    '<h4 class="modal-title">Survey Test</h4>'+
                '</div>'+
                '<div class="modal-body" id="survey-modal-body">'+
                '</div>'+
                '<div class="modal-footer">'+
                    '<button type="button" class="btn btn-default"  onClick="hideSurvey()">Close</button>'+
                    '<button type="button" class="btn btn-primary" data-dismiss="modal" onClick="submitSurvey() & hideSurvey()">Send results</button>'+
                '</div>'+
            '</div><!-- /.modal-content -->'+
        '</div><!-- /.modal-dialog -->'+
    '</div>');

    addQuestions();
  }
  
}

function removeModalFromDom(){
  $('div#survey.modal').remove();
  $('div.modal-backdrop').remove();
}

function showSurvey(){
  buildModalInDom();
  $('#survey').modal('show');
}

function hideSurvey(){
  $('#survey').modal('hide');

  // waits for the modal to fade out and hide before calling global reset which will include removing the modal form the DOM
  setInterval(function(){
    reset();
  }, 500);
}

function addQuestions(){
    traverseSurveySegment(function(index){
      if(surveySegments[index].show){
        $('#survey-modal-body').append('<h3>'+ surveySegments[index].question.description + '</h3>');

        if(surveySegments[index].type != constants.questionAnswerHtmlElements.textarea){
          surveySegments[index].question.answers.forEach(function(answer){
            
              $('#survey-modal-body').append('<div class="radio"> ' + 
                '<input type="' + surveySegments[index].type + '" onClick="setSegment(name,value)"' + 
                'name="' + surveySegments[index].name +  
                '"value="' + answer.text + '">' + 
                answer.text + '<br/>' +
              '</div>');
          });
        }
        else{
          $('#survey-modal-body').append('<textarea class="form-control" rows="2" ></textarea>');
        }
      }
    });
}

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
  removeModalFromDom();
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