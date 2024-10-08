function getQueryVariable(variable){
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        console.log(pair[0]);
        if(pair[0] == variable){return pair[1];}
    }
    return(false);
}

let q = getQueryVariable("TL03000152_Question");
let regex, rect;
switch (q){
    case "TL03000152_Why": {
        console.log("why");
        regex = /(zpracování)+(.*)(účel|účelem)+/gs;
        document.body.innerHTML = document.body.innerHTML.replace(regex, "<span style='background-color: yellow;' id='TL03000152_target'>$1$2$3</span>");

        let el = document.getElementById("TL03000152_target");
        if(el == null){
            alert("Odpověď na otázku nenalezena. Můžete se ji pokusit nalézt sami.");
        }
        rect = el.getBoundingClientRect();
        console.log(rect);
        window.scrollTo(rect.x, rect.y);
        break;
    }
    case "TL03000152_Which": {
        console.log("which");
        regex = /(typy|kategorie)+( osobních údajů)+/gs;
        document.body.innerHTML = document.body.innerHTML.replace(regex, "<span style='background-color: yellow;' id='TL03000152_target'>$1$2</span>");

        let el = document.getElementById("TL03000152_target");
        if(el == null){
            alert("Odpověď na otázku nenalezena. Můžete se ji pokusit nalézt sami.");
        }
        rect = el.getBoundingClientRect();
        console.log(rect);
        window.scrollTo(rect.x, rect.y);
        break;
    }
    case "TL03000152_What": {
        console.log("what");
        regex = /(souhlas)/gs;
        if(document.body.innerHTML.match(regex).length === 0){
            alert("Odpověď na otázku nenalezena. Můžete se ji pokusit nalézt sami.");
            break;
        }
        document.body.innerHTML = document.body.innerHTML.replace(regex, "<span style='background-color: yellow;' id='TL03000152_target'>$1</span>");

        let el = document.getElementById("TL03000152_target");
        if(el == null){
            alert("Odpověď na otázku nenalezena.");
        }
        rect = el.getBoundingClientRect();
        console.log(rect);
        window.scrollTo(rect.x, rect.y);
        break;
    }
    default: {
        console.log("INVALID");
        break;
    }
}