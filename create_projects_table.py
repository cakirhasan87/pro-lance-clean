import sqlite3

def create_projects_table():
    conn = sqlite3.connect('projects.db')
    c = conn.cursor()
    
    try:
        c.execute('''
            CREATE TABLE IF NOT EXISTS projects (
                ProjectNo TEXT PRIMARY KEY,
                ClientNo TEXT NOT NULL,
                ResourceNo TEXT NOT NULL,
                AgreementNr TEXT NOT NULL,
                StartDate DATE,
                EndDate DATE,
                Status TEXT,
                TotalBudget DECIMAL(10,2),
                ClCurrency TEXT,
                RequiredBudget DECIMAL(10,2),
                ReCurrency TEXT,
                InvoiceNrCl TEXT,
                InvoiceNrRe TEXT,
                PlannedPayDate DATE,
                PaidByClDate DATE,
                PaidByProlanceDate DATE
            )
        ''')
        
        conn.commit()
        print("Projects table created successfully!")
        
    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
    
    finally:
        conn.close()

if __name__ == "__main__":
    create_projects_table() 