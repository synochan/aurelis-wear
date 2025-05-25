"""
This file helps Vercel include all the necessary Python files in the deployment.
"""
import glob
import os
from pathlib import Path

# Get all Python modules and packages in the project
files = glob.glob("**/*.py", recursive=True)
dirs = set()

for file in files:
    parts = os.path.dirname(file).split(os.sep)
    current = ""
    for part in parts:
        if current:
            current = os.path.join(current, part)
        else:
            current = part
        if current and os.path.isdir(current):
            dirs.add(current)

# Create __init__.py files if they don't exist
for dir_path in dirs:
    init_file = os.path.join(dir_path, "__init__.py")
    if not os.path.exists(init_file):
        with open(init_file, "w") as f:
            f.write("# This file was auto-generated for Vercel deployment\n")

# Print the module structure to confirm
print("Detected Python modules:")
for dir_path in sorted(dirs):
    print(f"- {dir_path}") 