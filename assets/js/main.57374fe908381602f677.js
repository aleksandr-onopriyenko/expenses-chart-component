(() => {
  "use strict";

  class t {
    constructor(t, e = !1, n = ".chart-spending") {
      this.data = t, this.container = document.querySelector(n), this.isMaxSpending = e, this._createMarkup()
    }

    _createMarkup() {
      const {amount: t, day: e} = this.data;
      this.container.insertAdjacentHTML("beforeend", `\n        <div style="height: ${t}%;" class="chart-spending__item">\n          <div class="tooltip">$${t}</div>\n          <div style="background: ${this.isMaxSpending && "#76B5BCFF"}"></div>\n          <p>${e}</p>\n        </div>\n    `)
    }
  }

  document.addEventListener("DOMContentLoaded", (() => {
    (async (t = "../data.json") => (await fetch(t)).json())().then((e => {
      const n = (new Date).getDay(), s = 0 === n ? 6 : 6 === n ? 5 : n;
      e.forEach(((e, n) => {
        n === s ? new t(e, !0) : new t(e)
      }));
      const a = document.querySelectorAll(".chart-spending__item");
      a.forEach((t => t.addEventListener("mouseover", (() => {
        t.querySelector(".tooltip").classList.add("active")
      })))), a.forEach((t => t.addEventListener("mouseout", (() => {
        t.querySelector(".tooltip").classList.remove("active")
      }))))
    }))
  }))
})();
