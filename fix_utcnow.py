import os
import glob

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    if 'datetime.utcnow' not in content:
        return

    # Add timezone import if needed
    if 'from datetime import datetime' in content and 'timezone' not in content:
        content = content.replace('from datetime import datetime', 'from datetime import datetime, timezone')
    elif 'import datetime' in content and 'from datetime import timezone' not in content and 'from datetime import datetime' not in content:
         # simple import datetime, no need to add timezone if we use datetime.timezone.utc
         pass

    content = content.replace('datetime.now(timezone.utc)', 'datetime.now(timezone.utc)')
    content = content.replace('default=lambda: datetime.now(timezone.utc)', 'default=lambda: datetime.now(timezone.utc)')

    with open(filepath, 'w') as f:
        f.write(content)

for py_file in glob.glob('**/*.py', recursive=True):
    if 'node_modules' in py_file or '.venv' in py_file:
        continue
    fix_file(py_file)
