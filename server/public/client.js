$( document ).ready(onReady);

function onReady() {
    $('#numpad').on("click",".calculatorButton", buttonPush);
} //end onReady

function buttonPush() {
    console.log(this.id);
}