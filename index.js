
var https = require('https');

console.log('Loading function');

exports.handler = async (event, context, callback) => {
    // TODO implement
    console.log('Received event:',JSON.stringify(event, null,2));
    
    var intent = event.currentIntent.name;
    var slots = event.currentIntent.slots;
    
    var ticketType = slots.ticketType;
    
    if (intent == 'GetTickets') {
      var countTicket = slots.countTicket;
      var records = getTickets(ticketType, countTicket, callback);       // Get the records
    }
    else if (intent == 'LogTicket') {
      var shortDesc = slots.shortDesc;
       logTicket(ticketType, shortDesc, callback);
    }
    
    
    // const response = {
    //    statusCode: 200,
    //    body: JSON.stringify('Hello from Lambda!'),
    // };
    // return response;
};

// Get tickets from ServiceNow
//
function getTickets(recType, count, cb) {
  console.log('In getRecords function');
  
  var snowInstance = process.env.SERVICENOW_HOST;

  var options = {
      hostname: snowInstance,
      port: 443,
      path: '/api/now/table/' + recType + '?sysparm_query=ORDERBYDESCsys_updated_on&sysparm_limit='+count,
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Basic ' + Buffer.from(process.env.SERVICENOW_USERNAME + ":" + process.env.SERVICENOW_PASSWORD).toString('base64'),
      }
  };
  
  var request = https.request(options, function(response) {
      var returnData = '';
      console.log('In https.request');
      response.on('data', chunk => returnData += chunk);

      response.on('end', function() {
        var responseObj = JSON.parse(returnData);
        console.log("Body = " + JSON.stringify(responseObj));
        console.log ("sending response");
        if(responseObj.result){
          let speechText =  "Here are the " + count + " most recent incidents: ";
          for (let i = 0; i < count; i++) {
            var rec_number = i + 1;

            speechText += "Record " + (i+1) + " " + responseObj.result[i].short_description + ". ";
          }
          speechText += "End of tickets.";
          var retMsg = {
            'sessionAttributes': {},
            'dialogAction': {
              'type': 'Close',
              'fulfillmentState': 'Fulfilled',
              'message': {
                'contentType': 'PlainText',
                'content': speechText
              }
            }
          }
          cb(null, retMsg);
        }
        else{
          cb(null,JSON.parse('{"Error": "No tickets Found"}'));
        }
        
      });

      response.on('error', e => context.fail('error:' + e.message));
    });
   request.end();
}

function logTicket(recType, shortDesc, cb) {
  console.log('In logTicket function');
  
  var requestData = {
        "short_description": shortDesc,
        "created_by": 'me',
        "caller_id": 'me'
  };
  var postData = JSON.stringify(requestData);
    
  a
    
    var request = https.request(options, function (res) {
        var body = '';

        res.on('data', chunk => body += chunk);
        res.on('end', function() {
          var retMsg = {
            'sessionAttributes': {},
            'dialogAction': {
              'type': 'Close',
              'fulfillmentState': 'Fulfilled',
              'message': {
                'contentType': 'PlainText',
                'content': "Ticket created"
              }
            }
          }
          cb(null, retMsg);
        });
        res.on('error', e => context.fail('error:' + e.message));
    });

    request.write(postData);
    request.end();
}

