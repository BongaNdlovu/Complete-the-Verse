/* The tip jar: a goal ring, an amount picker, then PayPal's own checkout.
   PayPal's page asks the player for the amount and ignores one in the link, so the picker names the amount to enter.
   The raised total and the goal are typed in by the owner on admin.html and kept in the tip_jar table; nothing here
   reads PayPal. The numbers below are what shows until (or unless) that row can be read. */
const TIP_JAR = {
  goalUsd: 100,
  raisedUsd: 0,
  checkoutUrl: "https://www.paypal.com/ncp/payment/NG2P2GPWMG59L",
  minUsd: 1,
  maxUsd: 10000,
  defaultUsd: 5,
};
const TIP_RING_LENGTH = 100;
const TIP_REFRESH_MS = 60000;

function tipJarFilled(raisedUsd, goalUsd){
  if(!(goalUsd > 0) || !(raisedUsd > 0)) return 0;
  return Math.min(1, raisedUsd / goalUsd);
}
/* A whole number shows bare ($5); anything else shows its cents ($2.50). */
function tipJarMoney(usd){
  return "$" + (Number.isInteger(usd) ? String(usd) : usd.toFixed(2));
}
/* Returns the typed amount in dollars, or null when it is not one PayPal should be asked for. */
function tipJarParseAmount(text, minUsd, maxUsd){
  const clean = String(text || "").trim().replace(/^\$/, "");
  if(!/^\d+(\.\d{1,2})?$/.test(clean)) return null;
  const usd = Number(clean);
  if(usd < minUsd || usd > maxUsd) return null;
  return usd;
}

function bindTipJar(){
  const modal = document.getElementById("tip-modal");
  const opener = document.getElementById("menu-tip-open");
  if(!modal || !opener) return;
  const el = function(id){ return document.getElementById(id); };
  const customInput = el("tip-custom-input");
  const checkout = el("tip-checkout");
  const amountButtons = [].slice.call(modal.querySelectorAll("[data-tip-amount]"));
  let chosenUsd = TIP_JAR.defaultUsd;
  let isCustom = false;
  let raisedUsd = TIP_JAR.raisedUsd;
  let goalUsd = TIP_JAR.goalUsd;
  let updatedAt = "";
  let loadedAt = 0;

  function showStep(name){
    [].slice.call(modal.querySelectorAll("[data-tip-step]")).forEach(function(step){
      step.hidden = step.dataset.tipStep !== name;
    });
  }
  function paintGoal(){
    el("tip-raised").textContent = tipJarMoney(raisedUsd);
    el("tip-goal").textContent = tipJarMoney(goalUsd);
    const filled = tipJarFilled(raisedUsd, goalUsd);
    el("tip-ring-fill").style.strokeDashoffset = String(TIP_RING_LENGTH * (1 - filled));
    const when = updatedAt ? new Date(updatedAt) : null;
    const hasDate = !!when && !isNaN(when.getTime());
    el("tip-updated").hidden = !hasDate;
    if(hasDate) el("tip-updated").textContent = "Updated " + when.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }
  /* Reads the owner's numbers at most once a minute. A failed read leaves whatever is already showing. */
  function loadTotal(){
    if(typeof Cloud === "undefined" || !Cloud.fetchTipJar) return;
    if(Date.now() - loadedAt < TIP_REFRESH_MS) return;
    const ready = Cloud.whenReady ? Cloud.whenReady() : Promise.resolve();
    ready.then(function(){ return Cloud.fetchTipJar(); }).then(function(jar){
      if(!jar) return;
      loadedAt = Date.now();
      raisedUsd = jar.raisedUsd;
      goalUsd = jar.goalUsd;
      updatedAt = jar.updatedAt;
      if(!modal.hidden) paintGoal();
    }).catch(function(){});
  }
  function paintAmount(){
    amountButtons.forEach(function(btn){
      const isCustomButton = btn.dataset.tipAmount === "custom";
      const isPicked = isCustom ? isCustomButton : Number(btn.dataset.tipAmount) === chosenUsd;
      btn.classList.toggle("on", isPicked);
      btn.setAttribute("aria-pressed", isPicked ? "true" : "false");
    });
    el("tip-custom").hidden = !isCustom;
    const hasAmount = chosenUsd !== null;
    checkout.textContent = hasAmount ? "Tip " + tipJarMoney(chosenUsd) : "Enter an amount";
    checkout.classList.toggle("off", !hasAmount);
    checkout.setAttribute("aria-disabled", hasAmount ? "false" : "true");
  }
  function focusables(){
    return [].slice.call(modal.querySelectorAll("button,a[href],input")).filter(function(node){
      return node.offsetParent !== null;
    });
  }
  function openModal(){
    chosenUsd = TIP_JAR.defaultUsd;
    isCustom = false;
    customInput.value = "";
    showStep("goal");
    paintAmount();
    modal.hidden = false;
    /* The ring fills from empty on each open, so its transition has a start to run from. */
    el("tip-ring-fill").style.strokeDashoffset = String(TIP_RING_LENGTH);
    if(modal.offsetWidth !== undefined) void modal.offsetWidth;
    modal.classList.add("on");
    paintGoal();
    loadTotal();
    el("tip-leave").focus();
  }
  function closeModal(){
    modal.classList.remove("on");
    modal.hidden = true;
    opener.focus();
  }
  function goToThanks(){
    el("tip-enter-amount").textContent = tipJarMoney(chosenUsd);
    el("tip-reopen").href = TIP_JAR.checkoutUrl;
    showStep("thanks");
    el("tip-done").focus();
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(String(chosenUsd)).catch(function(){});
    }
  }

  checkout.href = TIP_JAR.checkoutUrl;
  opener.addEventListener("click", openModal);
  el("tip-close").addEventListener("click", closeModal);
  el("tip-done").addEventListener("click", closeModal);
  el("tip-leave").addEventListener("click", function(){
    showStep("amount");
    (amountButtons.filter(function(btn){ return btn.classList.contains("on"); })[0] || checkout).focus();
  });
  el("tip-back").addEventListener("click", function(){
    showStep("goal");
    el("tip-leave").focus();
  });
  amountButtons.forEach(function(btn){
    btn.addEventListener("click", function(){
      isCustom = btn.dataset.tipAmount === "custom";
      chosenUsd = isCustom ? tipJarParseAmount(customInput.value, TIP_JAR.minUsd, TIP_JAR.maxUsd) : Number(btn.dataset.tipAmount);
      paintAmount();
      if(isCustom) customInput.focus();
    });
  });
  customInput.addEventListener("input", function(){
    chosenUsd = tipJarParseAmount(customInput.value, TIP_JAR.minUsd, TIP_JAR.maxUsd);
    paintAmount();
  });
  /* A real link, so the new tab opens from the player's own click and no popup blocker stops it. */
  checkout.addEventListener("click", function(e){
    if(chosenUsd === null){
      e.preventDefault();
      customInput.focus();
      return;
    }
    goToThanks();
  });
  modal.addEventListener("click", function(e){
    if(e.target === modal) closeModal();
  });
  modal.addEventListener("keydown", function(e){
    e.stopPropagation();
    if(e.key === "Escape"){
      closeModal();
      return;
    }
    if(e.key !== "Tab") return;
    const nodes = focusables();
    if(!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const leavesEnd = !e.shiftKey && document.activeElement === last;
    const leavesStart = e.shiftKey && document.activeElement === first;
    if(!leavesEnd && !leavesStart) return;
    e.preventDefault();
    (leavesEnd ? first : last).focus();
  });
}

if(typeof document !== "undefined") bindTipJar();
if(typeof module !== "undefined") module.exports = { TIP_JAR, tipJarFilled, tipJarMoney, tipJarParseAmount };
