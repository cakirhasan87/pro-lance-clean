import sqlite3
from datetime import date, timedelta

def add_sample_data():
    conn = sqlite3.connect('projects.db')
    c = conn.cursor()
    
    # Sample project data
    sample_projects = [
        (
            'PRJ001', 'CL001', 'RS001', 'AGR2024-001',
            '2024-01-01', '2024-03-31', 'Active',
            5000.00, 'EUR', 3500.00, 'EUR',
            'INV-CL-001', 'INV-RE-001',
            '2024-04-15', '2024-04-14', '2024-04-16'
        ),
        (
            'PRJ002', 'CL002', 'RS002', 'AGR2024-002',
            '2024-02-01', '2024-04-30', 'Planning',
            7500.00, 'USD', 5000.00, 'EUR',
            None, None,
            '2024-05-15', None, None
        ),
        (
            'PRJ003', 'CL001', 'RS003', 'AGR2024-003',
            '2024-01-15', '2024-02-28', 'Completed',
            3000.00, 'EUR', 2000.00, 'EUR',
            'INV-CL-003', 'INV-RE-003',
            '2024-03-15', '2024-03-14', '2024-03-16'
        )
    ]
    
    try:
        c.executemany('''
            INSERT INTO projects (
                ProjectNo, ClientNo, ResourceNo, AgreementNr,
                StartDate, EndDate, Status, TotalBudget,
                ClCurrency, RequiredBudget, ReCurrency,
                InvoiceNrCl, InvoiceNrRe, PlannedPayDate,
                PaidByClDate, PaidByProlanceDate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', sample_projects)
        
        conn.commit()
        print("Sample data added successfully!")
        
    except sqlite3.IntegrityError as e:
        print(f"Error: {e} - Some projects may already exist.")
    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    add_sample_data() 