$( document ).ready(onReady);

function onReady() {
    $('#numpad').on("click",".calculatorButton", buttonPush);
    $('#clearHistory').on("click",clearHistory);

} //end onReady

    //remaining functions listed alphabetically

function buttonPush() {
    console.log(this.id);
    let button = this.id.substring(this.id.indexOf("_")+1);
    console.log(button);

    // send to server
    $.ajax({
        //type
        method: 'POST',
        url: '/calculate',
        data: {
            button: button
        } //data becomes req.body on server
    })
    .then( function(response) {
        // successful send case
        console.log('posted item', response);
    })
    .catch( function(err) {
        console.log('failed to post', err);
    })
} //end buttonPush

function clearHistory() {
    
} //end clearHistory