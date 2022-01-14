const http = require("http"),
    crud = require("./crud"),
    statics = require("node-static");  // библиотека (node-static понимает и поддерживает условные запросы GET и HEAD )

const staticFileDir = new statics.Server("./public"); // данные по поводу запросов и ответов будут храниться в "./public"

const echo = (res, content) => {
    res.end(JSON.stringify(content));  // данные переделывает в формат JSON
}

const student = (req, res) => {   
    res.writeHead(200,{"Content-type": "application/json"}); // добавляем служебные поля, writeHead обновляет служебные поля, тип контента JSON

    const url = req.url.substring(1).split("/");  // знак после /

    switch (req.method) { 
        case "GET":
            if (url.length > 1)      
                echo (res, crud.get(url[1]))  // вывести определенного студента
            else
                echo (res, crud.getAll())   // вывести всех 
            break;
        case "POST":
            getAsyncData (req, data => {
                echo(res, crud.create(JSON.parse(data)))   // данные переделывает в формат JSON и отправляет
            })
            break;
        case "PUT":
            getAsyncData (req, data => {
                echo(res, crud.update(JSON.parse(data)))   // данные переделывает в формат JSON
            })
            break;
        case "DELETE":
            if(url.length > 1)
                echo(res, crud.delete(url[1]))   // удаляет студента по url.length
            else
                echo(res,{error:"Не передан id"}) // ошибка
            break;
        default: echo(res,{error:"500"}) // ошибка
    }
}

const getAsyncData = (req, callback) => {  
    let data = "";
    req.on("data", chunk => {data += chunk}) // передает "data", передает данные 
    req.on("end", () => {callback(data)})  // передает "end", что значит, данные закончились 
}

const handler = function (req, res) {
    const url = req.url.substring(1).split("/") // смотрим, в URL после / есть id или нет 
    switch (url[0]) {     // если нет, то..
        case "student":  // вызывается метод "student"
            student(req, res); 
            return
    }
    staticFileDir.serve(req, res);
}

http.createServer(handler).listen(8108, () => {
    console.log("run")
})
