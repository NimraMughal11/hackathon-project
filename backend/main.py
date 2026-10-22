
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    conn = sqlite3.connect("hackathon.db")
    conn.row_factory = sqlite3.Row
    return conn

@app.on_event("startup")
def create_database():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

@app.get("/")
def home():
    return {"message": "Backend is running!"}

@app.get("/items")
def get_items():
    conn = get_db()
    rows = conn.execute("SELECT * FROM items").fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.post("/items")
def add_item(item: dict):
    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO items (name) VALUES (?)",
        (item["name"],)
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"id": new_id, "name": item["name"]}
