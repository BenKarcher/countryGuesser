let locations, names, gNames, fair;
let results, predictions, search, language, win;
let secret;
window.onload = function () {//todo add button functionality
    results = document.getElementById("results");
    predictions = document.getElementById("predictions");
    search = document.getElementById("searchBar");
    language = document.getElementById("language");
    win = document.getElementById("win");
    win.onclick = newGame;
    document.getElementById("newGame").onclick = function () {
        if (win.classList == "") {
            newGame();
            return;
        }
        let num = results.children.length;
        if (language.value == "ger") {
            win.innerText = "Du hast nach " + num + " versuchen aufgegeben \n das land war: " + secret.german[0];
        } else {
            win.innerText = "You gave up after " + num + " guesses! \n the country was: " + secret.names[0];
        }
        win.classList = "";
    };
    search.oninput = function () {
        let res = predict(search.value);
        for (let i in res) {
            if (predictions.children.length <= i) {
                let div = document.createElement("div");
                div.classList.add("pred");
                predictions.appendChild(div);
            }
            if (language.value == "ger") {
                predictions.children[i].innerText = res[i].german[0];
            } else {
                predictions.children[i].innerText = res[i].names[0];
            }
            predictions.children[i].onclick = submit.bind(null, res[i].code);
            predictions.children[i].code = res[i].code;
        }
        while (predictions.children.length > res.length) {
            predictions.removeChild(predictions.lastElementChild);
        }
    };
    search.addEventListener("keypress", function (event) {
        // If the user presses the "Enter" key on the keyboard
        if (event.key === "Enter") {
            // Cancel the default action, if needed
            event.preventDefault();
            guess(search.value);
        }
    });
    language.oninput = function () {
        for (let idx = 0; idx < results.children.length; idx++) {
            let c = results.children[idx];
            if (language.value == "ger") {
                c.firstChild.innerText = locations[c.code].german[0];
            } else {
                c.firstChild.innerText = locations[c.code].names[0];
            }
        }
    };
    newGame();
};

function load(dict) {
    locations = dict;
    names = [];
    gNames = [];
    fair = [];
    for (let code in locations) {
        if (!locations[code].fair) {
            fair.push(code);
        }
        for (let name of locations[code].names) {
            names.push({ code: code, name: fuzzysort.prepare(name) });
        }
        for (let name of locations[code].german) {
            gNames.push({ code: code, name: fuzzysort.prepare(name) });
        }
    }
}

function predict(query) {
    let res = fuzzysort.go(query, language.value == "ger" ? gNames : names, {
        key: "name", limit: 100,
        threshold: -Infinity,
    })
    let pred = []
    for (let item of res) {
        let code = item.obj.code;
        if (code != pred[0]?.code && code != pred[1]?.code && code != pred[2]?.code) {
            pred.push(locations[code]);
            if (pred.length == 5) {
                break;
            }
        }
    }
    return pred;
}

function guess(query) {
    let res = fuzzysort.go(query, language.value == "ger" ? gNames : names, {
        key: "name", limit: 100,
        threshold: -Infinity,
    });
    if (res.length == 0)
        return;
    submit(res[0].obj.code);
}

function submit(code) {
    if (code == secret.code) {
        let num = results.children.length + 1
        if (language.value == "ger") {
            win.innerText = "Du hast das Land in " + num + " versuchen geraten!";
        } else {
            win.innerText = "You guessed the Country in " + num + " guesses!";
        }
        win.classList = "";
        return;
    }
    let obj = locations[code];
    for (let idx = 0; idx < results.children.length; idx++) {
        let c = results.children[idx];
        if (c.code == obj.code) {
            results.removeChild(c);
            results.appendChild(c);
            resetSearch();
            return;
        }
    }
    let div = document.createElement("div");
    let name = document.createElement("div");
    let distance = document.createElement("div");
    if (language.value == "ger") {
        name.innerText = obj.german[0];
    } else {
        name.innerText = obj.names[0];
    }

    distance.innerText = calcCrow(secret, obj);
    div.code = obj.code;
    div.appendChild(name);
    div.appendChild(distance);
    results.appendChild(div);
    resetSearch();
}

function resetSearch() {
    search.value = "";
    predictions.innerHTML = "";
    search.focus();
}

function newGame() {
    win.classList = "hidden";
    load(countries);//todo add modes
    results.innerHTML = "";
    resetSearch();
    secret = locations[fair[Math.floor(Math.random() * fair.length)]];
}

//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
function calcCrow(obj1, obj2) {
    let R = 6371; // km
    let lat1 = toRad(obj1.lat);
    let lon1 = toRad(obj1.long);
    let lat2 = toRad(obj2.lat);
    let lon2 = toRad(obj2.long)
    let dLat = lat2 - lat1;
    let dLon = lon2 - lon1;

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(0) + " km";
}

// Converts numeric degrees to radians
function toRad(Value) {
    return Value * Math.PI / 180;
}