import sqlite3

def view_users():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    
    print("\n=== Kayıtlı Kullanıcılar ===\n")
    
    try:
        # Tüm kullanıcıları getir
        c.execute('SELECT * FROM users')
        users = c.fetchall()
        
        if not users:
            print("Henüz kayıtlı kullanıcı bulunmamaktadır.")
        else:
            # Başlıkları yazdır
            print(f"{'ID':<5} {'Ad Soyad':<20} {'Email':<30} {'Telefon':<15} {'Kullanıcı Tipi':<15}")
            print("-" * 85)
            
            # Her kullanıcıyı yazdır
            for user in users:
                print(f"{user[0]:<5} {user[1]:<20} {user[2]:<30} {user[3]:<15} {user[4]:<15}")
    
    except sqlite3.Error as e:
        print(f"Veritabanı hatası: {e}")
    
    finally:
        conn.close()

if __name__ == "__main__":
    view_users() 