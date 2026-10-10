(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const store = {
    get(key, fallback) {
      try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  const data = window.CAFEFLOW_DATA || { menu: [], seedOrders: [] };

  function money(value) {
    return `GHS ${Number(value).toFixed(2)}`;
  }

  function escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function toast(message) {
    let wrap = $(".toast-wrap");

    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "toast-wrap";
      document.body.appendChild(wrap);
    }

    const item = document.createElement("div");
    item.className = "toast";
    item.textContent = message;
    wrap.appendChild(item);

    setTimeout(() => item.remove(), 2400);
  }

  function getTheme() {
    return store.get("cafeflow-theme", null);
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    store.set("cafeflow-theme", theme);

    const icon = $("#themeIcon");
    if (icon) {
      icon.className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
  }

  function initTheme() {
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    applyTheme(getTheme() || preferred);

    $("#themeToggle")?.addEventListener("click", () => {
      const current = document.documentElement.dataset.theme;
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  function initNav() {
    const toggle = $("#menuToggle");
    const nav = $("#mainNav");
    const current = location.pathname.split("/").pop() || "index.html";

    toggle?.addEventListener("click", () => {
      nav?.classList.toggle("open");
    });

    $$("#mainNav a").forEach((link) => {
      if (link.getAttribute("href") === current) {
        link.classList.add("active");
      }

      link.addEventListener("click", () => {
        nav?.classList.remove("open");
      });
    });
  }

  function initReveal() {
    const elements = $$(".fade-up");

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    elements.forEach((element) => observer.observe(element));
  }

  function getMenu() {
    const overrides = store.get("cafeflow-menu-overrides", {});

    return data.menu.map((item) => ({
      ...item,
      available: overrides[item.id] ?? item.available
    }));
  }

  function getCart() {
    return store.get("cafeflow-cart", []);
  }

  function setCart(cart) {
    store.set("cafeflow-cart", cart);
    updateCartCount();
  }

  function updateCartCount() {
    const count = getCart().reduce((sum, item) => sum + item.qty, 0);
    $$("[data-cart-count]").forEach((element) => {
      element.textContent = count;
    });
  }

  function addToCart(id) {
    const item = getMenu().find((entry) => entry.id === id);

    if (!item || !item.available) {
      toast("This item is currently unavailable.");
      return;
    }

    const cart = getCart();
    const existing = cart.find((entry) => entry.id === id);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: 1
      });
    }

    setCart(cart);
    toast(`${item.name} added to your order.`);
  }

  function updateCartItem(id, change) {
    const cart = getCart();
    const item = cart.find((entry) => entry.id === id);

    if (!item) {
      return;
    }

    item.qty += change;

    const next = cart.filter((entry) => entry.qty > 0);
    setCart(next);
  }

  function cartTotal() {
    return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function getOrders() {
    const local = store.get("cafeflow-orders", []);
    return [...data.seedOrders, ...local];
  }

  function setLocalOrders(orders) {
    store.set("cafeflow-orders", orders);
  }

  function generateTicketNumber() {
    const existing = getOrders();
    const values = existing
      .map((order) => Number(order.id.replace("CF-", "")))
      .filter((value) => Number.isFinite(value));

    const next = Math.max(1043, ...values) + 1;
    return `CF-${next}`;
  }

  function createOrder(formData) {
    const cart = getCart();
    const id = generateTicketNumber();
    const now = new Date();

    const order = {
      id,
      customer: formData.customer,
      studentId: formData.studentId || "",
      payment: formData.payment,
      pickup: formData.pickup,
      note: formData.note || "",
      status: "Order Received",
      total: cartTotal(),
      createdAt: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      createdDate: now.toLocaleDateString(),
      items: cart
    };

    const local = store.get("cafeflow-orders", []);
    local.unshift(order);
    setLocalOrders(local);
    store.set("cafeflow-current-ticket", id);
    setCart([]);

    return order;
  }

  function orderStatusClass(status) {
    if (status === "Ready") {
      return "status-ready";
    }

    if (status === "Preparing") {
      return "status-preparing";
    }

    if (status === "Collected") {
      return "status-collected";
    }

    return "status-new";
  }

  function estimateWait(order) {
    const active = getOrders().filter((entry) => {
      return entry.status !== "Ready" && entry.status !== "Collected";
    });

    const index = active.findIndex((entry) => entry.id === order.id);
    const ahead = Math.max(0, index);
    const minutes = Math.max(3, ahead * 3 + 5);

    return { ahead, minutes };
  }

  function foodCard(item) {
    return `
      <article class="food-card fade-up">
        <div class="food-media">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
          <span class="food-badge">${item.available ? "Available" : "Sold Out"}</span>
        </div>
        <div class="food-body">
          <div class="food-top">
            <div>
              <h3 class="food-title">${escapeHtml(item.name)}</h3>
              <div class="food-meta">${escapeHtml(item.category)} · ~${item.prep} min</div>
            </div>
            <div class="food-price">${money(item.price)}</div>
          </div>
          <p class="food-meta" style="margin-top:10px">${escapeHtml(item.description)}</p>
          <div class="food-actions">
            <button class="btn ${item.available ? "btn-accent" : "btn-light"}" data-add="${item.id}" ${item.available ? "" : "disabled"}>
              <i class="fa-solid fa-plus"></i>
              ${item.available ? "Add to order" : "Unavailable"}
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function initHome() {
    const grid = $("#homeMenu");

    if (!grid) {
      return;
    }

    grid.innerHTML = getMenu()
      .filter((item) => item.available)
      .slice(0, 3)
      .map(foodCard)
      .join("");

    $$('[data-add]').forEach((button) => {
      button.addEventListener("click", () => addToCart(button.dataset.add));
    });

    initReveal();
  }

  function initMenu() {
    const grid = $("#menuGrid");

    if (!grid) {
      return;
    }

    const search = $("#menuSearch");
    const category = $("#menuCategory");
    const availability = $("#menuAvailability");
    const count = $("#menuCount");

    function render() {
      const q = search.value.trim().toLowerCase();
      const cat = category.value;
      const avail = availability.value;

      const filtered = getMenu().filter((item) => {
        const matchesText = [item.name, item.category, item.description]
          .join(" ")
          .toLowerCase()
          .includes(q);
        const matchesCategory = !cat || item.category === cat;
        const matchesAvailability = !avail || String(item.available) === avail;
        return matchesText && matchesCategory && matchesAvailability;
      });

      count.textContent = `${filtered.length} item${filtered.length === 1 ? "" : "s"}`;
      grid.innerHTML = filtered.length
        ? filtered.map(foodCard).join("")
        : `<div class="empty-state" style="grid-column:1/-1"><h3>No menu items match your filters.</h3></div>`;

      $$('[data-add]').forEach((button) => {
        button.addEventListener("click", () => addToCart(button.dataset.add));
      });

      initReveal();
    }

    [search, category, availability].forEach((element) => {
      element.addEventListener("input", render);
    });

    render();
  }

  function initCheckout() {
    const cartHost = $("#checkoutCart");
    const summary = $("#checkoutSummary");
    const form = $("#checkoutForm");

    if (!cartHost || !summary || !form) {
      return;
    }

    function render() {
      const cart = getCart();

      if (!cart.length) {
        cartHost.innerHTML = `
          <div class="empty-state">
            <h3>Your order is empty.</h3>
            <p>Add something from the cafeteria menu first.</p>
            <a class="btn btn-accent" href="menu.html">Browse menu</a>
          </div>
        `;
        summary.innerHTML = `<div class="summary-line total"><span>Total</span><span>GHS 0.00</span></div>`;
        form.querySelector("button[type='submit']").disabled = true;
        return;
      }

      cartHost.innerHTML = cart.map((item) => `
        <div class="cart-row">
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <div style="color:var(--muted)">${money(item.price)} each</div>
          </div>
          <div>
            <div class="qty-controls">
              <button class="qty-btn" data-dec="${item.id}" aria-label="Decrease quantity">−</button>
              <strong>${item.qty}</strong>
              <button class="qty-btn" data-inc="${item.id}" aria-label="Increase quantity">+</button>
            </div>
            <div style="margin-top:7px;text-align:right;font-weight:800">${money(item.price * item.qty)}</div>
          </div>
        </div>
      `).join("");

      summary.innerHTML = `
        <div class="summary-line">
          <span>Items</span>
          <span>${cart.reduce((sum, item) => sum + item.qty, 0)}</span>
        </div>
        <div class="summary-line">
          <span>Service fee</span>
          <span>GHS 0.00</span>
        </div>
        <div class="summary-line total">
          <span>Total</span>
          <span>${money(cartTotal())}</span>
        </div>
      `;

      $$('[data-inc]').forEach((button) => {
        button.addEventListener("click", () => {
          updateCartItem(button.dataset.inc, 1);
          render();
        });
      });

      $$('[data-dec]').forEach((button) => {
        button.addEventListener("click", () => {
          updateCartItem(button.dataset.dec, -1);
          render();
        });
      });

      form.querySelector("button[type='submit']").disabled = false;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!form.reportValidity() || !getCart().length) {
        return;
      }

      const formData = Object.fromEntries(new FormData(form).entries());
      const order = createOrder(formData);
      toast(`Ticket ${order.id} created.`);

      setTimeout(() => {
        location.href = `ticket.html?id=${encodeURIComponent(order.id)}`;
      }, 400);
    });

    render();
  }

  function renderTicket(order) {
    const wait = estimateWait(order);

    return `
      <div class="ticket-wrap">
        <article class="ticket-card">
          <div class="eyebrow">CaféFlow digital ticket</div>
          <div class="ticket-number">${escapeHtml(order.id)}</div>
          <span class="status-pill ${orderStatusClass(order.status)}">
            <i class="fa-solid fa-circle"></i>
            ${escapeHtml(order.status)}
          </span>

          <div class="ticket-divider"></div>

          <div>
            <strong>${escapeHtml(order.customer)}</strong>
            <div style="color:#6d6d72">${escapeHtml(order.createdAt)} · ${escapeHtml(order.payment)}</div>
          </div>

          <div class="ticket-divider"></div>

          <div class="ticket-items">
            ${order.items.map((item) => `
              <div class="ticket-item">
                <span>${item.qty} × ${escapeHtml(item.name)}</span>
                <strong>${money(item.qty * item.price)}</strong>
              </div>
            `).join("")}
          </div>

          <div class="ticket-divider"></div>

          <div class="ticket-item" style="font-size:1.15rem">
            <strong>Total</strong>
            <strong>${money(order.total)}</strong>
          </div>

          <button class="btn btn-light" style="width:100%;margin-top:20px" onclick="window.print()">
            <i class="fa-solid fa-print"></i>
            Print receipt
          </button>
        </article>

        <div>
          <div class="panel panel-pad">
            <div class="eyebrow">Live order status</div>
            <h2 style="margin-top:0">${wait.ahead} order${wait.ahead === 1 ? "" : "s"} ahead</h2>
            <p style="color:var(--muted)">Estimated wait: about ${wait.minutes} minutes.</p>

            <div class="progress-steps">
              ${["Order Received", "Preparing", "Ready", "Collected"].map((status, index) => {
                const statuses = ["Order Received", "Preparing", "Ready", "Collected"];
                const active = statuses.indexOf(order.status) >= index;
                return `
                  <div class="progress-step ${active ? "active" : ""}">
                    <span class="dot"><i class="fa-solid ${active ? "fa-check" : "fa-circle"}"></i></span>
                    <div>
                      <strong>${status}</strong>
                      <div style="color:var(--muted);font-size:.88rem">${index === 0 ? "Your ticket entered the queue." : index === 1 ? "The kitchen is working on it." : index === 2 ? "Head to the pickup counter." : "Order completed."}</div>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function initTicket() {
    const host = $("#ticketHost");

    if (!host) {
      return;
    }

    const params = new URLSearchParams(location.search);
    const id = params.get("id") || store.get("cafeflow-current-ticket", "");
    const order = getOrders().find((entry) => entry.id === id);

    if (!order) {
      host.innerHTML = `
        <div class="empty-state">
          <h3>No ticket found.</h3>
          <p>Place an order first, or use the queue page to look up a ticket.</p>
          <a class="btn btn-accent" href="menu.html">Order food</a>
        </div>
      `;
      return;
    }

    host.innerHTML = renderTicket(order);
  }

  function initQueue() {
    const preparing = $("#preparingTickets");
    const ready = $("#readyTickets");
    const lookupForm = $("#lookupForm");
    const lookupResult = $("#lookupResult");

    if (!preparing || !ready) {
      return;
    }

    const orders = getOrders();
    const preparingOrders = orders.filter((order) => order.status === "Preparing" || order.status === "Order Received");
    const readyOrders = orders.filter((order) => order.status === "Ready");

    preparing.innerHTML = preparingOrders.length
      ? preparingOrders.map((order) => `<div class="ticket-chip">${escapeHtml(order.id)}</div>`).join("")
      : `<div style="color:#aaa">No tickets preparing.</div>`;

    ready.innerHTML = readyOrders.length
      ? readyOrders.map((order) => `<div class="ticket-chip">${escapeHtml(order.id)}</div>`).join("")
      : `<div style="color:#aaa">No tickets ready.</div>`;

    lookupForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const id = $("#lookupTicket").value.trim().toUpperCase();
      const order = getOrders().find((entry) => entry.id === id);

      lookupResult.innerHTML = order
        ? `
          <div class="panel panel-pad" style="margin-top:16px">
            <strong>${escapeHtml(order.id)} · ${escapeHtml(order.customer)}</strong>
            <p style="margin:8px 0 14px;color:var(--muted)">Current status: ${escapeHtml(order.status)}</p>
            <a class="btn btn-accent" href="ticket.html?id=${encodeURIComponent(order.id)}">Open ticket</a>
          </div>
        `
        : `<div class="panel panel-pad" style="margin-top:16px">Ticket not found.</div>`;
    });
  }

  function initHistory() {
    const body = $("#historyBody");

    if (!body) {
      return;
    }

    const orders = store.get("cafeflow-orders", []);

    body.innerHTML = orders.length
      ? orders.map((order) => `
          <tr>
            <td><a href="ticket.html?id=${encodeURIComponent(order.id)}"><strong>${escapeHtml(order.id)}</strong></a></td>
            <td>${escapeHtml(order.createdDate || "Today")} ${escapeHtml(order.createdAt)}</td>
            <td>${order.items.reduce((sum, item) => sum + item.qty, 0)}</td>
            <td>${money(order.total)}</td>
            <td><span class="status-pill ${orderStatusClass(order.status)}">${escapeHtml(order.status)}</span></td>
          </tr>
        `).join("")
      : `<tr><td colspan="5">No customer orders have been created on this browser yet.</td></tr>`;
  }

  function updateLocalOrderStatus(id, status) {
    const local = store.get("cafeflow-orders", []);
    const order = local.find((entry) => entry.id === id);

    if (!order) {
      return;
    }

    order.status = status;
    setLocalOrders(local);
  }

  function staffOrderCard(order) {
    return `
      <article class="order-card">
        <div class="order-head">
          <div>
            <div class="eyebrow" style="margin-bottom:5px">${escapeHtml(order.id)}</div>
            <h3 style="margin:0">${escapeHtml(order.customer)}</h3>
          </div>
          <span class="status-pill ${orderStatusClass(order.status)}">${escapeHtml(order.status)}</span>
        </div>
        <p style="color:var(--muted);margin:12px 0 0">${order.items.map((item) => `${item.qty}× ${escapeHtml(item.name)}`).join(" · ")}</p>
        <div class="order-actions">
          ${order.status === "Order Received" ? `<button class="btn btn-soft" data-status="Preparing" data-order="${order.id}">Start preparing</button>` : ""}
          ${order.status === "Preparing" ? `<button class="btn btn-accent" data-status="Ready" data-order="${order.id}">Mark ready</button>` : ""}
          ${order.status === "Ready" ? `<button class="btn btn-dark" data-status="Collected" data-order="${order.id}">Mark collected</button>` : ""}
        </div>
      </article>
    `;
  }

  function initStaff() {
    const host = $("#staffOrders");

    if (!host) {
      return;
    }

    function render() {
      const orders = getOrders().filter((order) => order.status !== "Collected");
      const revenue = getOrders().reduce((sum, order) => sum + order.total, 0);

      $("#statOrders").textContent = getOrders().length;
      $("#statActive").textContent = orders.length;
      $("#statReady").textContent = orders.filter((order) => order.status === "Ready").length;
      $("#statRevenue").textContent = money(revenue);

      host.innerHTML = orders.length
        ? orders.map(staffOrderCard).join("")
        : `<div class="empty-state" style="grid-column:1/-1"><h3>No active tickets.</h3></div>`;

      $$('[data-status]').forEach((button) => {
        button.addEventListener("click", () => {
          updateLocalOrderStatus(button.dataset.order, button.dataset.status);
          toast(`${button.dataset.order} updated to ${button.dataset.status}.`);
          render();
        });
      });
    }

    render();
  }

  function initAvailability() {
    const host = $("#availabilityList");

    if (!host) {
      return;
    }

    function render() {
      const menu = getMenu();

      host.innerHTML = menu.map((item) => `
        <div class="cart-row">
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <div style="color:var(--muted)">${escapeHtml(item.category)}</div>
          </div>
          <button class="btn ${item.available ? "btn-light" : "btn-accent"}" data-toggle-availability="${item.id}">
            ${item.available ? "Mark sold out" : "Make available"}
          </button>
        </div>
      `).join("");

      $$('[data-toggle-availability]').forEach((button) => {
        button.addEventListener("click", () => {
          const overrides = store.get("cafeflow-menu-overrides", {});
          const item = getMenu().find((entry) => entry.id === button.dataset.toggleAvailability);
          overrides[item.id] = !item.available;
          store.set("cafeflow-menu-overrides", overrides);
          render();
        });
      });
    }

    render();
  }

  function initAnalytics() {
    const popular = $("#popularItems");

    if (!popular) {
      return;
    }

    const orders = getOrders();
    const counts = {};
    let revenue = 0;
    let completed = 0;

    orders.forEach((order) => {
      revenue += order.total;

      if (order.status === "Collected") {
        completed += 1;
      }

      order.items.forEach((item) => {
        counts[item.name] = (counts[item.name] || 0) + item.qty;
      });
    });

    const ranked = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const max = Math.max(1, ...ranked.map((entry) => entry[1]));

    $("#analyticsRevenue").textContent = money(revenue);
    $("#analyticsOrders").textContent = orders.length;
    $("#analyticsAverage").textContent = money(orders.length ? revenue / orders.length : 0);
    $("#analyticsCompleted").textContent = completed;

    popular.innerHTML = ranked.map(([name, count]) => `
      <div class="bar-row">
        <span>${escapeHtml(name)}</span>
        <div class="bar-track">
          <div class="bar-fill" style="width:${(count / max) * 100}%"></div>
        </div>
        <strong>${count}</strong>
      </div>
    `).join("");
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initNav();
    updateCartCount();
    initReveal();
    initHome();
    initMenu();
    initCheckout();
    initTicket();
    initQueue();
    initHistory();
    initStaff();
    initAvailability();
    initAnalytics();
  });
})();
