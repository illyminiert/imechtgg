import argparse
import json
from datetime import datetime, timezone
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description='Minecraft Statistik-Export für imecht.gg')
    parser.add_argument('--server-dir', type=Path, required=True, help='Ordner mit world/ und optional usercache.json')
    parser.add_argument('--world', default='world', help='Weltordnername, Standard: world')
    parser.add_argument('--output', type=Path, default=Path('stats/data.json'))
    args = parser.parse_args()

    world = args.server_dir / args.world
    options = [world / 'players' / 'stats', world / 'stats']
    stat_dir = next((p for p in options if p.is_dir()), None)
    if stat_dir is None:
        raise SystemExit(f'Kein Statistikordner gefunden: {options}')

    names = {}
    cache_path = args.server_dir / 'usercache.json'
    if cache_path.exists():
        try:
            for item in json.loads(cache_path.read_text(encoding='utf-8')):
                if item.get('uuid') and item.get('name'):
                    names[item['uuid'].lower()] = item['name']
        except (ValueError, OSError) as exc:
            print(f'Warnung: usercache.json konnte nicht gelesen werden: {exc}')

    players = []
    for file in sorted(stat_dir.glob('*.json')):
        try:
            raw = json.loads(file.read_text(encoding='utf-8'))
            stats = raw.get('stats', {})
            custom = stats.get('minecraft:custom', {})
            mined = stats.get('minecraft:mined', {})
            killed = stats.get('minecraft:killed', {})
            # Manche Minecraft-Versionen / Mods nutzen abweichende Keys.
            play_ticks = custom.get('minecraft:play_time', custom.get('minecraft:play_one_minute', 0))
            uuid = file.stem.lower()
            players.append({
                'uuid': uuid,
                'name': names.get(uuid, uuid[:8]),
                'playHours': round(play_ticks / 72000, 1),
                'deaths': custom.get('minecraft:deaths', 0),
                'mobKills': custom.get('minecraft:mob_kills', 0),
                'playerKills': custom.get('minecraft:player_kills', 0),
                'blocksMined': sum(v for v in mined.values() if isinstance(v, (int, float))),
                'diamondOre': mined.get('minecraft:diamond_ore', 0) + mined.get('minecraft:deepslate_diamond_ore', 0),
                'walkKm': round(custom.get('minecraft:walk_one_cm', 0) / 100000, 2),
                'jumps': custom.get('minecraft:jump', 0),
                'topMined': sorted(mined.items(), key=lambda x: x[1], reverse=True)[:5],
                'topKilled': sorted(killed.items(), key=lambda x: x[1], reverse=True)[:5],
            })
        except (ValueError, OSError, TypeError) as exc:
            print(f'Warnung: {file.name} übersprungen: {exc}')

    result = {
        'generatedAt': datetime.now(timezone.utc).isoformat(),
        'playerCount': len(players),
        'players': sorted(players, key=lambda p: p['playHours'], reverse=True),
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'{len(players)} Spieler nach {args.output} exportiert.')


if __name__ == '__main__':
    main()
