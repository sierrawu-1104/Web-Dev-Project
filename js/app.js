
const $ = (id) => document.getElementById(id); //get DOM elements by ID
const money = (n) => n.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}); //Format Money
const decToAm = (d) => d<=1?0:(d>=2?Math.round((d-1)*100): -Math.round(100/(d-1)));  // Convert decimal odds to American odds format



// ===Fetching odds from API===

// Fetches odds for a given sport from The Odds API
// -Builds the request URL with proper parameters (some from user input)
// -Pulls API key from localStorage or if not, the input box
// -Throws error if API key missing or response not as expected
async function fetchAllBookmakersOdds({ sport }){
  const u = new URL("https://api.the-odds-api.com/v4/sports/"+sport+"/odds");
  u.searchParams.set("regions","us,uk,eu,au");
  u.searchParams.set("markets","h2h,spreads,totals");
  u.searchParams.set("oddsFormat","decimal");
  const apiKey = localStorage.getItem("odds_api_key") || $("apiKey")?.value?.trim();
  if (!apiKey) throw new Error("Paste your API key first.");
  u.searchParams.set("apiKey", apiKey);
  const res = await fetch(u.toString(), {mode:"cors"});
  if (!res.ok){ throw new Error(`Odds fetch failed: ${res.status}`); }
  return res.json();
}


// ===Math helpers for arbitrage calculations===

// -Given bankroll B and odds prices, split bankroll into stakes
//  so that all outcomes return the same payout           <---------In a future iteration would like to offer option to round to nearest 0 or 5 dollars
function splitStakes(B, prices){
  const inv = prices.map(p=>1/p), S = inv.reduce((a,b)=>a+b,0);
  return prices.map(p => B * ((1/p)/S));
}


// Pack all the key info about one arbitrage opportunity into an object, prepping for later
function pack(evt, market, prices, S, roi, same){
  return { market, commenceTime: evt.commence_time, teams: evt.teams || [evt.home_team, evt.away_team].filter(Boolean),
           prices, sumInverse:S, roi, sameBookConflict: same };
}

// Normalize team/outcome names across sportsbooks for consistency (some formatting discrepancies)
function norm(name, key, evt){
  let k = (name||"").toLowerCase();
  const home=(evt.home_team||evt.teams?.[0]||"").toLowerCase();
  const away=(evt.away_team||evt.teams?.[1]||"").toLowerCase();
  if (key==="spreads"){ if (k==="home"||k===home||k.includes(home)) k="home"; else if (k==="away"||k===away||k.includes(away)) k="away"; }
  else if (key==="totals"){ if (k.startsWith("o")||k.includes("over")) k="over"; else if (k.startsWith("u")||k.includes("under")) k="under"; }
  return k;
}


// ========= Finding arbitrage opportunities =========

// Find head-to-head (h2h) arbitrage for one event
function findH2H(evt,minRoi){

  // Gather all h2h markets across all bookmakers
  const mkts=(evt.bookmakers||[]).flatMap(bk=>(bk.markets||[]).map(m=>({...m,bookmaker:bk.key})));
  const h2h=mkts.filter(m=>m.key==="h2h"); if(!h2h.length) return [];

  // Track best odds per outcome across books
  const best={}; for(const m of h2h){ for(const o of (m.outcomes||[])){
    const k=(o.name||"").toLowerCase(), price=Number(o.price);
    if(!best[k]||price>best[k].price) best[k]={ outcome:k, price, bookmaker:m.bookmaker };
  }}

  // If we have both sides, then finally compute ROI
  const outs=Object.values(best); if(outs.length<2) return [];
  const S=outs.reduce((a,o)=>a+1/o.price,0), roi=1-S;
  const same = new Set(outs.map(o=>o.bookmaker)).size < outs.length;
  return roi>minRoi ? [pack(evt,"h2h",outs,S,roi,same)] : [];
}


// Find arbs for spread or totals markets
function findLine(evt,key,minRoi){
  const mkts=(evt.bookmakers||[]).flatMap(bk=>(bk.markets||[]).map(m=>({...m,bookmaker:bk.key})));
  const buckets={};
  for(const m of mkts.filter(x=>x.key===key)){
    for(const sel of (m.outcomes||[])){
      const pt=sel.point??null, bkey=String(pt);
      const out=norm(sel.name,key,evt), price=Number(sel.price);
      const rec={ outcome:out, price, bookmaker:m.bookmaker, point: typeof pt==="number"?pt:null };
      buckets[bkey]=buckets[bkey]||{};
      if(!buckets[bkey][out] || price>buckets[bkey][out].price) buckets[bkey][out]=rec;
    }
  }
  const res=[];
  for(const [pt,sides] of Object.entries(buckets)){
    const pair=key==="totals"?["over","under"]:["home","away"];
    if(sides[pair[0]] && sides[pair[1]]){
      const picks=[sides[pair[0]],sides[pair[1]]];
      const S=picks.reduce((a,o)=>a+1/o.price,0), roi=1-S;
      const same = new Set(picks.map(o=>o.bookmaker)).size < picks.length;
      if(roi>minRoi) res.push(pack(evt,key,picks,S,roi,same));
    }
  }
  return res;
}
x



// ===Rendering results to the table for user to see===
function render(list, bankroll, oddsFormat){
  const tbody = $("tbody"); tbody.innerHTML="";
  for(const arb of list){

    // Calculate stakes for each outcome, and also format money into html
    const prices = arb.prices.map(p=>p.price);
    const stakes = splitStakes(bankroll, prices);
    const payout = stakes[0]*prices[0];
    const profit = payout - stakes.reduce((a,b)=>a+b,0);
    const priceHtml = arb.prices.map(p=>{
      const show = oddsFormat==="decimal" ? p.price : decToAm(p.price);
      return `<div class="badge">${(p.outcome||"").toUpperCase()}</div> <b>${show}</b> <span class="small">(${p.bookmaker})</span>`;
    }).join("<br>");
    const stakeHtml = stakes.map((s,i)=>`${arb.prices[i].outcome.toUpperCase()}: $${money(s)}`).join("<br>");
    const lineInfo = (arb.prices[0] && arb.prices[0].point!=null) ? `<div class="small">Line: ${arb.prices[0].point}</div>` : "";

    // Insert a row into the table
    const tr=document.createElement("tr");
    tr.innerHTML = `
      <td><b>${(arb.teams||[]).join(" vs ")}</b><div class="small">${new Date(arb.commenceTime).toLocaleString()}</div></td>
      <td><span class="badge">${arb.market}</span>${lineInfo}</td>
      <td>${priceHtml}</td>
      <td><b class="${arb.roi>0?"good":"bad"}">${(arb.roi*100).toFixed(2)}%</b><div class="small">Σ1/odds=${arb.sumInverse.toFixed(3)}</div></td>
      <td>${stakeHtml}<div class="small">Payout: $${money(payout)} • Profit: $${money(profit)}</div></td>
      <td>${arb.sameBookConflict?'<span class="warn">Same-book prices — verify</span>':''}</td>
    `;
    tbody.appendChild(tr);
  }
  $("kpiCount").textContent = String(list.length);
  $("empty").style.display = list.length ? "none" : "block";
  $("table").style.display = list.length ? "table" : "none";
}



// ===Main function===

// This is called when user clicks "Go"
// -Reads bankroll + ROI inputs
// -Fetches odds from API
// -Runs arbitrage scans for different categories(h2h, spreads, totals)
// -Sorts opportunities by ROI and renders them

async function runScan(sport){
  const bankroll = parseFloat($("bankroll").value||"0")||0;
  const minRoi = parseFloat($("minRoi").value||"0")||0;
  const oddsFormat = $("oddsFormat").value;
  $("netStatus").textContent = "Fetching odds…";
  try{
    const events = await fetchAllBookmakersOdds({ sport });
    let arbs = [];
    for(const evt of (events||[])){
      arbs.push(...findH2H(evt, minRoi));
      arbs.push(...findLine(evt, "spreads", minRoi));
      arbs.push(...findLine(evt, "totals", minRoi));
    }
    arbs.sort((a,b)=> b.roi - a.roi);

    //renders rows
    render(arbs, bankroll, oddsFormat);
    $("netStatus").textContent = `Fetched ${events.length} events. Listed ${arbs.length} arbs.`;
  }catch(e){
    $("netStatus").textContent = "Error: " + (e.message||String(e));
  }
}
