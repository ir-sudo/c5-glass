// ===================== Quote demo (embedded widget) =====================
(function () {
  const grid = document.getElementById("jobs");
  if (!grid) return;
  const byId = (id) => document.getElementById(id);
  const screens = document.querySelectorAll(".qt__screen");
  const stepFor = { "s-pick": "service", "s-details": "details", "s-contact": "contact", "s-done": "contact" };
  const show = (id) => {
    screens.forEach((s) => s.classList.toggle("is-active", s.id === id));
    const cur = stepFor[id];
    document.querySelectorAll("#qtSteps span").forEach((sp) => sp.classList.toggle("is-on", sp.getAttribute("data-step") === cur));
  };

  const SERVICES = [
    { id: "shower", label: "Frameless shower enclosure", mode: "instant",
      fields: [
        { k: "configuration", label: "Configuration", type: "select", opts: ["Door only", "Door + return panel", "Door + 2 panels", "Neo-angle (corner)"] },
        { k: "opening", label: "Opening size", type: "select", opts: ['Standard (up to 60" wide)', 'Large (over 60" wide)'] },
        { k: "thickness", label: "Glass thickness", type: "select", opts: ['3/8"', '1/2"'] },
        { k: "glassType", label: "Glass type", type: "select", opts: ["Clear", "Low-iron (ultra-clear)", "Frosted", "Tinted"] },
        { k: "hardware", label: "Hardware finish", type: "select", opts: ["Chrome / polished", "Brushed nickel", "Matte black", "Brass / gold"] },
      ],
      price: (v) => {
        let b = 1200;
        b += { "Door only": 0, "Door + return panel": 600, "Door + 2 panels": 1200, "Neo-angle (corner)": 1500 }[v.configuration] || 0;
        if ((v.opening || "").indexOf("Large") === 0) b += 500;
        if (v.thickness === '1/2"') b += 400;
        b += { "Clear": 0, "Low-iron (ultra-clear)": 300, "Frosted": 200, "Tinted": 250 }[v.glassType] || 0;
        b += { "Chrome / polished": 0, "Brushed nickel": 80, "Matte black": 150, "Brass / gold": 180 }[v.hardware] || 0;
        return b;
      } },
    { id: "mirror", label: "Custom mirror", mode: "instant",
      fields: [
        { k: "width", label: "Width (inches)", type: "number", ph: "e.g. 48" },
        { k: "height", label: "Height (inches)", type: "number", ph: "e.g. 36" },
        { k: "thickness", label: "Thickness", type: "select", opts: ['1/8"', '1/4"', '3/8"'] },
        { k: "edge", label: "Edge finish", type: "select", opts: ["Flat polished", "Beveled", "Pencil polish", "Seamed (no polish)"] },
      ],
      price: (v) => {
        const sqft = (v.width * v.height) / 144;
        const t = { '1/8"': 0.85, '1/4"': 1, '3/8"': 1.3 }[v.thickness] || 1;
        const e = { "Seamed (no polish)": 0.9, "Flat polished": 1, "Pencil polish": 1.1, "Beveled": 1.35 }[v.edge] || 1;
        return (60 + sqft * 14) * t * e;
      } },
    { id: "window", label: "Window / glass pane replacement", mode: "instant",
      fields: [
        { k: "pw", label: "Pane width (inches)", type: "number", ph: "e.g. 30" },
        { k: "ph", label: "Pane height (inches)", type: "number", ph: "e.g. 40" },
        { k: "panes", label: "How many panes?", type: "number", ph: "e.g. 1" },
        { k: "glassType", label: "Glass type", type: "select", opts: ["Single-pane", "Double-pane (insulated)"] },
        { k: "tempered", label: "Tempered (safety) glass?", type: "select", opts: ["No / not sure", "Yes"] },
      ],
      price: (v) => {
        const sqft = (v.pw * v.ph) / 144;
        const panes = Math.max(1, v.panes || 1);
        let per = 90 + sqft * 18;
        if (v.glassType === "Double-pane (insulated)") per *= 1.6;
        if (v.tempered === "Yes") per *= 1.4;
        return per * panes;
      } },
    { id: "railings", label: "Glass & hand railings", mode: "callback",
      fields: [{ k: "details", label: "Tell us what you need", type: "textarea", ph: "A few details — the location, rough size, anything helpful." }] },
    { id: "commercial", label: "Commercial door / hardware repair", mode: "callback",
      fields: [{ k: "details", label: "Tell us what you need", type: "textarea", ph: "A few details — what's broken, the location, rough size, anything helpful." }] },
    { id: "storefront", label: "Storefront / commercial glass", mode: "callback",
      fields: [{ k: "details", label: "Tell us what you need", type: "textarea", ph: "A few details — the location, rough size, anything helpful." }] },
    { id: "other", label: "Something else / not sure", mode: "callback",
      fields: [{ k: "details", label: "Tell us what you need", type: "textarea", ph: "A few details — what you need, the location, rough size, anything helpful." }] },
  ];

  let current = null;
  let lastRange = "";
  const r10 = (n) => Math.round(n / 10) * 10;

  // build the service grid
  SERVICES.forEach((svc) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "qt__job";
    b.innerHTML = '<span class="qt__job-name">' + svc.label + '</span><span class="qt__job-tag' + (svc.mode === "callback" ? " is-cb" : "") + '">' + (svc.mode === "instant" ? "Instant estimate" : "Fast callback") + "</span>";
    b.addEventListener("click", () => openDetails(svc));
    grid.appendChild(b);
  });

  function openDetails(svc) {
    current = svc;
    byId("detailsTitle").textContent = svc.label;
    const wrap = byId("detailFields");
    wrap.innerHTML = "";
    svc.fields.forEach((f) => {
      const cell = document.createElement("div");
      cell.className = "field" + (f.type === "textarea" ? " qt-field--full" : "");
      const id = "f_" + f.k;
      let inner = '<label for="' + id + '">' + f.label + "</label>";
      if (f.type === "number") inner += '<input type="number" id="' + id + '" min="1" placeholder="' + (f.ph || "") + '" required />';
      else if (f.type === "textarea") inner += '<textarea id="' + id + '" placeholder="' + (f.ph || "") + '" required></textarea>';
      else inner += '<select id="' + id + '" required><option value="">Choose…</option>' + f.opts.map((o) => "<option>" + o + "</option>").join("") + "</select>";
      cell.innerHTML = inner;
      wrap.appendChild(cell);
    });
    show("s-details");
  }

  // format phone input as (xxx) xxx-xxxx while typing
  (function attachPhone() {
    const el = byId("cp");
    if (!el) return;
    el.addEventListener("input", () => {
      const d = el.value.replace(/\D/g, "").slice(0, 10);
      let out = d;
      if (d.length > 6) out = "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
      else if (d.length > 3) out = "(" + d.slice(0, 3) + ") " + d.slice(3);
      else if (d.length > 0) out = "(" + d;
      el.value = out;
    });
  })();

  // details → contact (compute ballpark for instant services)
  byId("s-details").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!current) return;
    const v = {};
    current.fields.forEach((f) => { const el = byId("f_" + f.k); v[f.k] = f.type === "number" ? +el.value || 0 : el.value; });
    if (current.mode === "instant") {
      const n = current.price(v);
      lastRange = "$" + r10(n * 0.9) + "–$" + r10(n * 1.2);
      byId("range").textContent = lastRange;
      byId("estimateBox").hidden = false;
      byId("contactBtn").textContent = "Get my estimate";
    } else {
      lastRange = "";
      byId("estimateBox").hidden = true;
      byId("contactBtn").textContent = "Request my callback";
    }
    show("s-contact");
  });

  // contact → done (confirm with the value)
  byId("s-contact").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = byId("cn").value;
    const phone = byId("cp").value;
    if (current && current.mode === "instant") {
      byId("doneTitle").textContent = "You're all set, " + name + "!";
      byId("doneMsg").textContent = "Your ballpark is " + lastRange + ". We'll confirm the exact price after a free measurement and text it to " + phone + ".";
    } else {
      byId("doneTitle").textContent = "Request sent, " + name + "!";
      byId("doneMsg").textContent = "We've got your details — we'll call you back fast at " + phone + ".";
    }
    show("s-done");
  });

  document.querySelectorAll(".qt__back").forEach((btn) => {
    btn.addEventListener("click", () => show(btn.getAttribute("data-to")));
  });

  show("s-pick");
})();
