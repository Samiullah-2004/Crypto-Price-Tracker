// ── HELPERS ──────────────────────────────────────

function formatMarketCap(num) {
    if (num >= 1e12) return "$" + (num / 1e12).toFixed(2) + "T";
    if (num >= 1e9) return "$" + (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return "$" + (num / 1e6).toFixed(2) + "M";
    return "$" + num.toLocaleString();
}

function formatPrice(p) {
    if (p >= 1000) return "$" + p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (p >= 1) return "$" + p.toFixed(4);
    return "$" + p.toFixed(6);
}

function changeBadge(val) {
    let cls = val >= 0 ? "up" : "dn";
    let sign = val >= 0 ? "+" : "";
    return `<span class="${cls}">${sign}${val.toFixed(2)}%</span>`;
}

// 1. GLOBAL STATS → hero section

async function loadGlobalStats() {
    try {
        let res = await fetch("https://api.coingecko.com/api/v3/global");
        let json = await res.json();
        let g = json.data;

        let boxes = document.querySelectorAll(".market-data .data");

        boxes[0].innerText = formatMarketCap(g.total_market_cap.usd);

        let chg = g.market_cap_change_percentage_24h_usd;
        boxes[1].innerText = (chg >= 0 ? "+" : "") + chg.toFixed(2) + "%";
        boxes[1].style.color = chg >= 0 ? "#22c55e" : "#ef4444";

        boxes[2].innerText = formatMarketCap(g.total_volume.usd);
        boxes[3].innerText = g.market_cap_percentage.btc.toFixed(1) + "%";

    } catch (err) {
        console.error("Global stats error:", err);
    }
}

//  2. COINS → ticker bar + table 

async function loadCoins() {
    try {
        let res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false");
        let coins = await res.json();

        updateTickerBar(coins);
        updateTable(coins);

    } catch (err) {
        console.error("Coins fetch error:", err);
    }
}

// TICKER BAR (first 6 coins)

function updateTickerBar(coins) {
    let ticker = document.querySelector(".coin-data");
    ticker.innerHTML = "";

    coins.slice(0, 6).forEach(coin => {
        let chg = coin.price_change_percentage_24h;
        let cls = chg >= 0 ? "up" : "dn";
        let sign = chg >= 0 ? "+" : "";

        let box = document.createElement("div");
        box.className = "coin-data-box";
        box.innerHTML = `
            <div class="coin-name">
                ${coin.symbol.toUpperCase()} <b>${formatPrice(coin.current_price)}</b>
            </div>
            <span class="${cls}">${sign}${chg.toFixed(1)}%</span>
        `;
        ticker.appendChild(box);
    });
}

//  TABLE (top 5 coins) 

function updateTable(coins) {
    let rows = document.querySelectorAll("table tr");

    coins.slice(0, 5).forEach((coin, i) => {
        let row = rows[i + 1];
        let cells = row.querySelectorAll("td");

        cells[1].innerHTML = `${coin.name}<small>${coin.symbol.toUpperCase()}</small>`;
        cells[2].innerText = formatPrice(coin.current_price);
        cells[3].innerHTML = changeBadge(coin.price_change_percentage_24h);
        cells[4].innerText = formatMarketCap(coin.market_cap);
    });
}

// RUN + auto-refresh every 60s 

loadGlobalStats();
loadCoins();

setInterval(() => {
    loadGlobalStats();
    loadCoins();
}, 60000);
