import re
from datetime import datetime, timedelta

def extract_size_price(text: str) -> list:
    objects = []
    entries = text.split(',')
    for entry in entries:
        parts = entry.split('|')
        if len(parts) == 2:
            size = parts[0].strip()
            price = parts[1].strip()
            objects.append({"size": size, "price": price})
    return objects