import json

# Load all states you should have
with open("state_national_republican_swing_totals.json") as f:
    all_states = list(json.load(f)["states"].keys())

# Load states you have reports for
with open("state_messaging.json") as f:
    done_states = [entry["state"] for entry in json.load(f)]

# Find any missing
missing = sorted(set(all_states) - set(done_states))

print("✅ Total states:", len(all_states))
print("✅ States with reports:", len(done_states))
print("⏳ States still missing:", missing)

# Save to file for easy rerun
with open("missing_states.json", "w") as f:
    json.dump(missing, f, indent=2)
