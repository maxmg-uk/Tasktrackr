using System.Data.SQLite;

/// Setting the API system
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(policyBuilder =>
    policyBuilder.AddDefaultPolicy(policy =>
        policy.WithOrigins("*").AllowAnyHeader().AllowAnyHeader()
    )
);

var app = builder.Build();
app.UseHttpsRedirection();
app.UseCors();

/// THE APP:

string dataSourceName = "Data Source=data.db;Version=3";
using var con = new SQLiteConnection(dataSourceName);
con.Open();

string sqlCREATE = """
    CREATE TABLE IF NOT EXISTS tasks(
        task_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INT,
        title TEXT,
        details TEXT,
        priority TEXT,
        date TEXT
      );


    CREATE TABLE IF NOT EXISTS users(
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        password TEXT);
""";

using var cmdCREATE = new SQLiteCommand(sqlCREATE, con);
cmdCREATE.ExecuteNonQuery();

//gets user info, pulls everything but I only need ID and username 
app.MapGet( "/api/get-user/{username}", (string username) => {

        string sqlSELECT = $"""SELECT * FROM users WHERE Username = @username""";
        using var cmdSELECT = new SQLiteCommand(sqlSELECT, con);
        cmdSELECT.Parameters.AddWithValue("@username", username);
        var resultSELECT = cmdSELECT.ExecuteReader();

        resultSELECT.Read(); 
        return new User(resultSELECT.GetInt32(0), resultSELECT.GetString(1), resultSELECT.GetString(2));
});


// add user info from create account screen.
app.MapPost("/api/create-user", (User user) =>
{
    string sqlINSERT = $"""INSERT INTO users (Username, Password) VALUES (@username, @password)"""; 
    using var cmdINSERT = new SQLiteCommand(sqlINSERT, con);
    cmdINSERT.Parameters.AddWithValue("@username", user.Username);
    cmdINSERT.Parameters.AddWithValue("@password", user.Password);
    cmdINSERT.ExecuteNonQuery(); 
    return user;
});


//get all the tasks for a specified user ID, called from teh tableview page.
app.MapGet("/api/get-tasks/{user_id}", (int user_id) =>
{
    string sqlSELECT = $"SELECT * FROM tasks WHERE User_Id = @userid";
    using var cmdSELECT = new SQLiteCommand(sqlSELECT, con);
    cmdSELECT.Parameters.AddWithValue("@userid", user_id);
    var resultSELECT = cmdSELECT.ExecuteReader();

    var tasks = new List<Task>();

    while (resultSELECT.Read())
    {
        var nextTask = new Task(
            resultSELECT.GetInt32(0),
            resultSELECT.GetInt32(1),
            resultSELECT.GetString(2),
            resultSELECT.GetString(3),
            resultSELECT.GetString(4),
            resultSELECT.GetString(5)
        );

        tasks.Add(nextTask);
    }

    return tasks;
});


//creates a task from save button on create screen
app.MapPost("/api/create-task", (Task task) =>
{
    string sqlINSERT = $"""INSERT INTO tasks (User_id, Title, Details, Priority, Date) VALUES (@userid, @title, @details, @priority, @date)""";
    using var cmdINSERT = new SQLiteCommand(sqlINSERT, con);
    cmdINSERT.Parameters.AddWithValue("@userid", task.User_id);
    cmdINSERT.Parameters.AddWithValue("@title", task.Title);
    cmdINSERT.Parameters.AddWithValue("@details", task.Details);
    cmdINSERT.Parameters.AddWithValue("@priority", task.Priority);
    cmdINSERT.Parameters.AddWithValue("@date", task.Date);


    cmdINSERT.ExecuteNonQuery(); 
    return task;
});

//removes a task when done button clicked on tableview screen.
app.MapGet("/api/remove-task/{title}", (string title) =>
{
    // title = title.Trim();
    string sqlDELETE = $"""DELETE FROM tasks WHERE title = @title""";
    using var cmdDELETE = new SQLiteCommand(sqlDELETE, con);
    cmdDELETE.Parameters.AddWithValue("@title", title);
    cmdDELETE.ExecuteNonQuery(); 
    return title;
});

// //edit function. Some kind of update command. Js is gonna be screwy though
app.MapPost("/api/edit-task", (Task task) =>
{
 string sqlUPDATE = $"""UPDATE tasks SET Title = @title, Details = @details, Priority = @priority WHERE tasks.Task_id = @taskid""";
 using var cmdUPDATE = new SQLiteCommand(sqlUPDATE, con);
 cmdUPDATE.Parameters.AddWithValue("@title", task.Title);
 cmdUPDATE.Parameters.AddWithValue("@details", task.Details);
 cmdUPDATE.Parameters.AddWithValue("@priority", task.Priority);
 cmdUPDATE.Parameters.AddWithValue("@taskid", task.Task_id);
 cmdUPDATE.ExecuteNonQuery(); 
 return task;
});

app.Run();

record Task(
    int Task_id,
    int User_id,
    string Title,
    string Details,
    string Priority,
    string Date
);

record User(
    int User_id,
    string Username,
    string Password
);