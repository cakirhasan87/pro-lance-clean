#!/usr/bin/env python3
"""
Test Supabase connection
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supabase import create_client

# Supabase configuration
SUPABASE_PROJECT_ID = 'hhudczwbcjejxvbxglkv'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhodWRjendiejZqZWp4dmJ4Z2xrdiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzA5NzQ3MTU3LCJleHAiOjIwMjUzMjMxNTd9.P_C70m_yEY0H9M72_QvEVX-HSY0nPipJrWpvrdmxQ0M'

def test_supabase_connection():
    """Test Supabase connection"""
    try:
        print("Supabase bağlantısı test ediliyor...")
        
        # Initialize Supabase client
        supabase = create_client(
            'https://hhudczwbcjejxvbxglkv.supabase.co',
            SUPABASE_KEY
        )
        
        # Test connection by trying to get data from a table
        print("Veritabanı tabloları kontrol ediliyor...")
        
        # Try to get contact_messages table
        try:
            result = supabase.table('contact_messages').select('*').limit(1).execute()
            print("✅ contact_messages tablosu erişilebilir")
        except Exception as e:
            print(f"❌ contact_messages tablosu hatası: {str(e)}")
        
        # Try to get blog_posts table
        try:
            result = supabase.table('blog_posts').select('*').limit(1).execute()
            print("✅ blog_posts tablosu erişilebilir")
        except Exception as e:
            print(f"❌ blog_posts tablosu hatası: {str(e)}")
        
        print("✅ Supabase bağlantısı başarılı!")
        return True
        
    except Exception as e:
        print(f"❌ Supabase bağlantı hatası: {str(e)}")
        return False

if __name__ == "__main__":
    test_supabase_connection()
