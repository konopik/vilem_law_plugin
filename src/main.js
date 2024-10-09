const BACKEND_CONFIG = {
  backendUrl: "http://liks.fav.zcu.cz",
  backendPort: "8022",
};
const contact_email = "EMAIL";
const COYOTE_STATES = {
  waving: "icons/coyote-waving.jpg",
  watching: "icons/coyote-watching.jpg",
  pointing: "icons/coyote-pointing.jpg",
  shrugging: "icons/coyote-shrugging.jpg",
};

function setCoyoteState(state) {
  let coyote = $("#chatWidgetWileECoyote");
  coyote.css("background-image", "url(" + COYOTE_STATES[state] + ")");
}

const cookie_div = $("#show_ents");
const cookie_whole_page = $("#cookie_whole_page");

function handleMessage(request, sender, sendResponse) {
  console.log("message received, type:", request.type);
  const main_content = $("#resultDiv");

  switch (request.type) {
    case "getting_information":
      setCoyoteState("watching");
      if (request.state == "crawling") {
        addMessage(
          "Zpracovávám stránku " + request.domain + ", dejte mi chviličku!"
        );
      } else if (request.state == "ask_refresh") {
        addMessage(
          "Prosím, obnovte tuto stránku, abych se na ní mohl podívat."
        );
      }
      break;
    case "information":
      let payload = request.payload;
      chrome.tabs.query({ currentWindow: true, active: true }).then((tabs) => {
        let url = new URL(tabs[0].url);
        let current_domain = url.hostname;

        console.log("payload", payload);
        console.log("current_domain", current_domain);
        if (payload.domain != current_domain) return;

        if (payload.success) {
          setCoyoteState("pointing");
          addMessage(
            "Stránku o zpracování osobních údajů na " +
              payload.domain +
              " jsem našel a zpracoval ji viz níže."
          );
          cookie_div.html("čekám na zpracování");

          const request_body = {
            text: payload.texts.join(" "),
            url: payload.domain,
          };

          console.log("request_body", request_body);
          // main_content.html(JSON.stringify(payload));

          // Send the page to the backend
          fetch(
            BACKEND_CONFIG.backendUrl +
              ":" +
              BACKEND_CONFIG.backendPort +
              "/cookies/analyze",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(request_body),
            }
          )
            // fetch(BACKEND_CONFIG.backendUrl + ':' + BACKEND_CONFIG.backendPort + '/', {method: 'GET'})
            .then((response) => response.json())
            .then((data) => {
              console.log("Success:", data);
              update_cookie(data);
            })
            .catch((error) => {
              console.error("Error:", error);
              addMessage(
                "Osobní údaje na této stránce ("+payload.domain+"), se mi nepodařilo zpracovat. Moji vývojáři budou rádi, když jim dáme vědět na"+contact_email+"."
              );
            });
        } else {
          setCoyoteState("shrugging");
          addMessage(
            "Bohužel, stránku o zpracování osobních údajů na " +
              payload.domain +
              " jsem nenašel."
          );
          main_content.html("");
        }
      });
    break;
    case "page_opened":
      handlePageOpened(request);
      break;
  }
}

var messageQueue = [];

function handlePageOpened(request) {
  console.log("page opened", request);
  const is_advertisement_div = $("#is_advertisement");

  let is_advertisement = undefined;
  // try to get the result from session storage (map of url -> is_advertisement)
  chrome.storage.session.get("url_advertisement_cache", (cache) => {
    let url_advertisement_cache = cache.url_advertisement_cache;
    if (url_advertisement_cache == undefined) {
      url_advertisement_cache = {};
    }
    if (url_advertisement_cache[request.url] != undefined) {
      is_advertisement = url_advertisement_cache[request.url];
    }

    if (is_advertisement !== undefined) {
      console.log(
        "Found advertisement status in cache for url",
        request.url,
        ":",
        is_advertisement
      );
      console.log("Cache:", url_advertisement_cache);
    } else {
      console.log(
        "No advertisement status found in cache for url",
        request.url
      );
    }

    console.log("is_advertisement", is_advertisement);

    // if the result is not in session storage, send the page to the backend
    if (is_advertisement === undefined) {
      // if text is not part of the request, prompt the user to refresh the page
      if (request.text === undefined) {
        is_advertisement_div.text(
          "...musíte nejprve obnovit tuto stránku, abych mohl zjistit, zda obsahuje reklamu."
        );
        is_advertisement_div.css("color", "#000000");
        return;
      }

      console.log("sending request to backend /classify with url", request.url);

      const request_body = {
        url: request.url,
        text: request.text,
      };

      is_advertisement_div.text("Probíhá analýza reklamovosti stránky...");
      is_advertisement_div.css("color", "#000000");

      // Send the page to the backend
      fetch(
        BACKEND_CONFIG.backendUrl +
          ":" +
          BACKEND_CONFIG.backendPort +
          "/classify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request_body),
        }
      )
        .then((response) => response.json())
        .then((data) => {
          is_advertisement = data["is_advertisement"];

          // store the result in session storage (map of url -> is_advertisement)
          chrome.storage.session.get("url_advertisement_cache", (cache) => {
            let url_advertisement_cache = cache.url_advertisement_cache;
            if (url_advertisement_cache == undefined) {
              url_advertisement_cache = {};
            }

            url_advertisement_cache[request.url] = is_advertisement;
            chrome.storage.session.set({
              url_advertisement_cache: url_advertisement_cache,
            });
          });
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }

    // set the result
    set_advertisement_status(is_advertisement, is_advertisement_div);
  });
}

function set_advertisement_status(is_advertisement, is_advertisement_div) {
  if (is_advertisement) {
    is_advertisement_div.html(
      '...tato stránka <span style="color: #900000;">obsahuje</span> reklamu.'
    );
    is_advertisement_div.css("color", "#000000");
  } else {
    is_advertisement_div.html(
      '...tato stránka <span style="color: #009000;">neobsahuje</span> reklamu.'
    );
    is_advertisement_div.css("color", "#000000");
  }
}

function update_cookie(data) {
  entities = data.entities;
  // generate table from entities
  var table = $("<table></table>");
  var tr = $("<tr></tr>");
  tr.append("<th>Údaj</th>");
  tr.append("<th>Hodnota</th>");
  table.append(tr);
  for (var i = 0; i < entities.length; i++) {
    var tr = $("<tr></tr>");
    tr.append("<td>" + entities[i].entity + "</td>");
    tr.append("<td>" + entities[i].short_text + "</td>");
    table.append(tr);
  }
  cookie_div.html(table);

  cookie_whole_page.html(data.page_to_render);
}

function addMessage(message) {
  $("#chatWidgetBottomMessageBubblePoint").show();
  var messageDiv = $('<div class="message">' + message + "</div>");
  messageQueue.unshift(messageDiv);
  $("#chatWidget").prepend(messageDiv);
  if (messageQueue.length > 7) {
    messageQueue.pop().remove();
  }
}

addMessage(
  "Ahoj! Jmenuji se kojot Vilda a jsem tu, abych vás chránil před zneužíváním osobních údajů a skrytou reklamou.<br><br>" +
    "Stačí otevřít libovolnou stránku a já se postarám o zbytek."
);
chrome.runtime.onMessage.addListener(handleMessage);
