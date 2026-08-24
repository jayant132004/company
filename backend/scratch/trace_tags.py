import re

with open("/Users/macbook/dream/resaech/frontend/app/sortmentor/page.tsx", "r") as f:
    lines = f.readlines()

code_segment = "".join(lines[1273:1918])

# Extract all opening and closing tags of div and motion.div (excluding self-closing tags)
# Use a simple regex that finds <div, <motion.div, </div, </motion.div
tags = re.findall(r'(</?div|</?motion\.div)(\s+[^>]*?)?(>|/>)', code_segment)

stack = []

for tag_type, attrs, end_bracket in tags:
    is_closing = tag_type.startswith("</")
    is_self_closing = end_bracket == "/>"
    
    clean_type = tag_type.replace("</", "").replace("<", "")
    
    if is_self_closing:
        continue
        
    if not is_closing:
        stack.append((clean_type, attrs or ""))
    else:
        if stack:
            # Pop matching tag type if possible, or print error
            top, top_attrs = stack.pop()
            if top != clean_type:
                # Put it back and warn
                stack.append((top, top_attrs))
                print(f"Mismatch: popping {top} for closing {clean_type}")
        else:
            print(f"Empty stack when closing {clean_type}")

print("\nSTILL OPEN AT LINE 1918:")
for idx, (tag, attrs) in enumerate(stack):
    # Truncate attributes for readability
    clean_attrs = attrs.strip().replace("\n", " ")[:60]
    print(f"{idx+1}. <{tag} {clean_attrs}...>")
