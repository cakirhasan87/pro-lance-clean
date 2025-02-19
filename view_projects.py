import sqlite3

def view_projects():
    conn = sqlite3.connect('projects.db')
    c = conn.cursor()
    
    print("\n=== Projects ===\n")
    
    try:
        c.execute('SELECT * FROM projects')
        projects = c.fetchall()
        
        if not projects:
            print("No projects found in the database.")
        else:
            # Print headers
            headers = [
                'ProjectNo', 'ClientNo', 'ResourceNo', 'AgreementNr', 
                'StartDate', 'EndDate', 'Status', 'TotalBudget', 
                'ClCurrency', 'RequiredBudget', 'ReCurrency', 
                'InvoiceNrCl', 'InvoiceNrRe', 'PlannedPayDate',
                'PaidByClDate', 'PaidByProlanceDate'
            ]
            
            # Calculate column widths
            widths = [max(len(str(project[i])) for project in projects + [headers]) for i in range(len(headers))]
            
            # Print header row
            for i, header in enumerate(headers):
                print(f"{header:<{widths[i]}} ", end='')
            print("\n" + "-" * (sum(widths) + len(widths)))
            
            # Print data rows
            for project in projects:
                for i, value in enumerate(project):
                    print(f"{str(value):<{widths[i]}} ", end='')
                print()
    
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    
    finally:
        conn.close()

if __name__ == "__main__":
    view_projects() 