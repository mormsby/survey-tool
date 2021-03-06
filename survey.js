// mocking an array of objects of the different survey segments
var surveySegments = {
  title: "This Is My Survey",
  segments: [
    {
      name: "rating",
      value: null,
      type: "radio",
      show: true,
      question: 
        {
          description: "Give your rating on this site.",
          answers: [
            {
              text: "1 Star",
              value: "1_star"
            },
            {
              text: "2 Star",
              value: "2_star"
            },
            {
              text: "3 Star",
              value: "3_star"
            },
            {
              text: "4 Star",
              value: "4_star"
            },
            {
              text: "5 Star",
              value: "5_star"
            }
          ]
        }
    }, 
    {
      name: "satisfaction",
      value: null,
      type: "radio",
      show: true,
      question: 
        {
          description: "How satisfied are you by the services provided on this site?",
          answers: [
            {
              text: "Very Satisfied",
              value: "very_satisfied"
            },
            {
              text: "Just Satisfied",
              value: "just_satisfied"
            },
            {
              text: "Not Satisfied At All",
              value: "not_satisfied"
            }
          ]
        }
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
              text: "Professional",
              value: "Professional"
            },
            {
              text: "Good",
              value: "Good"
            },
            {
              text: "Normal",
              value: "Normal"
            },
            {
              text: "Horrible",
              value: "Horrible"
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
  ]
};

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

// clones surveySegments and assigns it to originalSurveySegments
var originalSurveySegments =  JSON.parse( JSON.stringify(surveySegments));

var APIConfig = {
  // change this property to point to different 
  datasetEnvironmentToken : constants.datasetTokens.prod,
  host: "http://ec2-54-237-65-62.compute-1.amazonaws.com:8081"
};

function buildModalInDom(){
  // ensures the survey modal only gets built once
  if($("div#survey.modal").length == 0){
    // data-backdrop is set to static so that the user cannot click outside the modal and exit it
    $('body').append('<div class="modal fade" id="survey" tabindex="-1" data-backdrop="static" role="dialog" aria-labelledby="survey" aria-hidden="true">'+
        '<div class="modal-dialog">'+
            '<div class="modal-content">'+
                '<div class="modal-header">'+
                    '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
                    '<h2 class="modal-title">' + surveySegments.title + '</h2>'+
                '</div>'+
                '<div class="modal-body" id="survey-modal-body">'+
                '</div>'+
                '<div class="modal-footer">'+
                    '<button type="button" class="btn btn-default"  onClick="hideSurvey()">Close</button>'+
                    '<button type="button" id="send-survey-button" class="btn btn-primary" data-dismiss="modal" onClick="submitSurvey() & hideSurvey()">Send results</button>'+
                '</div>'+
            '</div>'+
        '</div>'+
    '</div>');

    $('#survey-modal-body').append('<div class="survey-question"></div>');
    addQuestions();

    $('#send-survey-button').prop('disabled', true);

    // executes the falling function immediately after the modal hide function has been called
    // this is placed here to capture if the user exits the modal by the escape key, closing the window or clicking outside the modal window
    $('#survey').on('hide.bs.modal', function (e) {
      // calling global reset which will include removing the modal from the DOM
      reset();
    });
  }
}

/*
  Responsible for cleaning the DOM of the modal
*/
function removeModalFromDom(){
  $('div#survey.modal').remove();
}

/*
  Shows the survey by first building it in the DOM then executing a call to Bootstrap API to show it
*/
function showSurvey(){
  buildModalInDom();
  $('#survey').modal('show');
}

/*
  Hides the survey and resets the survey for next use
*/
function hideSurvey(){
  $('#survey').modal('hide');
}

/*
  Uses the traverseSurveySegment function in which to iterate through all the questions available for this survey and build them in the DOM
*/
function addQuestions(){
  var questionNumber = 0;
    traverseSurveySegment(function(index){
      
      if(surveySegments.segments[index].show){
        // question gets placed here
        questionNumber++;
        $('.survey-question').append('<h3>'+ questionNumber + '. ' + surveySegments.segments[index].question.description + '</h3>');

        // answers get placed here 
        if(surveySegments.segments[index].type != constants.questionAnswerHtmlElements.textarea){
          // supports radio buttons and checkboxes to date
          surveySegments.segments[index].question.answers.forEach(function(answer){
            
              $('.survey-question').append('<div class="radio"> ' + 
                '<input type="' + surveySegments.segments[index].type + '" onClick="setSegment(name,value)"' + 
                'name="' + surveySegments.segments[index].name +  
                '"value="' + answer.value + '">' + 
                answer.text + '<br/>' +
              '</div>');
          });
        }
        else{
          // supports text area
          // TODO: have the API call that sends back the results of the survey support data captured in text area
          $('.survey-question').append('<textarea class="form-control" rows="2" ></textarea>');
        }
        $('.survey-question').append('<br/>');

      }
    });
}

/*
    Responsible for submitting the user's response on the survey to an API
*/
function submitSurvey(){
    
    // building the URL for the data to be submitted to
    var submitToApiEndpt = APIConfig.host + constants.collectorInterface.profile + "?dataset=" + APIConfig.datasetEnvironmentToken + "&profile_id=a28d3f90da0e11e3aea722000ab93e79";

    // add the survey segments that were set to the query string of the API call
    traverseSurveySegment(function(index){
        if(surveySegments.segments[index].value != null){
            submitToApiEndpt = submitToApiEndpt + "&" + surveySegments.segments[index].name + "=" + surveySegments.segments[index].value;
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
    for (var index in surveySegments.segments){
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
        if(name == surveySegments.segments[index].name){
          surveySegments.segments[index].value = value;
        }
    });

    // if it is able to submit then toggle on submit button
    if(isReadyToSubmit()){
      $('#send-survey-button').prop('disabled', false);
    }
    else{
      $('#send-survey-button').prop('disabled', true);
    }
}

/*
    Add all reset functions here so that there can be one point to reset any values that need to be
*/
function reset(){
  removeModalFromDom();

  // clones originalSurveySegments and assigns it to surveySegments
  surveySegments =  JSON.parse( JSON.stringify(originalSurveySegments));
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

/*
    Checks if all the available questions in the survey have been answered
*/
function isReadyToSubmit(){
  for (var index in surveySegments.segments){
    if(surveySegments.segments[index].show == true && surveySegments.segments[index].value == null){
        return false;
    }
  };
  return true;
}

function setSurveySegment(newSurveySegments){
  surveySegments = newSurveySegments
}

