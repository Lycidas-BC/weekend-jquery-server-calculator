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

app.post('/clearHistory', (req, res) => {
    console.log('in post for calculate', req.body);
    
    //empty historyArray
    historyArray = [];
  
    // always respond
    res.sendStatus(201); // 201 is good!
});

function evaluate(equation, order) {
    console.log("equation:", equation,"order:", order);
    
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
                //replace parenthetical with evaluate(parenthetical, order)
                const openParenIndex = equation.indexOf("(");
                const closingParenIndex = equation.indexOf(")",openParenIndex);
                const parentheses = equation.substring(openParenIndex + 1, closingParenIndex);
                const evaluateParentheses = parentheses.trim() != "" ? String(evaluate(parentheses,order)) : "";
                if (evaluateParentheses.indexOf("error") > -1) {
                    //if parentheses returns an error, pass it on
                    return evaluateParentheses;
                } else {
                    return evaluate(equation.replace("("+parentheses+")", evaluateParentheses),order);
                }
            }
        }
    }

    //.split to change equation string into array of numbers and operators
    //reg ex [-+_*/] matches operators, g makes it so they don't get removed
    //filter array for empty strings ( /\S/ is a regular expression that matches only non-whitespace characters
    //map trim whitespace onto each element
    let equationArray = equation.split(/([-+_*/])/g);
    equationArray = equationArray.filter(function(str) {
        return /\S/.test(str);
    });
    equationArray = equationArray.map(x => x.trim());
    console.log(equationArray);
    
    //validate equationArray:

    //if equation starts with +, *, or / return error
    //if equation ends with -, +, *, or / return error
    let indexFromBack = equationArray.length - 1;
    if (equationArray[0].search(/[+_*/]/) > -1 || equationArray[indexFromBack].search(/[-+_*/]/) > -1) {
        return "error: cannot begin or end with an operation (unless making a number negative)";
    }
    //remove leading negatives or double negatives
    while(equationArray[0] == "-") {
        if (equationArray[1] == "-") {
            // if there's a double negative, drop them both
            equationArray.shift();
            equationArray.shift();
        } else if (equationArray[1].search(/[+_*/]/) > -1) {
            // if there's some other operation, throw error
            return "error: cannot begin or end with an operation (unless making a number negative)";
        } else {
            // make negative, shift off leading "-"
            equationArray[1] = "-" + equationArray[1];
            equationArray.shift();
        }
    }

    indexFromBack = equationArray.length - 1;
    if (indexFromBack == 0){
        //if there's only one element in the array, make sure it's a valid number
        if (equationArray[indexFromBack].split('.').length > 2) {
            //if there's more than 1 decimal point in a number, that's an error
            return "error: invalid number had too many decimal points";
        }
        //if it's valid, return that
        return equationArray[indexFromBack];
    }

    //check for 
    //I'm incrementing through the array backwards, because I plan on splicing things out and I don't want to mess up the array indices
    while (indexFromBack >= 0) {
        if (equationArray[indexFromBack] === "-" && equationArray[indexFromBack+1] === "-") {
            //if we have two negatives in a row, splice them out
            console.log('double negative:',equationArray, equationArray[indexFromBack], equationArray[indexFromBack+1]);
            if(equationArray[indexFromBack-1].search(/[-+_*/]/) == -1 && equationArray[indexFromBack+2].search(/[-+_*/]/) == -1){
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
                runningTotal = parseFloat(equationArray[0]);
            } else if (equationArray[index].search(/[+_*/]/) > -1 || equationArray[index] == "-"){
                operation = equationArray[index];
            } else {
                switch (operation) {
                    case "+":
                        runningTotal += parseFloat(equationArray[index]);
                        break;
                    case "-":
                        runningTotal -= parseFloat(equationArray[index]);
                        break;
                    case "*":
                        runningTotal *= parseFloat(equationArray[index]);
                        break;
                    case "/":
                        if (parseFloat(equationArray[index]) === 0) {
                            return "error: divide by 0";
                        }
                        runningTotal /= parseFloat(equationArray[index]);
                        break;
                    default:
                        break;
                }
            }
        }
    } //end leftToRight case
    else {
        let count = 0;
        while(equationArray.length > 1 && count < 10) {
            const nextMult = equationArray.findIndex(element => element === "*");
            const nextDiv = equationArray.findIndex(element => element === "/");
            const nextAdd = equationArray.findIndex(element => element === "+");
            const nextSub = equationArray.findIndex(element => element === "-");
            if (nextMult > -1 || nextDiv > -1) {
                //if there is multiplication or division, do those first
                if ((nextMult < nextDiv || nextDiv == -1) && nextMult != -1) {
                    //if multiplication is left of division or if there is no division, multiply numbers and splice them into array
                    const product = parseFloat(equationArray[nextMult-1]) * parseFloat(equationArray[nextMult+1]);
                    equationArray.splice(nextMult-1,3,product);
                } else {
                    //either there is no multiplication or it's after the next division. Divide numbers and splice them into array
                    if (parseFloat(equationArray[nextDiv+1]) == 0) {
                        return "error: divide by 0";
                    }
                    const quotient = parseFloat(equationArray[nextDiv-1]) / parseFloat(equationArray[nextDiv+1]);
                    equationArray.splice(nextDiv-1,3,quotient);
                }
            } else if (nextAdd > -1 || nextSub > -1) {
                //once we've done all multiplication and division, do addition and subtraction from left to right
                if ((nextAdd < nextSub || nextSub == -1) && nextAdd != -1) {
                    //if addition is left of subtraction or there is no subtraction, add and splice
                    const sum = parseFloat(equationArray[nextAdd-1]) + parseFloat(equationArray[nextAdd+1]);
                    equationArray.splice(nextAdd-1,3,sum);
                } else {
                    //either there is no addition or it's after the next subtraction. Subtract and splice
                    const difference = parseFloat(equationArray[nextSub-1]) - parseFloat(equationArray[nextSub+1]);
                    equationArray.splice(nextSub-1,3,difference);
                }
            }
            count +=1;
        }
        runningTotal = equationArray[0];
    } //end PEMDAS case
    // round to 10 digits precision and return
    return Math.round(runningTotal*10000000000)/10000000000;
} //end evaluate