const { readFileSync, stat, writeFileSync, writeFile } = require('fs')    //импортирует несколько методов из библиотеки, чтобы можно было ими пользоваться

module.exports = new function () {
    const fileName = "./data.json";
    let inc = 0
    let data = {}
    this.create = dt => {   //создание id студента 
        dt.Id = inc++;   //записывает id + 1
        data[dt.Id] = dt;  //записывает инфу о новом студенте с общего списка
        writeFile(fileName, JSON.stringify(data), err => {if (err) console.error(err);});
        return dt  //возвращает dt 
    }
	
    this.getAll = () => {
        return Object.values(data);    //возвращаем инфу в базе 
    }
    this.get = id => data[id];    //записывавет id студента
	
    this.update = dt => {  //в dt есть id, по нему понимает, куда нужно положить новую информацию о студенте
        data[dt.Id] = dt;   //находит
        writeFile(fileName, JSON.stringify(data), err => {if (err) console.error(err);});
        return dt;   //возвращает dt студента
    }
	
    this.delete = id => {   //получает id студента, которого нужно удалить
        delete data[id];   //удаляет его
        writeFile(fileName, JSON.stringify(data), err => {if (err) console.error(err);});
    }

    stat(fileName, (err, stats) => {
        if (err && err.code === "ENOENT") {
            writeFileSync(fileName, {});
        }
        data = JSON.parse(readFileSync(fileName, {encoding:"UTF-8"}));
    })
}
