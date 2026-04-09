let currentUser = null
let currentRole = null
let appData = {}
let cartItems = []

document.addEventListener("DOMContentLoaded", () => {
  loadData()
})

async function loadData() {
  try {
    const response = await fetch("menu.json")
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    appData = await response.json()
    showLoginScreen()
  } catch (error) {
    console.error("Error loading data:", error)
    appData = getDefaultData()
    showLoginScreen()
  }
}

function renderApp() {
  const app = document.getElementById("app")

  if (!currentUser) {
    showLoginScreen()
    return
  }

  app.innerHTML = `
    <div class="mobile-container">
      <div class="header">
        <h1>
          <span class="header-tori">TORI</span>
          <span class="header-cafeteria">Cafeteria</span>
        </h1>
        <button class="logout-btn" onclick="logout()">Logout</button>
      </div>
      <div class="main-content" id="main-content">
        ${renderRoleContent()}
      </div>
    </div>
  `
}

function showLoginScreen() {
  const app = document.getElementById("app")
  app.innerHTML = `
    <div class="login-container">
      <div class="login-box">
        <div class="tori-brand">TORI</div>
        <div class="tori-brand-sub">Cafeteria</div>
        <form onsubmit="handleLogin(event)">
          <div class="form-group">
            <label for="role">Select Role:</label>
            <select id="role" required>
              <option value="">-- Choose --</option>
              <option value="admin">Admin</option>
              <option value="customer">Customer</option>
              <option value="cashier">Cashier</option>
            </select>
          </div>
          <div class="form-group">
            <label for="username">Username:</label>
            <input type="text" id="username" placeholder="Enter username" required>
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" placeholder="Enter password" required>
          </div>
          <button type="submit" class="login-btn">Login</button>
        </form>
      </div>
    </div>
  `
}

function handleLogin(event) {
  event.preventDefault()
  const role = document.getElementById("role").value
  const username = document.getElementById("username").value

  if (role && username) {
    currentRole = role
    currentUser = { username, role }
    renderApp()
  }
}

function logout() {
  currentUser = null
  currentRole = null
  cartItems = []
  showLoginScreen()
}

function renderRoleContent() {
  switch (currentRole) {
    case "admin":
      return renderAdminDashboard()
    case "customer":
      return renderCustomerPortal()
    case "cashier":
      return renderCashierTerminal()
    default:
      return "<p>Unknown role</p>"
  }
}

// ============ ADMIN DASHBOARD ============
function renderAdminDashboard() {
  return `
    <div class="nav-tabs">
      <button class="nav-tab active" onclick="switchAdminTab('overview')">Overview</button>
      <button class="nav-tab" onclick="switchAdminTab('users')">Users</button>
      <button class="nav-tab" onclick="switchAdminTab('reports')">Reports</button>
    </div>
    <div id="admin-content">
      ${renderAdminOverview()}
    </div>
  `
}

function renderAdminOverview() {
  return `
    <div class="stats-grid">
      <div class="stat-box">
        <div class="number">${appData.stats?.totalUsers || 0}</div>
        <div class="label">Total Users</div>
      </div>
      <div class="stat-box">
        <div class="number">${appData.stats?.totalOrders || 0}</div>
        <div class="label">Total Orders</div>
      </div>
      <div class="stat-box">
        <div class="number">₱${appData.stats?.totalRevenue || 0}</div>
        <div class="label">Revenue</div>
      </div>
      <div class="stat-box">
        <div class="number">${appData.stats?.activeUsers || 0}</div>
        <div class="label">Active Users</div>
      </div>
    </div>
    <div class="card">
      <h3>Recent Orders</h3>
      ${
        appData.recentOrders
          ?.slice(0, 3)
          .map(
            (order) => `
          <div style="padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
            <p><strong>Order #${order.id}</strong> - ${order.customer}</p>
            <p style="font-size: 0.85rem; color: var(--text-secondary);">₱${order.amount} • ${order.status}</p>
          </div>
        `,
          )
          .join("") || "<p>No orders</p>"
      }
    </div>
  `
}

function switchAdminTab(tab) {
  const content = document.getElementById("admin-content")
  const tabs = document.querySelectorAll(".nav-tab")

  tabs.forEach((t) => t.classList.remove("active"))
  event.target.classList.add("active")

  switch (tab) {
    case "overview":
      content.innerHTML = renderAdminOverview()
      break
    case "users":
      content.innerHTML = renderAdminUsers()
      break
    case "reports":
      content.innerHTML = renderAdminReports()
      break
  }
}

function renderAdminUsers() {
  return `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${
            appData.users
              ?.map(
                (user) => `
              <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span style="color: var(--success);">● ${user.status}</span></td>
              </tr>
            `,
              )
              .join("") || '<tr><td colspan="3">No users</td></tr>'
          }
        </tbody>
      </table>
    </div>
  `
}

function renderAdminReports() {
  return `
    <div class="card">
      <h3>Sales Report</h3>
      <p>Monthly Sales: <strong>₱${appData.stats?.monthlySales || 0}</strong></p>
      <p style="margin-top: 1rem;">Top Products:</p>
      <ul style="margin-top: 0.5rem; margin-left: 1rem;">
        ${
          appData.topProducts
            ?.slice(0, 5)
            .map((p) => `<li>${p.name} - ${p.sales} sold</li>`)
            .join("") || "<li>No data</li>"
        }
      </ul>
    </div>
  `
}

// ============ CUSTOMER PORTAL ============
function renderCustomerPortal() {
  return `
    <div class="nav-tabs">
      <button class="nav-tab active" onclick="switchCustomerTab('browse')">Menu</button>
      <button class="nav-tab" onclick="switchCustomerTab('roulette')">Spin & Order</button>
      <button class="nav-tab" onclick="switchCustomerTab('cart')">Cart (${cartItems.length})</button>
      <button class="nav-tab" onclick="switchCustomerTab('orders')">Orders</button>
    </div>
    <div id="customer-content">
      ${renderCustomerBrowse()}
    </div>
  `
}

function renderCustomerBrowse() {
  const hotCoffee = appData.products?.filter((p) => p.category_id === 1) || []
  const coldBlended = appData.products?.filter((p) => p.category_id === 2) || []
  const frappuccino = appData.products?.filter((p) => p.category_id === 3) || []
  const sodas = appData.products?.filter((p) => p.category_id === 4) || []
  const waffles = appData.products?.filter((p) => p.category_id === 5) || []

  const categories = {
    "Hot Coffee": hotCoffee,
    "Cold/Blended": coldBlended,
    Frappuccinos: frappuccino,
    Sodas: sodas,
    Waffles: waffles,
  }

  let html = ""
  for (const [category, products] of Object.entries(categories)) {
    if (products.length > 0) {
      html += `<h3 style="color: var(--accent-brown); margin-top: 1.5rem; margin-bottom: 1rem; font-size: 1.2rem;">${category}</h3>`
      html += `<div class="product-grid">`
      products.forEach((product) => {
        html += `
          <div class="product-card" onclick="addToCart(${JSON.stringify(product)})">
            <div class="product-image">☕</div>
            <div class="product-info">
              <div class="product-name">${product.product_name} ${product.size || ""}</div>
              <div class="product-price">₱${product.product_price}</div>
              <button class="btn btn-primary btn-small">Add to Cart</button>
            </div>
          </div>
        `
      })
      html += `</div>`
    }
  }
  return html
}

function renderCustomerRoulette() {
  const allDrinks =
    appData.products
      ?.filter((p) => p.product_name)
      .map((p) => ({ name: p.product_name, price: p.product_price, size: p.size, id: p.id }))
      .slice(0, 20) || []

  const drinksStr = allDrinks.map((d) => `${d.name} ${d.size || ""}`).join("|")

  return `
    <div class="roulette-container">
      <div class="roulette-title">Can't Decide? Spin the Roulette!</div>
      <div class="roulette-pointer"></div>
      <div class="roulette-wheel" id="roulette-wheel">
        <div class="roulette-center">🎲</div>
      </div>
      <div class="roulette-result" id="roulette-result" style="display: none;">
        <div class="roulette-result-drink">
          <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Your Lucky Pick:</div>
          <div id="selected-drink" style="font-size: 1.2rem;">Pick a drink!</div>
        </div>
      </div>
      <button class="roulette-spin-btn" id="spin-btn" data-drinks="${drinksStr}">Spin the Roulette</button>
    </div>
  `
}

function spinRoulette() {
  const spinBtn = document.getElementById("spin-btn")
  const drinksStr = spinBtn.getAttribute("data-drinks")
  const drinks = drinksStr.split("|")
  const wheel = document.getElementById("roulette-wheel")
  const result = document.getElementById("roulette-result")

  spinBtn.disabled = true
  wheel.classList.add("spinning")

  setTimeout(() => {
    wheel.classList.remove("spinning")
    const randomDrink = drinks[Math.floor(Math.random() * drinks.length)]
    document.getElementById("selected-drink").textContent = randomDrink
    result.style.display = "flex"
    spinBtn.disabled = false
  }, 2000)
}

function switchCustomerTab(tab) {
  const content = document.getElementById("customer-content")
  const tabs = document.querySelectorAll(".nav-tab")

  tabs.forEach((t) => t.classList.remove("active"))
  event.target.classList.add("active")

  switch (tab) {
    case "browse":
      content.innerHTML = renderCustomerBrowse()
      break
    case "roulette":
      content.innerHTML = renderCustomerRoulette()
      setTimeout(() => {
        const spinBtn = document.getElementById("spin-btn")
        if (spinBtn) spinBtn.addEventListener("click", spinRoulette)
      }, 0)
      break
    case "cart":
      content.innerHTML = renderCustomerCart()
      break
    case "orders":
      content.innerHTML = renderCustomerOrders()
      break
  }
}

function addToCart(product) {
  const existingItem = cartItems.find((item) => item.id === product.id)

  if (existingItem) {
    existingItem.qty = (existingItem.qty || 1) + 1
  } else {
    cartItems.push({
      id: product.id,
      name: `${product.product_name} ${product.size || ""}`,
      price: product.product_price,
      qty: 1,
    })
  }
  alert(`${product.product_name} added to cart!`)
}

function renderCustomerCart() {
  const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0)

  return `
    <div>
      ${
        cartItems.length > 0
          ? cartItems
              .map(
                (item, idx) => `
          <div class="cart-item">
            <div class="cart-item-info">
              <h4>${item.name}</h4>
              <p>Price: ₱${item.price || 0}</p>
              <div class="cart-item-controls">
                <div class="qty-control">
                  <button onclick="updateQty(${idx}, -1)">−</button>
                  <span id="qty-${idx}">${item.qty || 1}</span>
                  <button onclick="updateQty(${idx}, 1)">+</button>
                </div>
                <button class="btn btn-danger btn-small" onclick="removeFromCart(${idx})">Remove</button>
              </div>
            </div>
            <div class="cart-item-total">₱${(item.price || 0) * (item.qty || 1)}</div>
          </div>
        `,
              )
              .join("")
          : "<p style='text-align: center; padding: 2rem;'>Your cart is empty</p>"
      }
      ${
        cartItems.length > 0
          ? `
        <div class="cart-summary">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>₱${total}</span>
          </div>
          <div class="summary-row">
            <span>Tax (12%):</span>
            <span>₱${Math.round(total * 0.12)}</span>
          </div>
          <div class="summary-row total">
            <span>Total:</span>
            <span>₱${Math.round(total * 1.12)}</span>
          </div>
          <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Proceed to Checkout</button>
          <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary" style="flex: 1;" onclick="checkoutWithCashier()">Pay with Cashier</button>
            <button class="btn btn-primary" style="flex: 1;" onclick="checkoutOnline()">Online Payment</button>
          </div>
        </div>
      `
          : ""
      }
    </div>
  `
}

function updateQty(idx, change) {
  const newQty = (cartItems[idx].qty || 1) + change
  if (newQty > 0) {
    cartItems[idx].qty = newQty
    renderApp()
  } else {
    removeFromCart(idx)
  }
}

function removeFromCart(idx) {
  cartItems.splice(idx, 1)
  renderApp()
}

function checkoutWithCashier() {
  const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0)
  alert(`Order ready! Total: ₱${Math.round(total * 1.12)}\nPlease proceed to cashier`)
  cartItems = []
  renderApp()
}

function checkoutOnline() {
  const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0)
  alert(`Processing online payment: ₱${Math.round(total * 1.12)}\nThank you for your order!`)
  cartItems = []
  renderApp()
}

function renderCustomerOrders() {
  return `
    <div>
      ${
        appData.recentOrders
          ?.slice(0, 5)
          .map(
            (order) => `
        <div class="card">
          <h3>Order #${order.id}</h3>
          <p><strong>${order.customer}</strong></p>
          <p style="margin-top: 0.5rem; color: var(--text-secondary);">
            Amount: <strong>₱${order.amount}</strong><br>
            Status: <strong>${order.status}</strong>
          </p>
        </div>
      `,
          )
          .join("") || "<p>No orders yet</p>"
      }
    </div>
  `
}

// ============ CASHIER TERMINAL ============
function renderCashierTerminal() {
  return `
    <div class="nav-tabs">
      <button class="nav-tab active" onclick="switchCashierTab('pos')">POS</button>
      <button class="nav-tab" onclick="switchCashierTab('transactions')">Transactions</button>
      <button class="nav-tab" onclick="switchCashierTab('inventory')">Inventory</button>
    </div>
    <div id="cashier-content">
      ${renderCashierPOS()}
    </div>
  `
}

function renderCashierPOS() {
  const cashierCart = cartItems.length > 0 ? cartItems : []
  const total = cashierCart.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0)

  return `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
      <div>
        <h3 style="color: var(--accent-brown); margin-bottom: 1rem;">Quick Products</h3>
        <div class="product-grid">
          ${appData.products
            ?.slice(0, 4)
            .map((product) => {
              return `
                <div class="product-card" onclick="addToCart(${JSON.stringify(product)})">
                  <div class="product-image">☕</div>
                  <div class="product-info">
                    <div class="product-name">${product.product_name}</div>
                    <div class="product-price">₱${product.product_price}</div>
                    <button class="btn btn-primary btn-small">Add</button>
                  </div>
                </div>
              `
            })
            .join("")}
        </div>
      </div>
      <div>
        <h3 style="color: var(--accent-brown); margin-bottom: 1rem;">Current Order</h3>
        ${
          cashierCart.length > 0
            ? `
          <div style="background-color: white; padding: 1rem; border-radius: 8px; box-shadow: var(--shadow);">
            ${cashierCart
              .map(
                (item, idx) => `
              <div style="padding: 0.5rem 0; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                <span>${item.name} x${item.qty || 1}</span>
                <strong>₱${(item.price || 0) * (item.qty || 1)}</strong>
              </div>
            `,
              )
              .join("")}
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid var(--border-color);">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>Total:</span>
                <strong style="font-size: 1.2rem; color: var(--accent-brown);">₱${total}</strong>
              </div>
              <button class="btn btn-success" style="width: 100%; padding: 0.75rem; margin-top: 0.75rem;" onclick="completeTransaction()">Complete Sale</button>
              <button class="btn btn-secondary" style="width: 100%; padding: 0.75rem; margin-top: 0.5rem;" onclick="clearCart()">Clear Order</button>
            </div>
          </div>
        `
            : "<p>No items in current order</p>"
        }
      </div>
    </div>
  `
}

function completeTransaction() {
  if (cartItems.length === 0) return
  const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0)
  alert("Transaction completed! Total: ₱" + Math.round(total * 1.12))
  cartItems = []
  renderApp()
}

function clearCart() {
  cartItems = []
  renderApp()
}

function switchCashierTab(tab) {
  const content = document.getElementById("cashier-content")
  const tabs = document.querySelectorAll(".nav-tab")

  tabs.forEach((t) => t.classList.remove("active"))
  event.target.classList.add("active")

  switch (tab) {
    case "pos":
      content.innerHTML = renderCashierPOS()
      break
    case "transactions":
      content.innerHTML = renderCashierTransactions()
      break
    case "inventory":
      content.innerHTML = renderCashierInventory()
      break
  }
}

function renderCashierTransactions() {
  return `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Amount</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          ${
            appData.transactions
              ?.slice(0, 10)
              .map(
                (tx) => `
            <tr>
              <td>#${tx.id}</td>
              <td>₱${tx.amount}</td>
              <td>${tx.time}</td>
            </tr>
          `,
              )
              .join("") || '<tr><td colspan="3">No transactions</td></tr>'
          }
        </tbody>
      </table>
    </div>
  `
}

function renderCashierInventory() {
  return `
    <div>
      ${
        appData.products
          ?.map(
            (product) => `
        <div class="card">
          <h3>${product.product_name} ${product.size || ""}</h3>
          <p>Price: <strong>₱${product.product_price}</strong></p>
        </div>
      `,
          )
          .join("") || "<p>No inventory data</p>"
      }
    </div>
  `
}

function getDefaultData() {
  return {
    stats: {
      totalUsers: 456,
      totalOrders: 2850,
      totalRevenue: 85420,
      activeUsers: 234,
      monthlySales: 28500,
    },
    users: [
      { name: "Alice Johnson", email: "alice@example.com", status: "Active" },
      { name: "Bob Smith", email: "bob@example.com", status: "Active" },
    ],
    products: [],
    recentOrders: [],
    topProducts: [],
    transactions: [],
  }
}