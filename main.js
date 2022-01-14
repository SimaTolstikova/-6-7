let data = new function () {
  let inc = 1;
  let arr = {};
  this.init = (callback) => {
    util.ajax({method:"GET"}, data => {
      data.map(std => {
        arr[std.Id] = std;  //записывает инфу о новом студенте, которого захотели вывести
        inc = std.Id;   //чтобы найти свободное id 
      });
      inc++;    // добавляет, чтобы использовать id для следующего студента 
      if (typeof callback == 'function') callback(); //если callback - функция, то мы ее вызываем
    })
  }
//С
  this.create = (obj) => {       //создание id студента
    obj.Id = inc++;         // записывает id+1
    arr[obj.Id] = obj;   // записывает инфу о новом студенте в общий список
    util.ajax({method:"POST", body:JSON.stringify(obj)}); // определяет метод и отправляет инфу в формате JSON 
    return obj;   // возвращает obj 
  }
//R
  this.getAll = () => {    // получение инфы о каком-то студенте
    return Object.values(arr)   // возвращаем инфу в базе 
  };
  
  this.get = (id) => arr[id];  // записывавет id студента
//U
  this.update = (obj) => {   
    arr[obj.Id] = obj;   // обновляем инфу о студенте 
    util.ajax({method:"PUT", body:JSON.stringify(obj)});  // определяет метод и отправляет инфу в формате JSON 
    return obj;  // возвращаем obj
  }
//D
  this.delete = (id) => {   // получает id студента, которого нужно удалить
    delete arr[id];    // удаляет его
    util.ajax({method:"DELETE", path:"/"+id});   // а тут тоже самое только вместо тела запроса здесь передан путь(в котором id студента, которого надо удалить)
  }
};

const util = new function () {
  this.ajax = (params, callback) => {     // два параметра 
    let url = "";      
    if (params.path !== undefined) {  //если передали путь, то мы записываем этот путь в URL 
      url = params.path;
      delete params.path;
    }
    fetch("/student"+url, params).then(data => data.json().then(callback))   //передаем в ссылку данные, делаем запрос на сервер, обрабатывает данные с сервера, переведенные в json формат и callback (обновление страницы)
  }
  this.parse = (tpl, obj) => {   //продолжение "выводим данные"
    let str = tpl;
    for (let k in obj) {   //проходимся по всем данным о студенте
      str = str.replaceAll("{" + k + "}", obj[k]);  //заполняем данными по очереди "имя", "др" и т.д
    }
    return str;   //возвращаем значение 
  };
  this.id = (el) => document.getElementById(el);
  this.q = (el) => document.querySelectorAll(el);
  this.listen = (el, type, callback) => el.addEventListener(type, callback);
}

const student = new function () {
  this.submit = () => {   //заполняет данные из заполненной формы
    const st = {
      name: util.id("name").value,
      group: util.id("group").value,
      phone: util.id("phone").value,
      email: util.id("email").value,
    };
    if(util.id("Id").value === "0") {  //проверяет, если это 0 студент
		data.create(st)   //то выводит "№", "др" и т.д
	}
    else {
      st.Id = util.id("Id").value;    //иначе дает ему id
      data.update(st);     //обновляет данные о студенте
    }
    this.render();    //данные на странице выводились правильно
    util.id("edit").style.display = "none"    //после кнопки окно убиралось
  }

  this.remove = () => {  
    data.delete(activeStudent);        // удаление студента 
    this.render()         //обновляет форму, чтобы было видно удаление
    util.id("remove").style.display = "none"    //скрывает форму "вы действительно хотите удалить студента"
  } 

  const init = () => {
    data.init(() => {    //записываем данные о студенте 
      this.render();   //обновление данных на  странице 
    });
    util.q("button.add").forEach(el => {  // Кнопка добавления
      util.listen(el, "click", add);
    });
    util.q(".btn-close, .close").forEach(el => {  //крестики и отмена
      util.listen(el, "click", () => {
        util.id(el.dataset["id"]).style.display = "none";
      });
    });
    util.q(".submit").forEach(el => {  // Кнопки сохранить и удалить в формах, цикл потому что обе кнопки submit
      util.listen(el, "click", () => {
        this[el.dataset["func"]]();
      });
    });
  };

  const add = () => {
    util.q("#edit .title")[0].innerHTML = "Добавить студента: ";
    util.q("#edit form")[0].reset();      //удаление прошлых данных из формы
    util.id("Id").value = "0";         //присвоение id 0, чтобы потом найти свободный id
    util.id("edit").style.display = "block";    // кнопка добавить открывается
  };

  const edit = (el) => {
    util.q("#edit .title")[0].innerHTML = "Изменить студента: ";
    util.q("#edit form")[0].reset();    //удаление прошлых данных из формы
    const st = data.get(el.dataset["id"]); // записывает id студента, чьи данные хотим изменить
    for(let k in st) {       //записывает данные об этом студенте 
      util.id(k).value = st[k];
    }
    util.id("edit").style.display = "block";   // кнопка изменить открывается
  };

  let activeStudent = null;
  const rm = (el) => {
    util.id("remove").style.display = "block";
    activeStudent = el.dataset["id"]; //записываем id студента, которого хотим удалить
  };

  const addListener = () => {  // События для кнопок изменить и удалить в таблице
    util.q("button.edit").forEach(el => {  // Метод forEach() выполняет цикл по событиям.
      util.listen(el, "click", () => edit(el)); // при click вызывается edit (изменение сведения о студенте)
    });
    util.q("button.rm").forEach(el => {    // Метод forEach() выполняет цикл по событиям.
      util.listen(el, "click", () => rm(el)); // при click вызывается rm (удаление)
    });
  };

  this.render = () => {    //записываем новые данные в таблицу
    util.id("table")
        .innerHTML = data // Отображает студентов в таблице, записываем данные из data
        .getAll()
        .map(el => util.parse(tpl, el)).join("");  //выводим данные
    addListener();    //вызываем функцию addListener
  };

  const tpl = `
   <tr>
        <td style="width: 20px">{Id}</td>
        <td>{name}</td>
        <td style="width: 45%">{group}</td>
        <td style="width: 55%">{phone}</td>
        <td>{email}</td>
        <td style="width: 100%">
        <button type="button" class="edit" data-id="{Id}">Изменить</button>
        <button type="button" class="rm" data-id="{Id}">Удалить</button></td>                    
   </tr>
`;

  window.addEventListener("load", init);
}

