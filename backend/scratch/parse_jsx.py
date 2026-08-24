import re

with open("/Users/macbook/dream/resaech/frontend/app/sortmentor/page.tsx", "r") as f:
    code = f.read()

# Remove comments
code = re.sub(r'{\s*/\*.*?\*/\s*}', '', code, flags=re.DOTALL)
code = re.sub(r'//.*?\n', '\n', code)

# Find all opening and closing tags for div and motion.div
tags = re.findall(r'(</?div|</?motion\.div)(.*?)(/?>)', code)

stack = []
mismatches = []

for tag_type, attrs, end_bracket in tags:
    is_closing = tag_type.startswith("</")
    is_self_closing = end_bracket == "/>"
    
    clean_type = tag_type.replace("</", "").replace("<", "")
    
    if is_self_closing:
        continue
        
    if not is_closing:
        stack.append(clean_type)
    else:
        if not stack:
            print(f"ERROR: Found closing tag {clean_type} with empty stack!")
        else:
            top = stack.pop()
            if top != clean_type:
                print(f"ERROR: Mismatched tag! Expected {top}, got {clean_type}")

print("STACK AT END OF PARSING (should be empty):", stack)
