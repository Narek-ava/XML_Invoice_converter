window.onload = main;
let table1, table2;
let fileBox = [];
let xmlInvoice = [];
let invoiceBox = [];
let numberSeriesInitBox = [];
let falseFilesName = [];
let objectBox = [];
let bool = false;
let keydownCount = 0;
let loadedFiles;
let reader;

function main() {
    if (typeof window.FileReader !== 'function') {
        alert("The file API isn't supported on this browser yet.");
    }

    document.getElementById("runTask").addEventListener("click", function () {

        loader("flex");
        setTimeout(() => algorithm(), 10);
        setTimeout(() => loader("none"), 10);

    });

    document.getElementById("filesX").addEventListener("change", function () {

        readMultiFiles(this.files);

    });


    runTask();
}

function algorithm() {

    keydownCount++;

    if (keydownCount <= 1) {

        parseInvoices();
        invoiceBox.forEach((val) => {
            initializeInvoice(val.xmlString, val.fileName);

        })

        destroyTables();
        createTable();
        runTask();
        xmlInvoice = [];
        invoiceBox = [];

    }
}

function initializeInvoice(xmlString, fileName) {
    let series = parseAndGet(xmlString, "Series")[0].innerHTML;
    let num = parseAndGet(xmlString, "Number")[0].innerHTML;
    let type = parseAndGet(xmlString, "Type")[0].innerHTML;
    ////////////////////
    let coSignDate = parseAndGet(xmlString, "CoSignDate");

    if (coSignDate.length === 0) {
        coSignDate = `<p1 style="color: red">չսորագրված</p1>`;
    } else {
        coSignDate = parseAndGet(xmlString, "CoSignDate")[0].innerHTML;
    }
    ///////////////////////
    let dealDate = parseAndGet(xmlString, "DealDate");

    if (dealDate.length === 0) {
        dealDate = "";
    } else {
        dealDate = parseAndGet(xmlString, "DealDate")[0].innerHTML;
    }
    ///////////////////////
    let dealNumber = parseAndGet(xmlString, "DealNumber");

    if (dealNumber.length === 0) {
        dealNumber = "";
    } else {
        dealNumber = parseAndGet(xmlString, "DealNumber")[0].innerHTML;
    }
    ////////////////////////
    let supplyDate = parseAndGet(xmlString, "SupplyDate");

    if (supplyDate.length === 0) {
        supplyDate = "";
    } else {
        supplyDate = parseAndGet(xmlString, "SupplyDate")[0].innerHTML;
    }
    ///////////////////////
    let deliveryDate = parseAndGet(xmlString, "DeliveryDate");

    if (deliveryDate.length === 0) {
        deliveryDate = "";
    } else {
        deliveryDate = parseAndGet(xmlString, "DeliveryDate")[0].innerHTML;
    }

    let name = parseAndGet(xmlString, "Name")[0].innerHTML;
    let tin = parseAndGet(xmlString, "TIN")[0].innerHTML;
    let products = parseAndGet(xmlString, "Good");

    let obj = {
        products: [],
        name: name,
        seriesNumber: series + num,
        signeDate: coSignDate,
        type: type,
        tin: tin,
        series: series,
        fileName: fileName,
        dealDate: dealDate,
        dealNumber: dealNumber,
        supplyDate: supplyDate,
        deliveryDate: deliveryDate
    };

    for (const objElement of products) {
        //////////////////////////////////////////////////////////
        let description = parseAndGet(objElement.outerHTML, "Description");

        if (description.length === 0) {
            description = "";
        } else {
            description = parseAndGet(objElement.outerHTML, "Description")[0].innerHTML
        }
        //////////////////////////////////////////////////////////
        let unit = parseAndGet(objElement.outerHTML, "Unit");

        if (unit.length === 0) {
            unit = "";
        } else {
            unit = parseAndGet(objElement.outerHTML, "Unit")[0].innerHTML
        }
        /////////////////////////////////////////////////////////////
        let amount = parseAndGet(objElement.outerHTML, "Amount");

        if (amount.length === 0) {
            amount = "";
        } else {
            amount = parseAndGet(objElement.outerHTML, "Amount")[0].innerHTML
        }
        ///////////////////////////////////////////////////////////////
        let pricePerUnit = parseAndGet(objElement.outerHTML, "PricePerUnit");

        if (pricePerUnit.length === 0) {
            pricePerUnit = "";
        } else {
            pricePerUnit = parseAndGet(objElement.outerHTML, "PricePerUnit")[0].innerHTML
        }
        /////////////////////////////////////////////////////////////////////
        let price = parseAndGet(objElement.outerHTML, "Price");
        if (price.length === 0) {
            price = "";
        } else {
            price = parseAndGet(objElement.outerHTML, "Price")[0].innerHTML
        }
        /////////////////////////////////////////////////////////////
        let vatRate = parseAndGet(objElement.outerHTML, "VATRate");

        if (vatRate.length === 0) {
            vatRate = "";
        } else {
            vatRate = parseAndGet(objElement.outerHTML, "VATRate")[0].innerHTML
        }
        ///////////////////////////////////////////////////////////////
        let vat = parseAndGet(objElement.outerHTML, "VAT");

        if (vat.length === 0) {
            vat = "";
        } else {
            vat = parseAndGet(objElement.outerHTML, "VAT")[0].innerHTML
        }
        /////////////////////////////////////////////////////////////////
        let totalPrice = parseAndGet(objElement.outerHTML, "TotalPrice")

        if (totalPrice.length === 0) {
            totalPrice = "";
        } else {
            totalPrice = parseAndGet(objElement.outerHTML, "TotalPrice")[0].innerHTML
        }
        // console.log(products)
        if (obj.series === "Ա") {
            obj.products.push({
                description: description,
                unit: unit,
                amount: amount,
                pricePerUnit: pricePerUnit,
                price: price,
                vatRate: vatRate,
                vat: vat,
                totalPrice: totalPrice,
            })
            console.log(obj.products.description)
        }

        if (obj.series === "Բ") {
            obj.products.push({
                description: description,
                unit: unit,
                amount: amount,
                pricePerUnit: pricePerUnit,
                price: price,
                totalPrice: totalPrice,
            })
        }
    }

    if (initInvoice(series, num, fileName) === true) {
        objectBox.push(obj);
    } else {
        error(series, num, fileName);
    }
}

function initInvoice(series, num, fileName) {
    let init;

    for (const numElement of objectBox) {

        if (numElement.seriesNumber === series + num || !initFilName(fileName)) {
            init = false
        }
    }
    return (init !== false)
}

function parseInvoices() {
    for (const xmlInvoiceElement of xmlInvoice) {

        if (initFile(xmlInvoiceElement.content, xmlInvoiceElement.name)) {

            for (const val of xmlInvoiceElement.content) {

                invoiceBox.push({
                    fileName: xmlInvoiceElement.name,
                    xmlString: val.outerHTML
                });
            }
        }
    }
}

function readMultiFiles(files) {

    keydownCount = 0;

    let ul = document.querySelector("#bag>ul");
    loadedFiles = files;

    while (ul.hasChildNodes()) {
        ul.removeChild(ul.firstChild);
    }

    function setup_reader(file) {
        let name = file.name;
        reader = new FileReader();
        reader.readAsText(file, 'UTF-8');

        fileBox.length = 0;
        reader.onload = function (e) {

            e.target.result; //get file content

            fileBox.push(e.target);

            if (parseAndGet(fileBox[fileBox.length - 1].result, "Series")[0].innerHTML === "Ա") {

                xmlInvoice.push({
                    name: file.name,
                    content: parseAndGet(fileBox[fileBox.length - 1].result, "SignedData")
                });

            }

            if (parseAndGet(fileBox[fileBox.length - 1].result, "Series")[0].innerHTML === "Բ") {

                xmlInvoice.push({
                    name: file.name,
                    content: parseAndGet(fileBox[fileBox.length - 1].result, "SignedAccDocData")
                });

            }

            let li = document.createElement("li");
            li.innerHTML = name;
            li.id = name;
            ul.appendChild(li);
        }
    }

    xmlInvoice = [];
    setup_reader(files[0]);

    ///////////////////////MultiFile rider
    // for (let i = 0; i < files.length; i++) {
    //     setup_reader(files[i]);
    // }

}

function parseAndGet(arr, str) {
    let parser, xmlDoc;
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(arr, "text/xml");

    return xmlDoc.getElementsByTagName(str);
}

function createTable() {
    let table1 = "tbody1";
    let table2 = "tbody2";
    let currentTable;
    let currentTableCount;
    let tableRowContent;
    let table1Count = 0;
    let table2Count = 0;

    document.getElementById("tbody1").innerHTML = ``;
    document.getElementById("tbody2").innerHTML = ``;

    for (let obj of objectBox) {

        for (let product of obj.products) {

            if (obj.type === '1') {
                table1Count++;
                currentTableCount = table1Count;
                currentTable = table1;
            }

            if (obj.type === '3') {
                table2Count++;
                currentTableCount = table2Count;
                currentTable = table2;
            }

            if (obj.series === "Ա") {
                tableRowContent = `
        <tr>
            <td>${currentTableCount}</td>
            <td>${product.description}</td>
            <td>${product.unit}</td>
            <td>${product.pricePerUnit}</td>
            <td>${product.amount}</td>
            <td></td>
            <td>${product.price}</td>
            <td>${product.vatRate}</td>
            <td>${product.vat}</td>
            <td>${product.totalPrice}</td>
            <td>${obj.seriesNumber}</td>
            <td>${obj.signeDate}</td>
            <td>${obj.supplyDate}</td>
            <td>${obj.dealDate}</td>
            <td>${obj.dealNumber}</td>
            <td>${obj.name}</td>
            <td>${obj.tin}</td>
        </tr>
        `;
            }

            if (obj.series === "Բ") {
                tableRowContent = `
        <tr>
            <td>${currentTableCount}</td>
            <td>${product.description}</td>
            <td>${product.unit}</td>
            <td>${product.pricePerUnit}</td>
            <td>${product.amount}</td>
            <td></td>
            <td>${product.price}</td>
            <td></td>
            <td></td>
            <td>${product.totalPrice}</td>
            <td>${obj.seriesNumber}</td>
            <td>${obj.signeDate}</td>
            <td>${obj.deliveryDate}</td>
            <td>${obj.dealDate}</td>
            <td>${obj.dealNumber}</td>
            <td>${obj.name}</td>
            <td>${obj.tin}</td>
        </tr>
        `;
            }

            document.getElementById(currentTable).innerHTML += tableRowContent;
        }
    }
}

function runTask() {
    table1 = $('#table1').DataTable({
        dom: 'Bfrti',
        buttons: [
            'copyHtml5',
            'excelHtml5',
        ],
        "paging": false,
    });

    table2 = $('#table2').DataTable({

        dom: 'Bfrtip',
        buttons: [
            'copyHtml5',
            'excelHtml5',
        ],
        "paging": false,
    });
}

function destroyTables() {
    table1.destroy();
    table2.destroy();
}

function initFile(xmlCollection, fileName) {
    let initBox = [];
    let series, num;

    for (const elem of xmlCollection) {
        series = parseAndGet(elem.innerHTML, "Series")[0].innerHTML;
        num = parseAndGet(elem.innerHTML, "Number")[0].innerHTML;

        if (initInvoice(series, num) === true) {
            initBox.push(series + num);
        }

        if (initInvoice(series, num) === false) {
            error(series, num, fileName);
        }
    }

    if (initBox.length === xmlCollection.length) {

        for (const initSerialNumber of initBox) {
            numberSeriesInitBox.push(initSerialNumber);
        }

    } else {
        falseFilesName.push(fileName);
    }

    if (initBox.length === xmlCollection.length) {
        document.getElementById("loadedFiles").innerHTML += `<br><p1 style="color: green">${fileName}</p1>`;
        return true;
    }
}

function error(series, num, fileName) {
    document.getElementById(fileName).style.color = "red";
    document.getElementById("error").innerHTML += `<br><p1>${"Duplicate Invoice" + " " + series + num + " " + "In===" + " " + fileName}<hr></p1>`;
}

function reset() {
    location.reload();
}

function openTableButton(evt, tableName) {
    let i, tabContent, tabLinks;
    tabContent = document.getElementsByClassName("tabContent");

    for (i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }

    tabLinks = document.getElementsByClassName("tabLinks");

    for (i = 0; i < tabLinks.length; i++) {
        tabLinks[i].className = tabLinks[i].className.replace(" active", "");
    }

    document.getElementById(tableName).style.display = "block";
    evt.currentTarget.className += " active";
}

function initFilName(fileName) {
    for (const falseName of falseFilesName) {

        if (falseName === fileName) {
            return false;
        }
    }
    return true;
}

function loader(action) {
    document.getElementById("loader").style.display = action;

    return true;
}