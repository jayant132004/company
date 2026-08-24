# Count net open/close divs in sortmentor/page.tsx between line 1274 and 1918
with open("/Users/macbook/dream/resaech/frontend/app/sortmentor/page.tsx", "r") as f:
    lines = f.readlines()

code_segment = lines[1273:1918]

open_divs = 0
close_divs = 0

for idx, line in enumerate(code_segment):
    line_num = 1274 + idx
    trimmed = line.strip()
    if trimmed.startswith("//") or trimmed.startswith("{/*"):
        continue
    
    opens = line.count("<div") + line.count("<motion.div")
    closes = line.count("</div>") + line.count("</motion.div>")
    
    open_divs += opens
    close_divs += closes

print("TOTAL OPENS:", open_divs)
print("TOTAL CLOSES:", close_divs)
print("NET REMAINING OPEN AT LINE 1918:", open_divs - close_divs)
