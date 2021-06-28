$( document ).ready(onReady);

function onReady() {
    postAndGet();
    $( "#numpad" ).on("click",".calculatorButton", buttonPush);
    $( "#equation" ).on("change", function( event ) {
        equationGlobal = $( "#equation" ).val();
        console.log(equationGlobal);
    })
    $( "#setOrderOfOperations" ).on("click", toggleOrderOfOperations)
    $( "#clearHistory" ).on("click",clearHistory);

} //end onReady

//globals initialized
let equationGlobal = "";
let orderGlobal = "leftToRight";

//remaining functions listed alphabetically

function buttonPush() {
    // get button function (listed in id after "_" )
    let button = this.id.substring(this.id.indexOf("_")+1);
    switch (button) {
        case "equals":
            postAndGet();
            break;
        case "plus":
            equationGlobal += " + ";
            $( "#equation" ).val(equationGlobal);
            break;
        case "minus":
            if (equationGlobal === "" || equationGlobal[equationGlobal.trim().length - 1])
            equationGlobal += " - ";
            $( "#equation" ).val(equationGlobal);
            break;
        case "times":
            equationGlobal += " * ";
            $( "#equation" ).val(equationGlobal);
            break;
        case "divide":
            equationGlobal += " / ";
            $( "#equation" ).val(equationGlobal);
            break;
        case "decimal":
            equationGlobal += ".";
            $( "#equation" ).val(equationGlobal);
            break;
        case "clear":
            equationGlobal = "";
            $( "#equation" ).val(equationGlobal);
            break;                 
        default:
            equationGlobal += button;
            $( "#equation" ).val(equationGlobal);
            break;
    }
    
} //end buttonPush

function clearHistory() {
    // send to server
    $.ajax({
        //type
        method: 'POST',
        url: '/clearHistory',
        data: { clearHistory: true } //data becomes req.body on server
    })
    .then( function(response) {
        // successful send case
        console.log('POST item:', response);
        equationGlobal="";
        $( "#equation" ).val(equationGlobal);
        postAndGet();
    })
    .catch( function(err) {
        console.log('failed to post', err);
    });
} //end clearHistory

function postAndGet() {
    if (equationGlobal != "") {
        // send to server
        $.ajax({
            //type
            method: 'POST',
            url: '/calculate',
            data: {
                equation: equationGlobal,
                order: orderGlobal
            } //data becomes req.body on server
        })
        .then( function(response) {
            // successful send case
            console.log('POST item:', response);
            equationGlobal="";
            $( "#equation" ).val(equationGlobal);
        })
        .catch( function(err) {
            console.log('failed to post', err);
        });
    }

    $.ajax({
        //type
        method: 'GET',
        url: '/calculate'
    })
    .then( function(response) {
        // successful send case
        console.log('GET item:', response);
        // empty last result and history list
        $( "#lastResult" ).empty();
        $( "#history" ).empty();

        if (response.length > 0){
            $( "#lastResult" ).append(`${response[0].equation} = ${response[0].answer} (evaluated ${response[0].order === "PEMDAS" ? "following PEMDAS" : "from left to right"})`);
            for (const historyItem of response) {
                $( "#history" ).append(`<li>${historyItem.equation} = ${historyItem.answer} (evaluated ${historyItem.order === "PEMDAS" ? "following PEMDAS" : "from left to right"})</li>`);
            }
        }
    })
    .catch( function(err) {
        console.log('failed to post', err);
    });
}

function toggleOrderOfOperations() {
    const el = $('#setOrderOfOperations');
    if (el.html() === "Evaluate left to right") {
        el.html("Follow PEMDAS");
        orderGlobal = "PEMDAS";
    } else {
        el.html("Evaluate left to right");
        orderGlobal = "leftToRight";
    }
} //end toggleOrderOfOperations