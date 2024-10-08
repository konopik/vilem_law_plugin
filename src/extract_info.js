console.log(window.location.href);

function isProcessingRuleSite(a) {
    let url = a.href.toLowerCase();
    let text = a.innerText.toLowerCase();

    if (url.includes("osobnich-udaju") || url.includes("osobni-udaje") || url.includes("gdpr") || url.includes("cookies")
        || url.includes("zpracovani-osobnich") || url.includes("ochrana-udaju")) {
        return true;
    }

    return false;
}

function domainFromUrl(url) {
    try{
        return new URL(url).hostname;
    }catch(err){
        return "";
    }
}

async function bfsCrawler(root, maxDepth, maxNodes) {
    let visited = new Set();
    let candidates = new Set();
    let queue = [{url: root, depth: 0}];
    let current_domain = domainFromUrl(root);

    while (queue.length > 0 && visited.size < maxNodes) {
        let {url, depth} = queue.shift();

        if (!visited.has(url) && depth <= maxDepth) {
            visited.add(url);
            if(domainFromUrl(url) != current_domain){
                continue;
            }

            // Fetch the page and parse it as a DOM
            let text = undefined;
            try{
                let response = await fetch(url);
                text = await response.text();
            }catch(err){
                console.log("error fetching", url, err);
                continue;
            }

            let parser = new DOMParser();
            let doc = parser.parseFromString(text, "text/html");

            // Get all 'a' tags on the page
            let aTags = doc.getElementsByTagName('a');

            // Add all links to the queue
            for (let a of aTags) {
                if(isProcessingRuleSite(a)){
                    candidates.add(a.href);
                }

                let href = a.href;
                if (href && !visited.has(href)) {
                    queue.push({url: href, depth: depth + 1});
                }
            }
        }
    }

    return Array.from(candidates);
}

function runCrawler(url, domain){
    // 0, 1 = no depth, only root
    bfsCrawler(url, 0, 1).then((candidates) => {
        chrome.runtime.sendMessage({"type": "crawler_result", "payload": candidates, "url": url, "domain": domain})
    });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("message received", request);
  
    if(request.type == "run_crawler"){
        runCrawler(request.url, request.domain);
    }
});
chrome.runtime.sendMessage({"type": "page_opened", "url": window.location.href, "text": document.body.innerText})


// const foundA = Array.prototype.find.call(
//     document.querySelectorAll('a'),
//     a => /.*(smluvni|obchodni)?.*podminky/.test(a.getAttribute("href"))
// );

// if (foundA){
//     console.log(foundA.getAttribute("href"));
//     var xhttp = new XMLHttpRequest();
//     xhttp.onreadystatechange = function() {
//         if (this.readyState == 4 && this.status == 200) {
//             console.log(this.responseText);
//             chrome.runtime.sendMessage({"html": this.responseText, "link": window.location.href + foundA.getAttribute("href")})
//         }else{
//             chrome.runtime.sendMessage({"html": 0})
//         }
//     };
//     //console.log(xhttp);
//     let url = window.location.href + foundA.getAttribute("href");
//     console.log("trying to open", url);
//     xhttp.open("GET", url, true);
//     xhttp.send();

//     //console.log(foundA.getAttribute("href"));
// }else{
//     chrome.runtime.sendMessage({"html": 0})
//     //console.log("found no A");
// }

