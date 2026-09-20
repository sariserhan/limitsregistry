"""Run with a disposable Python environment containing fakeredis[lua]. No network or email.
Exercises the actual production Lua script against Redis command semantics + Lua runtime.
"""
from pathlib import Path
import json
import re
import fakeredis

script = re.search(r'export const RECORD_ACTIVITY_SCRIPT = `([\s\S]*?)`;', Path('src/api/activity.ts').read_text()).group(1)
r = fakeredis.FakeRedis(decode_responses=True)
base = 1_800_000_000_000  # aligned to 5-minute window

def record(at, status=401, subject='client:hashed', kind='invalid-credentials', threshold=30):
    hour, window = at // 3600000, at // 300000
    keys = [f'hour:{hour}', f'window:{window}', f'window:{window-1}', f'subject:{window}:{subject}', 'cooldowns', 'signals', 'last-recorded']
    args = [f'snapshot|{status}|GET|anonymous', at, status, kind, threshold, subject, 'snapshot']
    r.eval(script, len(keys), *keys, *args)

# A burst alone is not sustained; count at a later minute triggers once.
for _ in range(30): record(base)
assert r.zcard('signals') == 0
record(base + 61000)
assert r.zcard('signals') == 1
for _ in range(100): record(base + 62000)
assert r.zcard('signals') == 1
assert json.loads(r.zrange('signals', 0, -1)[0])['kind'] == 'invalid-credentials'
assert 0 < r.ttl(f'subject:{base//300000}:client:hashed') <= 900
assert 0 < r.ttl(f'hour:{base//3600000}') <= 172800

# Sustained activity in a different window/hour does not bypass the cooldown.
for _ in range(30): record(base + 300000)
record(base + 361000)
assert r.zcard('signals') == 1
for _ in range(30): record(base + 3600000)
record(base + 3661000)
assert r.zcard('signals') == 2

# History is capped; cooldown tracking also has a fixed cardinality cap.
r.flushall()
for i in range(1050):
    subject = f'client:hash-{i}'
    record(base, subject=subject, threshold=1)
    record(base + 61000, subject=subject, threshold=1)
assert r.zcard('signals') == 100
assert r.zcard('cooldowns') == 1000

# Fixed endpoint windows compare against a real previous-window baseline.
r.flushall()
for _ in range(100): record(base, status=200, kind='', subject='')
for _ in range(499): record(base+300000, status=200, kind='', subject='')
assert r.zcard('signals') == 0
record(base+361000, status=200, kind='', subject='')
assert json.loads(r.zrange('signals', 0, -1)[0])['kind'] == 'traffic-spike'

# Server failures signal only after the duration/count thresholds are met.
r.flushall()
for _ in range(20): record(base, status=503, kind='', subject='')
assert r.zcard('signals') == 0
record(base+61000, status=503, kind='', subject='')
assert json.loads(r.zrange('signals', 0, -1)[0])['kind'] == 'server-errors'
# Earlier healthy traffic must not make a sudden error burst count as sustained.
r.flushall()
record(base, status=200, kind='', subject='')
for _ in range(25): record(base+61000, status=503, kind='', subject='')
assert r.zcard('signals') == 0
record(base+122000, status=503, kind='', subject='')
assert r.zcard('signals') == 1
print('Lua checks passed: sustained signals, thresholds, cooldowns, retention, bounded history, spikes and server errors.')
