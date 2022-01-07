class Api {
    constructor(url, headers) {
        this._url = url;
        this._headers = headers;
    }

    getItems() {
        return fetch(this._url, {
            method: 'GET',
            headers: this._headers
        }).then((res) => {
            return this._processResult(res, 'Ошибка при получении данных');
        });
    }

    deleteItem(id) {
        return fetch(`${this._url}/${id}`, {
            method: 'DELETE',
            headers: this._headers
        }).then((res) => {
            return this._processResult(res, 'Ошибка при удалении записи');
        });
    }

    createItem(data) {
        return fetch(`${this._url}/`, {
            method: 'POST',
            headers: this._headers,
            body: JSON.stringify(data)
        }).then((res) => {
            return this._processResult(res, 'Ошибка при добавлении записи');
        });
    }

    updateItem(id, data) {
        return fetch(`${this._url}/${id}`, {
            method: 'PUT',
            headers: this._headers,
            body: JSON.stringify(data)
        }).then((res) => {
            return this._processResult(res, 'Ошибка при изменении записи');
        });
    }

    _processResult(res, errorText) {
        if (res.ok) {
            return res.json();
        }
        alert(errorText);
        return Promise.reject(errorText);
    }
}

class Form {
    constructor(element) {
        this._element = element;
    }

    init(submitHandler, values) {
        this.closeForm();
        this._submitHandler = submitHandler;
        this._element.addEventListener('submit', this._submitHandler);

        if (values) {
            Object.keys(values).forEach((name) => {
                this._element.querySelector(`[name=${name}]`).value = values[name];
            });
        }
    }

    closeForm() {
        this._element.reset();
        this._element.removeEventListener('submit', this._submitHandler);
        this._submitHandler = null;
    }
}

const $studentsSection = document.querySelector('.students');
const $studentTemplate = document.querySelector('#studentTemplate').content;
const $popup = document.querySelector('#studentPopup');
const $studentButton = document.querySelector('.header__icon');
const $popupCloseButton = document.querySelector('.popup__close');
const studentApi = new Api('http://localhost:3000/students', {'Content-Type': 'application/json'});
const studentForm = new Form(document.querySelector('.student-form'));

const showPopup = () => {
    $popup.classList.add('opened');
}

const hidePopup = () => {
    $popup.classList.remove('opened');
    studentForm.closeForm();
}

const renderList = (data) => {
    $studentsSection.innerHTML = '';
    if (data != null) {
        data.forEach(renderItem);
    }
};

const renderItem = (item) => {
    const $studentEl = $studentTemplate.cloneNode(true);
    const $studentImg = $studentEl.querySelector('.student__image');
    const $buttonDelete = $studentEl.querySelector('.button_delete');
    const $buttonEdit = $studentEl.querySelector('.button_edit');
    const $buttonCreate = document.querySelector('.button_update');

    $studentEl.querySelector('.student__name').textContent = item.name;
    $studentEl.querySelector('.student__info').textContent = item.about;
    $studentImg.setAttribute('src', item.avatarUrl);
    $studentImg.setAttribute('alt', item.name);

    $studentsSection.appendChild($studentEl);

    $buttonCreate.addEventListener('click', (event) => {
        showPopup();
        studentForm.init((event) => {
            event.preventDefault();
            const data = {
                name: event.target.elements[0].value,
                about: event.target.elements[1].value,
                avatarUrl: event.target.elements[2].value
            };

            studentApi.createItem(data).then(() => {
                studentApi.getItems().then((data) => renderList(data));
                hidePopup();
            });
        });

    })

    $buttonDelete.addEventListener('click', (event) => {
        event.preventDefault();

        studentApi.deleteItem(item.id).then(() => {
            event.target.closest('.student')?.remove?.();
        });
    });

    $buttonEdit.addEventListener('click', (event) => {
        showPopup();
        studentForm.init((event) => {
            event.preventDefault();
            const data = {
                id: item.id,
                name: event.target.elements[0].value,
                about: event.target.elements[1].value,
                avatarUrl: event.target.elements[2].value
            };

            studentApi.updateItem(item.id, data).then(() => {
                studentApi.getItems().then((data) => renderList(data));
                hidePopup();
            });
        }, {
            name: item.name,
            about: item.about,
            url: item.avatarUrl
        });
    });
}


studentApi.getItems().then((data) => renderList(data));

$studentButton.addEventListener('click', () => {
    showPopup();
    studentForm.init((event) => {
        event.preventDefault();
        const data = {
            name: event.target.elements[0].value,
            about: event.target.elements[1].value,
            avatarUrl: event.target.elements[2].value
        };

        studentApi.createItem(data).then(() => {
            studentApi.getItems().then((data) => renderList(data));
            hidePopup();
        });
    });
});

$popupCloseButton.addEventListener('click', () => {
    hidePopup();
});

