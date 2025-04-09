import sqlite3
from datetime import datetime

def validate_date(date_str):
    try:
        if date_str and date_str.lower() != 'none':
            datetime.strptime(date_str, '%Y-%m-%d')
            return True
        return True
    except ValueError:
        return False

def validate_decimal(number_str):
    try:
        if number_str and number_str.lower() != 'none':
            float(number_str)
            return True
        return True
    except ValueError:
        return False

def add_new_project():
    print("\n=== Add New Project ===\n")
    
    # Get project details
    project_data = {}
    
    # Required fields
    project_data['ProjectNo'] = input("Project Number (e.g., PRJ004): ").strip()
    project_data['ClientNo'] = input("Client Number (e.g., CL001): ").strip()
    project_data['ResourceNo'] = input("Resource Number (e.g., RS001): ").strip()
    project_data['AgreementNr'] = input("Agreement Number (e.g., AGR2024-004): ").strip()
    
    # Optional fields with validation
    while True:
        start_date = input("Start Date (YYYY-MM-DD or press Enter for none): ").strip()
        if validate_date(start_date):
            project_data['StartDate'] = start_date if start_date and start_date.lower() != 'none' else None
            break
        print("Invalid date format. Please use YYYY-MM-DD")

    while True:
        end_date = input("End Date (YYYY-MM-DD or press Enter for none): ").strip()
        if validate_date(end_date):
            project_data['EndDate'] = end_date if end_date and end_date.lower() != 'none' else None
            break
        print("Invalid date format. Please use YYYY-MM-DD")

    project_data['Status'] = input("Status (e.g., Active, Planning, Completed): ").strip()

    while True:
        total_budget = input("Total Budget (e.g., 5000.00 or press Enter for none): ").strip()
        if validate_decimal(total_budget):
            project_data['TotalBudget'] = float(total_budget) if total_budget and total_budget.lower() != 'none' else None
            break
        print("Invalid number format. Please use decimal numbers")

    project_data['ClCurrency'] = input("Client Currency (e.g., EUR, USD): ").strip()

    while True:
        required_budget = input("Required Budget (e.g., 3500.00 or press Enter for none): ").strip()
        if validate_decimal(required_budget):
            project_data['RequiredBudget'] = float(required_budget) if required_budget and required_budget.lower() != 'none' else None
            break
        print("Invalid number format. Please use decimal numbers")

    project_data['ReCurrency'] = input("Resource Currency (e.g., EUR, USD): ").strip()
    project_data['InvoiceNrCl'] = input("Client Invoice Number (or press Enter for none): ").strip() or None
    project_data['InvoiceNrRe'] = input("Resource Invoice Number (or press Enter for none): ").strip() or None

    while True:
        planned_pay_date = input("Planned Payment Date (YYYY-MM-DD or press Enter for none): ").strip()
        if validate_date(planned_pay_date):
            project_data['PlannedPayDate'] = planned_pay_date if planned_pay_date and planned_pay_date.lower() != 'none' else None
            break
        print("Invalid date format. Please use YYYY-MM-DD")

    while True:
        paid_by_cl_date = input("Paid By Client Date (YYYY-MM-DD or press Enter for none): ").strip()
        if validate_date(paid_by_cl_date):
            project_data['PaidByClDate'] = paid_by_cl_date if paid_by_cl_date and paid_by_cl_date.lower() != 'none' else None
            break
        print("Invalid date format. Please use YYYY-MM-DD")

    while True:
        paid_by_prolance_date = input("Paid By Prolance Date (YYYY-MM-DD or press Enter for none): ").strip()
        if validate_date(paid_by_prolance_date):
            project_data['PaidByProlanceDate'] = paid_by_prolance_date if paid_by_prolance_date and paid_by_prolance_date.lower() != 'none' else None
            break
        print("Invalid date format. Please use YYYY-MM-DD")

    # Save to database
    conn = sqlite3.connect('projects.db')
    c = conn.cursor()
    
    try:
        c.execute('''
            INSERT INTO projects (
                ProjectNo, ClientNo, ResourceNo, AgreementNr,
                StartDate, EndDate, Status, TotalBudget,
                ClCurrency, RequiredBudget, ReCurrency,
                InvoiceNrCl, InvoiceNrRe, PlannedPayDate,
                PaidByClDate, PaidByProlanceDate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            project_data['ProjectNo'], project_data['ClientNo'],
            project_data['ResourceNo'], project_data['AgreementNr'],
            project_data['StartDate'], project_data['EndDate'],
            project_data['Status'], project_data['TotalBudget'],
            project_data['ClCurrency'], project_data['RequiredBudget'],
            project_data['ReCurrency'], project_data['InvoiceNrCl'],
            project_data['InvoiceNrRe'], project_data['PlannedPayDate'],
            project_data['PaidByClDate'], project_data['PaidByProlanceDate']
        ))
        
        conn.commit()
        print("\nProject added successfully!")
        
    except sqlite3.IntegrityError:
        print("\nError: Project number already exists!")
    except sqlite3.Error as e:
        print(f"\nAn error occurred: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    add_new_project() 