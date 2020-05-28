var alldata = JSON.parse(localStorage.getItem('xldata')) || {};
var FileUploadComponent = document.getElementById('component-file-upload');
var DashboardComponent = document.getElementById('component-dashboard');
var SideMenu = document.getElementById('sidemenu');
var DataTable = document.getElementById('data-table');
var TableView = document.getElementById('table-view');
var JsonView = document.getElementById('json-view');
var JsonTypeHead = document.getElementById('json-type-head');
var JsonTypeBody = document.getElementById('json-type-data');
var Modal = document.getElementById('modal');
var DeptName = document.getElementById('deptName');



var activeMenu = null;
var jsonActive = null;

window.onload = () => {
    init();
}

function init() {
    console.log(alldata);
    renderSideMenu();
    renderSheet();
}

var ExcelToJSON = function () {
    this.parseExcel = function (file) {
        var reader = new FileReader();

        reader.onload = function (e) {
            var data = e.target.result;
            var workbook = XLSX.read(data, {
                type: 'binary'
            });
            let newData = {};
            workbook.SheetNames.forEach(function (sheetName) {
                var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                var json_object = JSON.stringify(XL_row_object);
                newData[sheetName] = JSON.parse(json_object);
            })
            alldata = { ...alldata, ...newData };
            localStorage.setItem('xldata', JSON.stringify(alldata));
            init();
        };

        reader.onerror = function (ex) {
            console.log(ex);
        };

        reader.readAsBinaryString(file);
    };
};

function handleFileSelect(evt) {
    var files = evt.target.files;
    var xl2json = new ExcelToJSON();
    xl2json.parseExcel(files[0]);
}

function rederTableHead() {
    let temp = '';
    console.log(Object.keys(alldata[activeMenu][0]));
    Object.keys(alldata[activeMenu][0]).map(key => {
        temp += `<th>${key}</th>`;
    });
    DataTable.innerHTML += `<thead><tr>${temp}</tr></thead>`;
}

function rederTableBody() {
    let rows = '';
    alldata[activeMenu].map(row => {
        let temp = '';
        Object.values(row).map(value => {
            temp += `<td>${value}</td>`;
        })
        rows += `<tr>${temp}</tr>`;
    });
    DataTable.innerHTML += `<tbody>${rows}</tbody>`;
}

function renderSheet(key = activeMenu) {
    JsonView.style.display = 'none';
    TableView.style.display = 'block';
    DataTable.innerHTML = '';
    activeMenu = key;
    renderSideMenu();
    rederTableHead();
    rederTableBody();
}

function createKey(arr, index, newobj, value) {
    if (arr && arr[index]) {
        if (arr[index].length && !newobj[arr[index]]) {
            if (index === arr.length - 1) {
                newobj[arr[index]] = value;
            } else {
                newobj[arr[index]] = {};
            }
        }
        createKey(arr, index + 1, newobj[arr[index]], value);
    } else {
        if (index === 0) {
            if (!newobj['other']) {
                newobj['other'] = {};
            }
            newobj['other'][value] = value;
        }
    }
    return newobj;
}

function renderJSONHeader(json) {
    JsonTypeHead.innerHTML = '';
    Object.keys(json).map(key => {
        if (!jsonActive) {
            jsonActive = key;
        }
        JsonTypeHead.innerHTML += `<div class="json-head ${jsonActive === key ? 'active' : ''}" onclick="renderJSON('${key}')">${key}</div>`
    })
}

function renderJsonBody(json) {
    JsonTypeBody.innerHTML = `<pre>${JSON.stringify(json[jsonActive], undefined, 4)}</pre>`;
}

function renderJSON(key) {
    jsonActive = key;
    JsonView.style.display = 'block';
    TableView.style.display = 'none';
    let json = {};
    alldata[activeMenu].map(row => {
        let keys = [];
        Object.keys(row).map(key => {
            if (key.toLowerCase() === 'key') {
                keys = row[key].split('__');
            } else {
                if (keys.length === 0) {
                    keys = ['other', row[key]]
                }
                if (!json[key]) {
                    json[key] = {};
                }
                json[key] = { ...json[key], ...createKey(keys, 0, json[key], row[key]) };
            }
        });
    });
    renderJSONHeader(json);
    renderJsonBody(json);
}

function renderSideMenu() {
    SideMenu.innerHTML = '';
    Object.keys(alldata).map(key => {
        if (!activeMenu) {
            activeMenu = key;
        }
        SideMenu.innerHTML += `<div class="sidemenu-item ${activeMenu === key ? 'active' : ''}" onclick="renderSheet('${key}')">${key}</div>`;
    });
}

var uploadedJSON = {};
var rowCount = 2;
function parseJsonToExcelData(data, key, parseData = []) {
    if (typeof data === 'string') {
        parseData.push(
            {
                Key: key,
                English: data,
                Hindi: {
                    f: 'GOOGLETRANSLATE(B' + (rowCount) + ',"en","hi")'
                },
                Assamese: {
                    f: 'GOOGLETRANSLATE(B' + (rowCount) + ',"en","as")'
                },
                Bengali: {
                    f: 'GOOGLETRANSLATE(B' + (rowCount) + ',"en","bn")'
                },
                Gujarati: {
                    f: 'GOOGLETRANSLATE(B' + (rowCount) + ',"en","gu")'
                },
                Kannada: {
                    f: 'GOOGLETRANSLATE(B' + (rowCount) + ',"en","kn")'
                },
                Malayalam: {
                    f: 'GOOGLETRANSLATE(B' + (rowCount) + ',"en","ml")'
                },
                Marathi: {
                    f: 'GOOGLETRANSLATE(B' + (rowCount) + ',"en","mr")'
                },
                Oriya: {
                    f: 'GOOGLETRANSLATE(B' + (rowCount) + ',"en","or")'
                },
                Punjabi: {
                    f: 'GOOGLETRANSLATE(B' + (rowCount) + ',"en","pa")'
                },
                Tamil: {
                    f: 'GOOGLETRANSLATE(B' + (rowCount) + ',"en","ta")'
                },
                Telugu: {
                    f: 'GOOGLETRANSLATE(B' + (rowCount) + ',"en","te")'
                },
                Urdu: {
                    f: 'GOOGLETRANSLATE(B' + (rowCount) + ',"en","ur")'
                }
            })
        rowCount++;
    } else {
        Object.keys(data).map(tkey => {
            return parseJsonToExcelData(data[tkey], key + '__' + tkey, parseData);
        })
    }
    return parseData;
}

function readJSON(event) {
    var reader = new FileReader();

    reader.onload = function (e) {
        var data = e.target.result;
        let temp = JSON.parse(data);
        console.log(temp);
        let parseData = [];
        Object.keys(temp).map(key => {
            parseData = [...parseData, ...parseJsonToExcelData(temp[key], key, [])];
        })
        console.log(parseData);
        uploadedJSON = parseData;
    };

    reader.onerror = function (ex) {
        console.log(ex);
    };

    reader.readAsBinaryString(event.target.files[0]);
}

function createNewExel() {
    var wb = XLSX.utils.book_new();
    var name = DeptName.value || 'New Department';
    var header = ["Key", "English", "Hindi", "Assamese", "Bengali", "Gujarati", "Kannada", "Malayalam", "Marathi", "Oriya", "Punjabi", "Tamil", "Telugu", "Urdu"];
    wb.Props = {
        Title: "Culture",
        Subject: "Language Translation",
        Author: "Ramji Omar",
        CreatedDate: new Date()
    };
    wb.SheetNames.push(name);
    var ws = XLSX.utils.aoa_to_sheet([header]);
    XLSX.utils.sheet_add_json(ws, uploadedJSON, {
        header: header,
        skipHeader: true,
        origin: -1
    });
    wb.Sheets[name] = ws;
    var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    function s2ab(s) {

        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;

    }
    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), name + '.xlsx');
}


function openModal() {
    Modal.style.display = "flex";
}

function closeModal() {
    Modal.style.display = "none";
}