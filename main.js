class User {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    };
};

let today = new Date();
const dd = String(today.getDate());
const mm = String(today.getMonth() + 1).padStart(2, '0');
const yyyy = today.getFullYear();
today = dd + '/' + mm + '/' + yyyy;

class Task {
    constructor(userID, title, details, priority){
        this.user_ID = userID;
        this.title = title;
        this.details = details;
        this.priority = priority;
        this.date = today;
    };
};

class EditedTask extends Task {
    constructor(taskID, userID, title, details, priority){
        super(userID, title, details, priority);
        this.task_ID = taskID;
    };
};

const createAccountBtn = document.getElementById("createaccount");

if (createAccountBtn){
    createAccountBtn.onclick = async () => {
        const username = document.getElementById('username').value;
        const password1 = document.getElementById('password1').value;
        const password2 = document.getElementById('password2').value;
        
        if (password1 === password2) {

            const newUser = new User(username, password1);

            await fetch('http://localhost:8000/api/create-user', {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json;charset=utf-8'
                  },
                body: JSON.stringify(newUser)
            });
        
            alert("Account created")
            window.location.href = "login.html";

        } else {
            alert("Your passwords don't match!");
        };
    };
};

const logInBtn = document.getElementById("loginbutton");

if (logInBtn){
    logInBtn.onclick = async (event) => {
        event.preventDefault();
        var userData;
        var currentUser;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        let url = (`http://localhost:8000/api/get-user/${username}`);

        let response = await fetch(url);

        if (!response.ok) {
            alert("User not found. Please create an account first");
        } else{
            userData = await response.json();
            currentUser = new User(userData.username, userData.password);
        };    

        if (username === currentUser.username && password === currentUser.password) {
            window.location.href = "tableview.html";

            sessionStorage.setItem("userID", userData.user_id);

        } else {
            alert("Wrong username or password!");
        };
    };
};

const saveBtn = document.getElementById("savebutton");

if (saveBtn) {
    saveBtn.onclick = async () => {

        let userId = sessionStorage.getItem("userID");

        const task = new Task(
            userId,
            document.getElementById("title").value,
            document.getElementById("details").value,
            document.getElementById("priority").value);

        await fetch('http://localhost:8000/api/create-task', {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json;charset=utf-8'
                },
            body: JSON.stringify(task)
        });

        window.location.href = "tableview.html";
    };
};

const tableView = document.getElementById('tableview');

if (tableView){
    tableView.onload = async () => {

        let userID = sessionStorage.getItem("userID");
        let url = `http://localhost:8000/api/get-tasks/${userID}`;

        let response = await fetch(url);

        const userData = await response.json(); 
        const tableBody = document.getElementById('contents');

        for(const task of userData){

            const row = document.createElement('tr');

            const doneButton = document.createElement("button");
            doneButton.setAttribute("type", "button");
            doneButton.classList.add("donebutton");
            doneButton.innerHTML= "Done";
            const editButton = document.createElement("button");
            editButton.setAttribute("type", "button");
            editButton.classList.add("editbutton");
            editButton.innerHTML = "Edit";

            const taskData_1 = document.createElement('td');
            taskData_1.innerHTML = task.title;
            const taskData_2 = document.createElement('td');
            taskData_2.innerHTML = task.details;
            const taskData_3 = document.createElement('td');
            taskData_3.innerHTML = task.priority;
            taskData_3.setAttribute("align", "center");
            const taskData_4 = document.createElement('td');
            taskData_4.innerHTML = task.date;
            taskData_4.setAttribute("align", "center");

            row.appendChild(doneButton);
            row.appendChild(editButton);
            row.appendChild(taskData_1);
            row.appendChild(taskData_2);
            row.appendChild(taskData_3);
            row.appendChild(taskData_4);
            tableBody.appendChild(row);

            doneButton.onclick = async () => {
                const title = task.title;

                let url = `http://localhost:8000/api/remove-task/${title}`

                await fetch(url);

                window.location.reload();
            };

            editButton.onclick = () => {
                sessionStorage.setItem("taskID", task.task_id)
                sessionStorage.setItem("title", task.title)
                sessionStorage.setItem("details", task.details)
                sessionStorage.setItem("priority", task.priority)

                window.location.href = "edit.html";
            };
        };
    };
};

const logOutBtn = document.getElementById("logoutbutton");

if(logOutBtn){
    logOutBtn.onclick = () => {
        sessionStorage.removeItem("userID");
        sessionStorage.removeItem("taskID");
        sessionStorage.removeItem("title");
        sessionStorage.removeItem("details");
        sessionStorage.removeItem("priority");
        window.location.href = "login.html";
    };
};

const editForm = document.getElementById("edit");

if(editForm){
    editForm.onload = () => {
        document.getElementById('title').value = sessionStorage.getItem("title");
        document.getElementById('details').value = sessionStorage.getItem("details");
        document.getElementById('priority').value = sessionStorage.getItem("priority");
    };
};

const saveEditButton = document.getElementById("editsavebutton");

if (saveEditButton){
    saveEditButton.onclick = async () => {

        const task = new EditedTask(sessionStorage.getItem("taskID"),
            sessionStorage.getItem("userID"),
            document.getElementById("title").value,
            document.getElementById("details").value,
            document.getElementById("priority").value);

        let url = `http://localhost:8000/api/edit-task/`;

        await fetch(url, {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json;charset=utf-8'
                },
            body: JSON.stringify(task)
        });

        sessionStorage.removeItem("title");
        sessionStorage.removeItem("details");
        sessionStorage.removeItem("priority");
        sessionStorage.removeItem("taskID");

        window.location.href = "tableview.html";
    };
};