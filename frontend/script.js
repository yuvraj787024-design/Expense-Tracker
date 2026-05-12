

const BASE_URL = "https://expense-tracker-3-tem7.onrender.com/api";

let categoryChartInstance = null;
let monthlyChartInstance = null;



// User Register 
async function register() {
    try{
    event.preventDefault()
    const username = document.querySelector(".register-name").value.trim()
    const email = document.querySelector(".register-email").value.trim()
    const password = document.querySelector(".register-password").value.trim()
    const budget = document.querySelector(".register-budget").value.trim()

    const response = await fetch(`${BASE_URL}/auth/register`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            username,
            email,
            password,
            budget

        })
    })

    const data = await response.json()
    const output = document.querySelector(".register-output")
    output.innerHTML = data.message
    console.log(data)
    if(data.message === "Registered Successfully"){
        window.location.href = "index.html" ;
    }

    }catch(err){
        console.log(err)
    }
}

// User Login Here
async function login() {
    event.preventDefault()
    const email = document.querySelector(".login-email").value.trim()
    const password = document.querySelector("#login-password").value.trim()
    const output = document.querySelector(".login-output")

    const response = await fetch(`${BASE_URL}/auth/login`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    })
    const data = await response.json()
    
    console.log(data.token)
    console.log(data)
    output.innerHTML = data.message
     if(data.message === "User Login Successfully"){
        localStorage.setItem("token", data.token);
    localStorage.setItem("_id",data.user._id)
        window.location.href = "project.html" ;
    }

}

//Add Expenses
async function add(event) {
    console.log("Function Started")

    try{
    event.preventDefault()
    const balance = document.querySelector(".balance")
    const budget = document.querySelector(".budget")

    const expenseInput = document.querySelector("#expense");
    const typeInput = document.querySelector("#expenseType");
    const nameInput = document.querySelector("#expenseName");


    const expense = expenseInput.value.trim()
    const expenseType = typeInput.value.trim()
    const expenseName = nameInput.value.trim()
    const token = localStorage.getItem("token")
    

    const response = await fetch(`${BASE_URL}/transaction`, {
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            "Authorization": `Bearer ${token}`
        },
        body:JSON.stringify({
            expense,
            expenseType,
            expenseName
        })
    })
    const data = await response.json()
    expenseInput.value = ""
    typeInput.value = ""
    nameInput.value = ""

    await getDashboard();
    }catch(err){
        console.log(err)
    }
}

async function expensesUpdate(id) {
    try{
    const token = localStorage.getItem("token");
    const expense = prompt("Enter New expense")
    const expenseType = prompt("Enter New expenseType")
    const expenseName = prompt("Enter New expenseName")

    const response = await fetch(`${BASE_URL}/update/${id}`,{
        method:"PATCH",
        headers:{
            "Content-Type":"application/json",
            "Authorization":`Bearer ${token}`
        },
        body:JSON.stringify({
            expense,
            expenseType,
            expenseName
        })
    })
    const text = await response.text();
    console.log(text);
    await getDashboard();
    }catch(err){
        console.log(err)
    }
}

// get Dashboard
async function getDashboard(){
    try{
        const token = localStorage.getItem("token");
        const budget = document.querySelector(".budget")
        const balance = document.querySelector(".balance")

        const response = await fetch(`${BASE_URL}/dashboard`,{
            method:"GET",
            headers:{
                "Content-Type":"application/json",
                "Authorization":`Bearer ${token}`
            }
        })

        const data = await response.json()
        console.log(data)
        const resBudget = data.data.budget
        const resBalance = data.data.balance
        balance.textContent = `Balance : ${resBalance}`
        budget.textContent = `Budget : ${resBudget}`
        const output = document.querySelector(".expense-output")
        output.innerHTML = ""

        data.data.expenses.forEach((item) => {

        const date = new Date(item.createdAt);

        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
        output.innerHTML += `
        <div class="expense-card">
        <div class="expense-info">
        <div class="expense-amount">${item.expense}</div>
        <div class="expense-type">${item.expenseType}</div>
        <div class="expense-name">${item.expenseName}</div>
        <div class="expense-date">${formattedDate}</div>
        <div class="expense-time">${formattedTime}</div>
        </div>
            
        <div class="expense-actions">
        <button class="edit-btn" onclick="expensesUpdate('${item._id}')">Edit</button>
        <button class="delete-btn" onclick="deleteExpense('${item._id}')">Delete</button>
        </div>
       </div>
`;
     
    renderCategoryChart(data.data.expenses);
    renderMonthlyChart(data.data.expenses);
            
        });
    }catch(err){
        console.log(err)
    }
}

//Delete Expense
async function deleteExpense(id) {
    try{
        const token = localStorage.getItem("token")
        const response = await fetch(`${BASE_URL}/delete/${id}`, {
            method:"DELETE",
            headers:{
                "Content-Type":"application/json",
                "Authorization":`Bearea ${token}`
            }
        })
        const data = await response.json()
        console.log(data.message)
        await getDashboard()

    }catch(err){
        console.log(err)
    }
}

//Change Budget
async function changeBudget() {
    try{
        const token = localStorage.getItem("token")
        const newBudget = prompt("Enter New Budget")
        const response = await fetch(`${BASE_URL}/budget`, {
            method:"PATCH",
            headers:{
                "Content-Type":"application/json",
                "Authorization":`Bearer ${token}`
            },
            body:JSON.stringify({
                budget:newBudget
            })
        })
        const data = await response.json()
        console.log(data.message)
         setTimeout(() => {
            getDashboard();
        }, 300);

    }catch(err){
        console.log(err)
    }
    
}

async function logout() {
    const token = localStorage.getItem("token")
    const response = await fetch(`${BASE_URL}/auth/logout`, {
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            "Authorization":`Bearer ${token}`
        }
    })
    const data = await response.json()
    console.log(data.message)
    if(data.message === "User Logged out Successfully"){
        window.location.href = "index.html" ;
    }
}


function renderCategoryChart(expenses) {

    const categories = {};

    expenses.forEach(item => {
        categories[item.expenseType] =
            (categories[item.expenseType] || 0) + Number(item.expense);
    });

    const labels = Object.keys(categories);
    const values = Object.values(categories);

    const ctx = document.getElementById("categoryChart").getContext("2d");

    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }

    categoryChartInstance = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    "#22c55e",
                    "#ef4444",
                    "#3b82f6",
                    "#f59e0b",
                    "#a855f7"
                ]
            }]
        }
    });
}
 
 /* ================= MONTH VS EXPENSE ================= */
function renderMonthlyChart(expenses) {

    const months = {};

    expenses.forEach(item => {
        const date = new Date(item.createdAt); // IMPORTANT: backend must send this
        const month = date.toLocaleString("default", { month: "short" });

        months[month] = (months[month] || 0) + Number(item.expense);
    });

    const labels = Object.keys(months);
    const values = Object.values(months);

    const ctx = document.getElementById("monthlyChart").getContext("2d");

    if (monthlyChartInstance) {
        monthlyChartInstance.destroy();
    }

    monthlyChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Monthly Expense",
                data: values,
                backgroundColor: "#3b82f6"
            }]
        }
    });
}


// window.onload = () => {
//     const token = localStorage.getItem("token");

//     // only load dashboard if user logged in
//     if(token){
//         getDashboard();
//     }
// }

window.onload = () => {

    const token = localStorage.getItem("token");

    // check if balance element exists
    const balanceElement = document.querySelector(".balance");

    // only run dashboard on project page
    if(token && token !== "undefined" && balanceElement){
        getDashboard();
    }
}
