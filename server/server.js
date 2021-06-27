// bring in express
const express = require('express');
const app = express();
const PORT = 5000;


// listen on 5000
app.listen(PORT, () => {
  console.log('listening on PORT', PORT);
});

// serve static files (html, css, js, images)
app.use( express.static('server/public'));
// processing the data
app.use( express.urlencoded({extended: true}));
app.use( express.json() );

//globals
let historyArray = [];

//POST and GET routes
app.post('/calculate', (req, res) => {
  console.log('in post for calculate', req.body);

  let answer = evaluate(req.body.equation, req.body.order);

  //add new answer to front of history array, so that most recent equations print first
  historyArray.unshift({
      equation: req.body.equation,
      order: req.body.order,
      answer: answer
  });

  // always respond
  res.sendStatus(201); // 201 is good!
});

app.get('/calculate', function(req, res) {
    console.log('Request method: ', req.method);
    console.log('send:', historyArray);
    // Send a response back;
    res.send(historyArray);
  });

function evaluate(equation, order) {
    console.log(equation, order);
    
    //check for parentheses
    if (equation.indexOf("(")>-1) {
        if (order==="leftToRight"){
            //if evaluating left to right, remove parentheses
            return evaluate(equation.replace(/[\(\)]/g,""),order);
        } else {
            //if order is PEMDAS, make sure parentheses gets closed
            if (equation.indexOf(")") === -1) {
                return "error: unclosed parentheses";
            } else {
                //replace parenthetical with evaluate(parenthetical)
                const openParenIndex = equation.indexOf("(");
                const closingParenIndex = equation.indexOf(")",openParenIndex);
                const parentheses = equation.substring(openParenIndex + 1, closingParenIndex);
                const evaluateParentheses = evaluate(parentheses)
                if (evaluateParentheses.indexOf("error") > -1) {
                    //if parentheses returns an error, pass it on
                    return evaluateParentheses;
                } else {
                    return evaluate(equation.replace(parentheses, evaluateParentheses));
                }
            }
        }
    }

    //.split to change equation string into array of numbers and operators
    //reg ex [-+_*/] matches operators, g makes it so they don't get removed
    //filter array for empty strings
    let equationArray = equation.split(/([-+_*/])/g);
    equationArray = equationArray.filter(element => (element != /\s/g ));
    console.log(equationArray);
    
    //validate equationArray:

    //if equation starts with +, *, or / return error
    //if equation starts with -, check second element
    //if equation ends with -, +, *, or / return error
    let indexFromBack = equationArray.length - 1;
    if (
        equationArray[0].search(/[+_*/]/) > -1 || 
        equationArray[indexFromBack].search(/[-+_*/]/) > -1 ||
        (equationArray[0].indexOf("-") > -1 && equationArray[1].search(/[+_*/]/) > -1)) {
        return "error: cannot begin or end with an operation (unless making a number negative)"
    }

    //check for 
    //I'm incrementing through the array backwards, because I plan on splicing things out and I don't want to mess up the array indices
    while (indexFromBack >= 0) {
        console.log("element, element is operation", equationArray[indexFromBack], equationArray[indexFromBack].search(/[+_*/]/) > -1);
        if (equationArray[indexFromBack] === "-" && equationArray[indexFromBack+1] === "-") {
            //if we have two negatives in a row, splice them out
            console.log('double negative:',equationArray, equationArray[indexFromBack], equationArray[indexFromBack]);
            if (equationArray[indexFromBack-1] === "-" && equationArray[indexFromBack+2]){
                //if there's a number before and after the double negative, replace it with a +
                equationArray[indexFromBack] = "+";
                equationArray.splice(indexFromBack+1, 1);
            } else {
                //otherwise, just splice out the double negative
                equationArray.splice(indexFromBack,2);
            }
        } else if (equationArray[indexFromBack].search(/[-+_*/]/) > -1 && equationArray[indexFromBack+1].search(/[-+_*/]/) > -1) {
            //check for two operations in a row
            if (equationArray[indexFromBack+1] === "-") {
                //if the second one is "-", make the next value negative and splice it out
                equationArray[indexFromBack+2] = "-" + equationArray[indexFromBack+2];
                equationArray.splice(indexFromBack+1,1);
            } else {
                return "error: two operations in a row"
            }
        } else if (equationArray[indexFromBack].split('.').length > 2) {
            //if there's more than 1 decimal point in a number, that's an error
            return "error: invalid number had too many decimal points";
        }
        indexFromBack -= 1;
    }

    // if first element is "-", treat it as negative not minus
    if (equationArray[0] === "-") {
        equationArray.shift();
        equationArray[0] = "-" + equationArray[0];
    }

    let runningTotal = 0;
    let operation = "";
    if (order === "leftToRight"){
        for (const index in equationArray){
            if (index == 0) {
                runningTotal = Number(equationArray[0]);
            } else if (equationArray[index].search(/[-+_*/]/) > -1){
                operation = equationArray[index];
            } else {
                switch (operation) {
                    case "+":
                        runningTotal += Number(equationArray[index]);
                        break;
                    case "-":
                        runningTotal -= Number(equationArray[index]);
                        break;
                    case "*":
                        runningTotal *= Number(equationArray[index]);
                        break;
                    case "/":
                        if (Number(equationArray[index]) === 0) {
                            return "error: divide by 0";
                        }
                        runningTotal /= Number(equationArray[index]);
                        break;
                    default:
                        break;
                }
            }
        }
    } //end leftToRight case
    else {

    } //end PEMDAS case
    return runningTotal;
} //end evaluate