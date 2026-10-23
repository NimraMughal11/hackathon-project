
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import sqlite3
from dotenv import load_dotenv
import os
from google import genai

load_dotenv()

app = FastAPI(title="SehatBudget API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "hackathon.db"


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


# Request models
class BudgetCreate(BaseModel):
    treatment_name: str = Field(min_length=1, max_length=150)
    total_budget: float = Field(gt=0)


class BudgetUpdate(BaseModel):
    treatment_name: str = Field(min_length=1, max_length=150)
    total_budget: float = Field(gt=0)


class ExpenseCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    category: str = Field(default="Other", max_length=80)
    planned_cost: float = Field(ge=0)
    actual_cost: float = Field(default=0, ge=0)


class ExpenseUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    category: str = Field(default="Other", max_length=80)
    planned_cost: float = Field(ge=0)
    actual_cost: float = Field(ge=0)


# Database setup
@app.on_event("startup")
def create_database():
    conn = get_db()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS budgets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            treatment_name TEXT NOT NULL,
            total_budget REAL NOT NULL CHECK(total_budget > 0),
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            budget_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            category TEXT NOT NULL DEFAULT 'Other',
            planned_cost REAL NOT NULL DEFAULT 0,
            actual_cost REAL NOT NULL DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (budget_id) REFERENCES budgets(id)
                ON DELETE CASCADE
        )
    """)

    conn.commit()
    conn.close()


@app.get("/")
def home():
    return {"message": "SehatBudget API is running!"}


# Budget summary calculations
def budget_summary(conn, budget_id):
    budget = conn.execute(
        "SELECT * FROM budgets WHERE id = ?", (budget_id,)
    ).fetchone()

    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    totals = conn.execute("""
        SELECT
            COALESCE(SUM(planned_cost), 0) AS planned_total,
            COALESCE(SUM(actual_cost), 0) AS actual_total
        FROM expenses
        WHERE budget_id = ?
    """, (budget_id,)).fetchone()

    planned = totals["planned_total"]
    actual = totals["actual_total"]
    limit = budget["total_budget"]

    overspending_warning = (
        "Budget exceeded"
        if actual > limit
        else None
    )

    return {
        **dict(budget),
        "planned_total": round(planned, 2),
        "actual_total": round(actual, 2),
        "remaining_budget": round(limit - actual, 2),
        "utilization_percent": round(actual / limit * 100, 2) if limit > 0 else 0,
        "variance": round(actual - planned, 2),
        "overspending_warning": overspending_warning,
    }


# Create a budget
@app.post("/budgets", status_code=201)
def create_budget(data: BudgetCreate):
    name = data.treatment_name.strip()

    if not name:
        raise HTTPException(
            status_code=422, detail="Treatment name is required"
        )

    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO budgets (treatment_name, total_budget) VALUES (?, ?)",
        (name, data.total_budget),
    )

    budget_id = cursor.lastrowid
    conn.commit()
    result = budget_summary(conn, budget_id)
    conn.close()

    return result


# Get all budgets
@app.get("/budgets")
def get_budgets():
    conn = get_db()
    rows = conn.execute(
        "SELECT id FROM budgets ORDER BY id DESC"
    ).fetchall()

    result = [budget_summary(conn, row["id"]) for row in rows]
    conn.close()

    return result


# Get one budget
@app.get("/budgets/{budget_id}")
def get_budget(budget_id: int):
    conn = get_db()
    result = budget_summary(conn, budget_id)
    conn.close()
    return result


# Update a budget
@app.put("/budgets/{budget_id}")
def update_budget(budget_id: int, data: BudgetUpdate):
    name = data.treatment_name.strip()

    if not name:
        raise HTTPException(
            status_code=422, detail="Treatment name is required"
        )

    conn = get_db()
    cursor = conn.execute(
        """UPDATE budgets
           SET treatment_name = ?, total_budget = ?
           WHERE id = ?""",
        (name, data.total_budget, budget_id),
    )

    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Budget not found")

    conn.commit()
    result = budget_summary(conn, budget_id)
    conn.close()

    return result


# Delete a budget and its expenses
@app.delete("/budgets/{budget_id}")
def delete_budget(budget_id: int):
    conn = get_db()
    cursor = conn.execute(
        "DELETE FROM budgets WHERE id = ?", (budget_id,)
    )
    conn.commit()
    conn.close()

    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Budget not found")

    return {"message": "Budget deleted successfully"}


# Add an expense to a budget

@app.post("/budgets/{budget_id}/expenses", status_code=201)
def create_expense(budget_id: int, data: ExpenseCreate):
    name = data.name.strip()

    if not name:
        raise HTTPException(
            status_code=422, detail="Expense name is required"
        )

    conn = get_db()
    exists = conn.execute(
        "SELECT id FROM budgets WHERE id = ?", (budget_id,)
    ).fetchone()

    if not exists:
        conn.close()
        raise HTTPException(status_code=404, detail="Budget not found")

    category = data.category

    if not category or category.strip().lower() == "other":
        try:
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                raise RuntimeError("GEMINI_API_KEY is missing")

            client = genai.Client(api_key=api_key)

            categories = [
                "Doctor consultation",
                "Medicines",
                "Laboratory tests",
                "Diagnostic procedures",
                "Treatment and procedures",
                "Transportation",
                "Other healthcare expense",
            ]

            response = client.models.generate_content(
                model="gemini-3.5-flash-lite",
                contents=(
                    f"Classify this healthcare expense into exactly one "
                    f"of these categories: {categories}.\n"
                    f"Expense: {name}\n"
                    "Return only the exact category name. "
                    "If uncertain, return Other healthcare expense."
                ),
                config=genai.types.GenerateContentConfig(
                    temperature=0,
                    max_output_tokens=50,
                ),
            )

            predicted = (response.text or "").strip().strip('"')
            category = predicted if predicted in categories else "Other"

        except Exception as exc:
            print("Gemini expense categorization error:", repr(exc))
            category = "Other"

    try:
        cursor = conn.execute(
            """
            INSERT INTO expenses
            (budget_id, name, category, planned_cost, actual_cost)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                budget_id,
                name,
                category,
                data.planned_cost,
                data.actual_cost,
            ),
        )

        expense_id = cursor.lastrowid
        conn.commit()

        row = conn.execute(
            "SELECT * FROM expenses WHERE id = ?", (expense_id,)
        ).fetchone()

        return dict(row)

    finally:
        conn.close()



# Get expenses for a budget
@app.get("/budgets/{budget_id}/expenses")
def get_expenses(budget_id: int):
    conn = get_db()
    exists = conn.execute(
        "SELECT id FROM budgets WHERE id = ?", (budget_id,)
    ).fetchone()

    if not exists:
        conn.close()
        raise HTTPException(status_code=404, detail="Budget not found")

    rows = conn.execute(
        """SELECT * FROM expenses
           WHERE budget_id = ?
           ORDER BY id DESC""",
        (budget_id,),
    ).fetchall()

    conn.close()
    return [dict(row) for row in rows]


# Update an expense
@app.put("/expenses/{expense_id}")
def update_expense(expense_id: int, data: ExpenseUpdate):
    name = data.name.strip()

    if not name:
        raise HTTPException(
            status_code=422, detail="Expense name is required"
        )

    conn = get_db()
    cursor = conn.execute("""
        UPDATE expenses
        SET name = ?, category = ?, planned_cost = ?, actual_cost = ?
        WHERE id = ?
    """, (
        name,
        data.category,
        data.planned_cost,
        data.actual_cost,
        expense_id,
    ))

    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Expense not found")

    conn.commit()

    row = conn.execute(
        "SELECT * FROM expenses WHERE id = ?", (expense_id,)
    ).fetchone()

    conn.close()
    return dict(row)


# Delete an expense
@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int):
    conn = get_db()
    cursor = conn.execute(
        "DELETE FROM expenses WHERE id = ?", (expense_id,)
    )
    conn.commit()
    conn.close()

    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Expense not found")

    return {"message": "Expense deleted successfully"}




from huggingface_hub import InferenceClient


class CategorizeRequest(BaseModel):
    description: str = Field(min_length=2, max_length=300)


@app.post("/ai/categorize-expense")
def categorize_expense(data: CategorizeRequest):
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is missing from .env"
        )

    categories = [
        "Doctor consultation",
        "Medicines",
        "Laboratory tests",
        "Diagnostic procedures",
        "Treatment and procedures",
        "Transportation",
        "Other healthcare expense",
    ]

    try:
        client = genai.Client(api_key=api_key)

        prompt = f"""
        Classify this healthcare expense into exactly one category
        from the list below.

        Categories: {categories}

        Expense: {data.description}

        Return only the exact category name.
        If uncertain, return Other healthcare expense.
        """

        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                temperature=0,
                max_output_tokens=50,
            ),
        )

        category = (response.text or "").strip().strip('"')

        if category not in categories:
            raise HTTPException(
                status_code=502,
                detail="Gemini returned an invalid category"
            )

        return {
            "description": data.description,
            "category": category,
        }

    except HTTPException:
        raise

    except Exception as exc:
        print("Gemini classification error:", repr(exc))
        raise HTTPException(
            status_code=502,
            detail="Gemini API request failed. Check the backend terminal."
        )