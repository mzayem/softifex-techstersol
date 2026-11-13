(function () {
  "use strict";
  var $ = function (s, r) {
    return (r || document).querySelector(s);
  };
  var $$ = function (s, r) {
    return [].slice.call((r || document).querySelectorAll(s));
  };
  var root = document.documentElement;

  // theme: saved choice, else the system setting
  function setTheme(t) {
    root.setAttribute("data-theme", t);
    try {
      localStorage.setItem("sfx-doc-theme", t);
    } catch (e) {}
    var b = $("#themeBtn");
    if (b)
      b.innerHTML =
        t === "dark"
          ? '<i class="fa-solid fa-sun"></i><span class="hide-s"> Light</span>'
          : '<i class="fa-solid fa-moon"></i><span class="hide-s"> Dark</span>';
    $$("img[data-light]").forEach(function (i) {
      i.src = i.getAttribute(t === "dark" ? "data-dark" : "data-light");
    });
  }
  var saved = null;
  try {
    saved = localStorage.getItem("sfx-doc-theme");
  } catch (e) {}
  setTheme(
    saved ||
      (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"),
  );
  $("#themeBtn").addEventListener("click", function () {
    setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });

  // mobile menu
  $("#burger").addEventListener("click", function () {
    document.body.classList.toggle("menu");
  });
  $("#backdrop").addEventListener("click", function () {
    document.body.classList.remove("menu");
  });
  $$(".side a.nl").forEach(function (a) {
    a.addEventListener("click", function () {
      document.body.classList.remove("menu");
    });
  });

  // heading anchors and ids
  var used = {};
  function slug(t) {
    var s =
      t
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "part";
    while (used[s]) s += "-x";
    used[s] = 1;
    return s;
  }
  $$("section.doc").forEach(function (sec) {
    used[sec.id] = 1;
  });
  $$("section.doc h3").forEach(function (h) {
    if (!h.id) h.id = slug(h.textContent);
  });
  $$("section.doc h2, section.doc h3").forEach(function (h) {
    var a = document.createElement("a");
    a.className = "anchor";
    a.href = "#" + (h.id || h.parentElement.id);
    a.setAttribute("aria-label", "Link to this heading");
    a.innerHTML = '<i class="fa-solid fa-link"></i>';
    h.appendChild(a);
  });

  // search: filters the sidebar by section text
  var links = $$(".side a.nl"),
    heads = $$(".side .gh"),
    none = $("#none");
  var texts = {};
  $$("section.doc").forEach(function (s) {
    texts[s.id] = s.textContent.toLowerCase();
  });
  var input = $("#q");
  function filter() {
    var q = input.value.trim().toLowerCase(),
      shown = 0;
    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var ok =
        !q ||
        a.textContent.toLowerCase().indexOf(q) > -1 ||
        (texts[id] || "").indexOf(q) > -1;
      a.style.display = ok ? "" : "none";
      if (ok) shown++;
    });
    heads.forEach(function (h) {
      var next = h.nextElementSibling,
        any = false;
      while (
        next &&
        !next.classList.contains("gh") &&
        !next.classList.contains("none")
      ) {
        if (next.style.display !== "none") any = true;
        next = next.nextElementSibling;
      }
      h.style.display = any ? "" : "none";
    });
    none.style.display = shown ? "none" : "block";
  }
  input.addEventListener("input", filter);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      var first = links.filter(function (a) {
        return a.style.display !== "none";
      })[0];
      if (first) {
        first.click();
        location.hash = first.getAttribute("href");
      }
    }
    if (e.key === "Escape") {
      input.value = "";
      filter();
      input.blur();
    }
  });
  document.addEventListener("keydown", function (e) {
    if (
      (e.key === "/" || (e.key === "k" && (e.ctrlKey || e.metaKey))) &&
      document.activeElement.tagName !== "INPUT"
    ) {
      e.preventDefault();
      document.body.classList.add("menu");
      input.focus();
    }
  });

  // scroll spy: sidebar and "On this page"
  var secs = $$("section.doc"),
    toc = $("#toc");
  function buildToc(sec) {
    var hs = $$("h3", sec);
    toc.innerHTML = hs.length
      ? "<h6>On this page</h6>" +
        hs
          .map(function (h) {
            return (
              '<a href="#' + h.id + '">' + h.firstChild.textContent + "</a>"
            );
          })
          .join("")
      : "";
  }
  var current = "";
  function spy() {
    var y = window.scrollY + 120,
      active = secs[0];
    secs.forEach(function (s) {
      if (s.offsetTop <= y) active = s;
    });
    if (active.id !== current) {
      current = active.id;
      links.forEach(function (a) {
        a.classList.toggle("on", a.getAttribute("href") === "#" + current);
      });
      var on = $(".side a.on");
      if (on) {
        var r = on.getBoundingClientRect(),
          side = $(".side").getBoundingClientRect();
        if (r.top < side.top + 40 || r.bottom > side.bottom - 20)
          on.scrollIntoView({ block: "center" });
      }
      buildToc(active);
    }
    var hs = $$("h3", active),
      cur = null;
    hs.forEach(function (h) {
      if (h.getBoundingClientRect().top < 140) cur = h;
    });
    $$("a", toc).forEach(function (a) {
      a.classList.toggle(
        "on",
        !!cur && a.getAttribute("href") === "#" + cur.id,
      );
    });
  }
  var tick = false;
  window.addEventListener(
    "scroll",
    function () {
      if (!tick) {
        tick = true;
        requestAnimationFrame(function () {
          spy();
          tick = false;
        });
      }
    },
    { passive: true },
  );
  window.addEventListener("resize", spy);
  spy();
})();
