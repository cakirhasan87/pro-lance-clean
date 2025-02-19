import sys
import os

# Get the application's base directory
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

# Add the application directory to the Python path
sys.path.append(CURRENT_DIR)

# Set up the Python interpreter path
INTERP = "/home/yw080dukodzr/virtualenv/yw080dukodzr/3.7/bin/python3"
if sys.executable != INTERP:
    os.execl(INTERP, INTERP, *sys.argv)

from app import app as application 