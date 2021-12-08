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

const $kittiesSection = document.querySelector('.kitties');
const $kittyTemplate = document.querySelector('#kittyTemplate').content;
const $popup = document.querySelector('#kittyPopup');
const $kittyButton = document.querySelector('.header__icon');
const $popupCloseButton = document.querySelector('.popup__close');
const kittyApi = new Api('http://localhost:3000/kitties', { 'Content-Type': 'application/json' });
const kittyForm = new Form(document.querySelector('.kitty-form'));

const showPopup = () => {
   $popup.classList.add('opened');
}

const hidePopup = () => {
   $popup.classList.remove('opened');
   $kittyForm.closeForm();
}

const renderList = (data) => {
   $kittiesSection.innerHTML = '';
   data.forEach(renderItem)
};

const renderItem = (item) => {
   const $kittyEl = $kittyTemplate.cloneNode(true);
   const $kittyImg = $kittyEl.querySelector('.kitty__image');
   const $buttonDelete = $kittyEl.querySelector('.button_delete');
   const $buttonEdit = $kittyEl.querySelector('.button_edit');

   $kittyEl.querySelector('.kitty__name').textContent = item.name;
   $kittyEl.querySelector('.kitty__info').textContent = item.about;
   $kittyImg.setAttribute('src', item.avatarUrl);
   $kittyImg.setAttribute('alt', item.name);

   $kittiesSection.appendChild($kittyEl);

   $buttonDelete.addEventListener('click', (event) => {
      event.preventDefault();

      kittyApi.deleteItem(item.id).then(() => {
         event.target.closest('.kitty')?.remove?.();
      });
   });

   $buttonEdit.addEventListener('click', (event) => {
      showPopup();
      kittyForm.init((event) => {
         event.preventDefault();
         const data = {
            id: item.id,
            name: event.target.elements[0].value,
            about: event.target.elements[1].value,
            avatarUrl: event.target.elements[2].value
         };

         kittyApi.updateItem(item.id, data).then(() => {
            kittyApi.getItems().then((data) => renderList(data));
            hidePopup();
         });
      }, {
         name: item.name,
         about: item.about,
         url: item.avatarUrl
      });
   });
}


kittyApi.getItems().then((data) => renderList(data));

$kittyButton.addEventListener('click', () => {
   showPopup();
   kittyForm.init((event) => {
      event.preventDefault();
      const data = {
         name: event.target.elements[0].value,
         about: event.target.elements[1].value,
         avatarUrl: event.target.elements[2].value
      };

      kittyApi.createItem(data).then(() => {
         kittyApi.getItems().then((data) => renderList(data));
         hidePopup();
      });
   });
});

$popupCloseButton.addEventListener('click', () => {
   hidePopup();
});

