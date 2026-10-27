"""Skip scheduled Pages deployment when public player stats have not changed."""
import json
import os
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

CURRENT = Path('public/stats/data.json')
LIVE_URL = 'https://imecht.gg/stats/data.json'


def data_without_timestamp(document):
    return {key: value for key, value in document.items() if key != 'generatedAt'}


def main():
    current = json.loads(CURRENT.read_text(encoding='utf-8'))
    if not current.get('players'):
        raise SystemExit('No player stats generated; refusing to publish empty stats.')

    changed = True
    try:
        request = Request(LIVE_URL, headers={'User-Agent': 'imechtgg-stats-check/1.0', 'Cache-Control': 'no-cache'})
        with urlopen(request, timeout=20) as response:
            published = json.load(response)
        if data_without_timestamp(current) == data_without_timestamp(published):
            changed = False
            # Preserve last actual data update time when no values changed.
            if 'generatedAt' in published:
                current['generatedAt'] = published['generatedAt']
                CURRENT.write_text(json.dumps(current, ensure_ascii=False, indent=2), encoding='utf-8')
    except (HTTPError, URLError, TimeoutError, ValueError, OSError, TypeError) as exc:
        print(f'Could not compare with live data ({exc}); deploying as a precaution.')

    print('Statistics changed: ' + str(changed).lower())
    with open(os.environ['GITHUB_OUTPUT'], 'a', encoding='utf-8') as output:
        output.write(f'changed={str(changed).lower()}\n')


if __name__ == '__main__':
    main()
