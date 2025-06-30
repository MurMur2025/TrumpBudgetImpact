import json

# ✅ Load the current state_messaging.json
with open("state_messaging.json") as f:
    reports = json.load(f)

# ✅ Full, correct senators map — update if needed!
SENATORS = {
    "AL": ["Katie Britt", "Tommy Tuberville"],
    "AK": ["Lisa Murkowski", "Dan Sullivan"],
    "AZ": ["Kyrsten Sinema", "Mark Kelly"],
    "AR": ["John Boozman", "Tom Cotton"],
    "CA": ["Alex Padilla", "Laphonza Butler"],  # Adjust if updated
    "CO": ["Michael Bennet", "John Hickenlooper"],
    "CT": ["Richard Blumenthal", "Chris Murphy"],
    "DE": ["Tom Carper", "Chris Coons"],
    "FL": ["Marco Rubio", "Rick Scott"],
    "GA": ["Jon Ossoff", "Raphael Warnock"],
    "HI": ["Brian Schatz", "Mazie Hirono"],
    "IA": ["Chuck Grassley", "Joni Ernst"],
    "ID": ["Mike Crapo", "Jim Risch"],
    "IL": ["Dick Durbin", "Tammy Duckworth"],
    "IN": ["Todd Young", "Mike Braun"],
    "KS": ["Jerry Moran", "Roger Marshall"],
    "KY": ["Mitch McConnell", "Rand Paul"],
    "LA": ["Bill Cassidy", "John Kennedy"],
    "MA": ["Elizabeth Warren", "Ed Markey"],
    "MD": ["Ben Cardin", "Chris Van Hollen"],
    "ME": ["Susan Collins", "Angus King"],
    "MI": ["Gary Peters", "Debbie Stabenow"],
    "MN": ["Amy Klobuchar", "Tina Smith"],
    "MO": ["Josh Hawley", "Eric Schmitt"],
    "MS": ["Roger Wicker", "Cindy Hyde-Smith"],
    "MT": ["Jon Tester", "Steve Daines"],
    "NC": ["Thom Tillis", "Ted Budd"],
    "ND": ["John Hoeven", "Kevin Cramer"],
    "NE": ["Deb Fischer", "Pete Ricketts"],
    "NH": ["Jeanne Shaheen", "Maggie Hassan"],
    "NJ": ["Bob Menendez", "Cory Booker"],
    "NM": ["Martin Heinrich", "Ben Ray Luján"],
    "NV": ["Jacky Rosen", "Catherine Cortez Masto"],
    "NY": ["Chuck Schumer", "Kirsten Gillibrand"],
    "OH": ["Sherrod Brown", "J.D. Vance"],
    "OK": ["James Lankford", "Markwayne Mullin"],
    "OR": ["Ron Wyden", "Jeff Merkley"],
    "PA": ["Bob Casey", "John Fetterman"],
    "RI": ["Jack Reed", "Sheldon Whitehouse"],
    "SC": ["Lindsey Graham", "Tim Scott"],
    "SD": ["John Thune", "Mike Rounds"],
    "TN": ["Marsha Blackburn", "Bill Hagerty"],
    "TX": ["John Cornyn", "Ted Cruz"],
    "UT": ["Mike Lee", "Mitt Romney"],
    "VA": ["Mark Warner", "Tim Kaine"],
    "VT": ["Bernie Sanders", "Peter Welch"],
    "WA": ["Patty Murray", "Maria Cantwell"],
    "WI": ["Tammy Baldwin", "Ron Johnson"],
    "WV": ["Joe Manchin", "Shelley Moore Capito"],
    "WY": ["John Barrasso", "Cynthia Lummis"]
}

# ✅ Patch any entries with placeholder senators
patched = []
for entry in reports:
    if entry.get("senators") == ["Senator A", "Senator B"]:
        state = entry["state"]
        if state in SENATORS:
            entry["senators"] = SENATORS[state]
            print(f"✅ Patched senators for {state}")
    patched.append(entry)

# ✅ Save back to same file (or use a new file if you want a backup)
with open("state_messaging.json", "w") as f:
    json.dump(patched, f, indent=2)

print("✅ Done — all states patched if needed.")
