chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

function randomBool() {
    return Math.random() >= 0.5;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getInformation(url, domain) {
    console.log("getting information for", url);

    // Get domain cache
    chrome.storage.session.get("domain_cache", (result) => {
        let domain_cache = result.domain_cache;

        // Check if domain is in cache
        if (domain in domain_cache) {
            console.log("found in cache", domain_cache[domain]);
            chrome.runtime.sendMessage({ "type": "information", "payload": domain_cache[domain] });
            return;
        }

        console.log("not found in cache", domain)

        // If not, send message about getting information
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            console.log("sending message to tab", tabs[0].id);
            chrome.tabs.sendMessage(tabs[0].id, {"type": "run_crawler", "url": url, "domain": domain}).then(() => {
                chrome.runtime.sendMessage({"type": "getting_information", "domain": domain, "progress": 0, "state": "crawling"});

                // TODO let domain cache know that the page is being crawled rn so no more crawler requests are sent
            }
            ).catch((error) => {
                // console.error(error);
                chrome.runtime.sendMessage({"type": "getting_information", "domain": domain, "progress": 0, "state": "ask_refresh"});
            });
        });
    });
}

function handlePageOpened(url, text) {
    new_domain = new URL(url).hostname;

    // if text is undefined, fetch it from chrome storage (map of url -> text)
    if (text == undefined) {
        chrome.storage.session.get("url_text_cache", (cache) => {
            let url_text_cache = cache.url_text_cache;
            if (url_text_cache == undefined) {
                url_text_cache = {};
            }

            if (url in url_text_cache) {
                text = url_text_cache[url];
            } else {
                text = "";
            }
        });
    } else {
        // if text is defined, save it to chrome storage
        chrome.storage.session.get("url_text_cache", (cache) => {
            let url_text_cache = cache.url_text_cache;
            if (url_text_cache == undefined) {
                url_text_cache = {};
            }

            url_text_cache[url] = text;
            chrome.storage.session.set({ "url_text_cache": url_text_cache });
        });
    }

    chrome.runtime.sendMessage({"type": "page_opened", "url": url, "text": text});
    getInformation(url, new_domain);
}

function handleCrawlerResult(url, domain, candidates) {
    console.log("crawler result", candidates);

    let result = {};
    let promises = [];
    for(let candidate of candidates){
        let promise = fetch(candidate).then((response) => {
            return response.text();
        }).then((text) => {
            console.log("fetched", candidate);
            result[candidate] = text;
        }).catch((err) => {
            console.log("error fetching", url, err);
            // candidates[i] = "";
        });
        promises.push(promise);
    }

    Promise.all(promises).then(() => {
        console.log("all fetched", result);
        chrome.storage.session.get("domain_cache", (cache) => {
            let domain_cache = cache.domain_cache;
    
            let links = [];
            let text_lengths = [];
            let texts = [];
            for(let candidate in result){
                if(result[candidate] == undefined){
                    continue;
                }
                links.push(candidate);
                text_lengths.push(result[candidate].length);
                texts.push(result[candidate]);
            }
            let information = {
                "success": links.length > 0,
                "url": url,
                "domain": domain,
                "links": links,
                "text_lengths": text_lengths,
                "texts": texts
            }
    
            domain_cache[domain] = information;
            chrome.storage.session.set({ "domain_cache": domain_cache });
            chrome.runtime.sendMessage({ "type": "information", "payload": information });
        });
    });
}

function handleMessage(request, sender, sendResponse) {
    console.log("message received", request);

    if (request.type == "page_opened") {
        handlePageOpened(request.url, request.text);
    } else if (request.type == "crawler_result") {
        handleCrawlerResult(request.url, request.domain, request.payload);
    }
}

const regex = new RegExp(".*:\/\/.*\.cz\/.*");
chrome.tabs.onActivated.addListener(function (activeInfo) {
    // console.log(activeInfo.tabId);
    chrome.tabs.get(activeInfo.tabId, function (tab) {
        if (regex.test(tab.url)) {
            handlePageOpened(tab.url);
        }
    });
});

chrome.runtime.onMessage.addListener(handleMessage);

chrome.storage.session.get("domain_cache", function (result) {
    if (result.domain_cache == undefined) {
        chrome.storage.session.set({ "domain_cache": {} });
    }
});