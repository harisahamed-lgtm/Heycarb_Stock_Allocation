from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import stock

app = FastAPI(title="Stock Allocation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "FastAPI React Demo"}


@app.get("/api/test-database")
def test_database():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT DB_NAME()")
    database_name = cursor.fetchone()[0]

    cursor.close()
    connection.close()

    return {
        "status": "Connected",
        "database": database_name
    }


app.include_router(stock.router)