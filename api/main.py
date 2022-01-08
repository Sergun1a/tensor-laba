from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import db_helper
import const
import uvicorn


class Student(BaseModel):
    id: int = None
    name: str
    about: str
    avatarUrl: str


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/students')
def students_list():
    """
    Получение списка студентов.
    """
    sql = """
        select
            id,
            name,
            description as about,
            photo_url as "avatarUrl"
        from students
        order by name
    """
    return db_helper.execute_query(sql)


@app.post('/students/')
def create(payload: Student):
    """
    Создание карточки студента.
    """
    sql = """
        insert into students (name, description, photo_url)
        values (%s::text, %s::text, %s::text)
    """
    db_helper.execute_query(
        sql,
        payload.name,
        payload.about,
        payload.avatarUrl
    )


@app.put('/students/{id}')
def update(id: int, payload: Student):
    """
    Обновление карточки студента.
    """
    sql = """
        update students
        set name = %s::text, description = %s::text, photo_url = %s::text
        where id = %s::int
    """
    db_helper.execute_query(
        sql,
        payload.name,
        payload.about,
        payload.avatarUrl,
        payload.id
    )


@app.delete('/students/{id}')
def delete(id: int):
    """
    Удаление карточки студента.
    """
    sql = 'delete from students where id = %s::int'
    db_helper.execute_query(sql, id)


# Или из консоли: uvicorn main:app --host 0.0.0.0 --port 3000 --debug
if __name__ == '__main__':
    uvicorn.run(app, host=const.APP_IP, port=const.APP_PORT)
