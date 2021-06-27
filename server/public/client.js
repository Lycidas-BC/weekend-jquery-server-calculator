$( document ).ready(onReady);

function onReady() {
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
    console.log(button);
    switch (button) {
        case "equals":
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
                console.log('posted item', response);
                equationGlobal="";
                $( "#equation" ).val(equationGlobal);
            })
            .catch( function(err) {
                console.log('failed to post', err);
            });
            break;
        case "plus":
            equationGlobal += " + ";
            $( "#equation" ).val(equationGlobal);
            break;
        case "minus":
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
    
} //end clearHistory

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