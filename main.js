const eulerConstant = document.querySelector("#e-number");
const tableContainer = document.querySelector("#table-container");
const nextDigitButton = document.querySelector("#next-digit");

// With the build-in Math module, dx = 1e-8 gives best results
// This is sqrt of Number.EPSILON

Decimal.set({ precision: 50 })

const dx = new Decimal(1e-25);

function calculateCoefficient(base) {
    return base.pow(dx).minus(1).dividedBy(dx); // (pow(base, dx) - 1) / dx;
}


function calculateTable(min, max, digits) {
    let table = [];

    let step = max.minus(min).dividedBy(10); // (max - min) / 10
    for (let i = 0; i <= 10; i++) {
        let base = step.mul(i).plus(min); // i * step + min
        base = new Decimal(base.toPrecision(digits));
        let result = calculateCoefficient(base);

        table.push({
            base: base,
            result: result
        });
    }

    return table;
}

function createTableElement(table) {
    let tableElement = document.createElement("table");
    let thead = document.createElement("thead");
    let tbody = document.createElement("tbody");
    
    let trHead = document.createElement("tr");
    let th1 = document.createElement("th");
    let th2 = document.createElement("th");
    
    let min = table[0].base;
    let max = table[table.length - 1].base;
    
    if (digits > 5) {
        th1.innerHTML = `<table no-border><tr><td>e \u2208 [</td><td>${min};</td></tr><tr><td></td><td>${max}<td>]</td></td></tr></table>`;
    } else {
        th1.innerText = `e \u2208 [${min}; ${max}]`;
    }
    th2.innerText = "f'(x) / f(x)";

    trHead.append(th1, th2);
    thead.appendChild(trHead);

    // Add rows
    for (let i = 0; i <= 10; i++) {
        let tr = document.createElement("tr");
        let td1 = document.createElement("td");
        let td2 = document.createElement("td");
        
        // Read table data
        td1.innerText = table[i].base.toString();
        td2.innerText = table[i].result.toString();

        tr.append(td1, td2);
        tbody.appendChild(tr);
    }
    
    tableElement.append(thead, tbody);
    return tableElement;
}

function findNextDigit(table, tableElement) {
    let rows = tableElement.lastChild.children;

    let prevBase; let prevResult;
    for (let i = 0; i <= 10; i++) {
        let base = table[i].base;
        let result = table[i].result;
        if ( // p0 < 1 && p1 >= 1
                prevResult != undefined &&
                prevResult.lt(1) && result.gte(1)
        ) {
            rows[i - 1].classList.add("floor");
            rows[i].classList.add("ceil");
            console.log(prevBase.toString());
            return {min: prevBase, max: base};
        }
        prevBase = base;
        prevResult = result;
    }
}

var bounds = {
    min: new Decimal(0),
    max: new Decimal(10)
};
var digits = 1;
var table; var tableElement;

function InitState() {
    table = calculateTable(bounds.min, bounds.max, digits);
    tableElement = createTableElement(table);
    tableContainer.appendChild(tableElement);
    
    FirstState();
}

function FirstState() {
    nextDigitButton.disabled = true;
    setTimeout(() => {
        bounds = findNextDigit(table, tableElement);
        digits++;
        eulerConstant.innerText = bounds.min;
        
        if (digits < 20) {
            nextDigitButton.onclick = SecondState;
            nextDigitButton.disabled = false;
        } else {
            nextDigitButton.innerText = "Keine weiteren Stellen können berechnet werden.";
        }
    }, 250);
}

function SecondState() {
    table = calculateTable(bounds.min, bounds.max, digits);
    newTableElement = createTableElement(table);
    tableContainer.replaceChild(newTableElement, tableElement);
    tableElement = newTableElement;

    FirstState();
}

document.body.onload = InitState;