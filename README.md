
# SehatBudget

**Smart Budget and Expense Management**

SehatBudget is a budgeting application designed to help users organize budgets, track expenses, monitor spending, and identify overspending. It combines budget management with AI-powered expense categorization to support informed financial decisions.

## Features

- **Budget Management:** Create, view, update, and delete budgets.
- **Expense Tracking:** Record, retrieve, update, and delete expenses.
- **AI Expense Categorization:** Categorize expenses using the Google Gemini API.
- **Budget Analytics:** Calculate total spending, remaining balance, budget utilization, and variance.
- **Overspending Detection:** Identify when expenses exceed the allocated budget.
- **Interactive Interface:** React-based frontend for budget and expense management.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript |
| Backend | Python, FastAPI |
| Database | SQLite |
| AI Integration | Google Gemini API |

## Project Structure

```text
hackathon-project/
├── backend/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Installation and Setup

### Prerequisites

- Python
- Node.js and npm
- Google Gemini API key for AI expense categorization

### 1. Clone the Repository

```bash
git clone https://github.com/NimraMughal11/hackathon-project.git
cd hackathon-project
```

### 2. Set Up the Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create a `.env` file inside the `backend` directory:

```env
GEMINI_API_KEY=your_api_key_here
```

Start the backend server:

```bash
uvicorn main:app --reload
```

Backend URL: `http://127.0.0.1:8000`

Interactive API documentation: `http://127.0.0.1:8000/docs`

### 3. Set Up the Frontend

Open a separate terminal:

```powershell
cd frontend
npm install
```

Create a `.env` file inside the `frontend` directory:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed in the terminal.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/budgets` | Retrieve all budgets |
| POST | `/budgets` | Create a budget |
| GET | `/budgets/{budget_id}` | Retrieve budget details and summary |
| PUT | `/budgets/{budget_id}` | Update a budget |
| DELETE | `/budgets/{budget_id}` | Delete a budget |
| POST | `/budgets/{budget_id}/expenses` | Add an expense |
| GET | `/budgets/{budget_id}/expenses` | Retrieve budget expenses |
| PUT | `/expenses/{expense_id}` | Update an expense |
| DELETE | `/expenses/{expense_id}` | Delete an expense |
| POST | `/ai/categorize-expense` | Categorize an expense using AI |

## Security

- Store API keys in environment variables.
- Never commit `.env` files or credentials to version control.
- Configure CORS appropriately for deployment.
- Protect financial data when implementing authentication and cloud deployment.

## Future Enhancements

- Complete frontend-to-backend integration.
- Add user authentication and personalized financial profiles.
- Introduce spending trends and category-wise analytics.
- Expand AI-driven budgeting insights.
- Deploy the application for public access.

## License

Developed as a hackathon project. Licensing terms can be specified by the project maintainers.

---

**SehatBudget — Smarter budgeting through technology.**
