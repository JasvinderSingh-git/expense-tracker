// Expense Tracker - script.js

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let currentFilter = "week";
let pendingAmount = 0;
let deleteId = null;

const $ = id => document.getElementById(id);

const amountModal = $("amountModal");
const nameModal = $("nameModal");
const deleteModal = $("deleteModal");
const resetModal = $("resetModal");

function saveStorage(){
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

function nextId(){
  return expenses.length ? Math.max(...expenses.map(e=>e.id))+1 : 1;
}

function openModal(m){ m.style.display="flex"; }
function closeModal(m){ m.style.display="none"; }

$("addExpenseBtn").onclick=()=>{
  $("amountInput").value="";
  $("expenseNameInput").value="";
  openModal(amountModal);
  $("amountInput").focus();
};

$("cancelAmount").onclick=()=>closeModal(amountModal);

$("nextAmount").onclick=()=>{
  const v=Number($("amountInput").value);
  if(v<=0){ alert("Enter a valid amount."); return; }
  pendingAmount=v;
  closeModal(amountModal);
  openModal(nameModal);
  $("expenseNameInput").focus();
};

$("backName").onclick=()=>{
  closeModal(nameModal);
  openModal(amountModal);
};

$("saveExpense").onclick=()=>{
  const name=$("expenseNameInput").value.trim();
  if(!name){ alert("Enter expense name."); return; }

  expenses.push({
    id:nextId(),
    amount:pendingAmount,
    name,
    date:new Date().toISOString()
  });

  saveStorage();
  closeModal(nameModal);
  renderAll();
};

document.querySelectorAll(".filter-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".filter-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter=btn.dataset.filter;
    renderAll();
  });
});

function filteredExpenses(){
  const now=new Date();
  return expenses.filter(e=>{
    const d=new Date(e.date);
    if(currentFilter==="year"){
      return d.getFullYear()===now.getFullYear();
    }
    if(currentFilter==="month"){
      return d.getFullYear()===now.getFullYear() &&
             d.getMonth()===now.getMonth();
    }
    const diff=(now-d)/(1000*60*60*24);
    return diff<=7;
  });
}

function renderSummary(list){
  const total=list.reduce((s,e)=>s+e.amount,0);
  $("totalExpense").textContent="₹"+total.toFixed(2);
}

function renderGraph(list){
  const graph=$("graph");
  graph.innerHTML="";
  if(!list.length){
    graph.innerHTML='<div class="empty">No expenses.</div>';
    return;
  }
  const sums={};
  list.forEach(e=>sums[e.name]=(sums[e.name]||0)+e.amount);
  const arr=Object.entries(sums).map(([name,total])=>({name,total}))
      .sort((a,b)=>b.total-a.total);
  const max=arr[0].total;
  arr.forEach(item=>{
    const row=document.createElement("div");
    row.className="graph-row";
    row.innerHTML=`
      <div class="graph-label">${item.name}</div>
      <div class="graph-bar-container">
        <div class="graph-bar" style="width:${(item.total/max)*100}%">
          ₹${item.total.toFixed(2)}
        </div>
      </div>`;
    graph.appendChild(row);
  });
}

function renderSuggestions(){
  const dl=$("expenseSuggestions");
  dl.innerHTML="";
  [...new Set(expenses.map(e=>e.name))].forEach(n=>{
    const op=document.createElement("option");
    op.value=n;
    dl.appendChild(op);
  });
}

function renderHistory(list){
  const wrap=$("expenseHistory");
  wrap.innerHTML="";
  if(!list.length){
    wrap.innerHTML='<div class="empty">No expense history.</div>';
    return;
  }
  [...list].reverse().forEach(exp=>{
    const card=document.createElement("div");
    card.className="expense-card";
    card.innerHTML=`
      <div class="expense-left">
        <div class="expense-name">${exp.name}</div>
        <div class="expense-date">${new Date(exp.date).toLocaleString()}</div>
      </div>
      <div class="expense-right">
        <div class="expense-amount">₹${exp.amount.toFixed(2)}</div>
        <button class="deleteExpense">Delete</button>
      </div>`;
    card.querySelector(".deleteExpense").onclick=()=>{
      deleteId=exp.id;
      openModal(deleteModal);
    };
    wrap.appendChild(card);
  });
}

$("cancelDelete").onclick=()=>closeModal(deleteModal);
$("confirmDelete").onclick=()=>{
  expenses=expenses.filter(e=>e.id!==deleteId);
  saveStorage();
  closeModal(deleteModal);
  renderAll();
};

$("resetBtn").onclick=()=>openModal(resetModal);
$("cancelReset").onclick=()=>closeModal(resetModal);
$("confirmReset").onclick=()=>{
  expenses=[];
  saveStorage();
  closeModal(resetModal);
  renderAll();
};

window.onclick=(e)=>{
  [amountModal,nameModal,deleteModal,resetModal].forEach(m=>{
    if(e.target===m) closeModal(m);
  });
};

function renderAll(){
  const list=filteredExpenses();
  renderSummary(list);
  renderGraph(list);
  renderHistory(list);
  renderSuggestions();
}

renderAll();
