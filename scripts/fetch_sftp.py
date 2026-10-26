"""Fetch public Minecraft stats from Space Node using verified SFTP host keys."""
import argparse
import os
from pathlib import Path
from posixpath import join as remote_join

import paramiko


def require_env(name):
    value = os.environ.get(name)
    if not value:
        raise SystemExit(f'Missing secret or variable: {name}')
    return value


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dest', type=Path, default=Path('downloaded-minecraft'))
    args = parser.parse_args()
    host = require_env('SFTP_HOST')
    port = int(os.environ.get('SFTP_PORT') or '22')
    user = require_env('SFTP_USER')
    password = require_env('SFTP_PASSWORD')
    remote_root = (os.environ.get('SFTP_SERVER_ROOT') or '.').rstrip('/') or '.'
    known_hosts = require_env('SFTP_KNOWN_HOSTS')
    args.dest.mkdir(parents=True, exist_ok=True)
    hosts_file = args.dest / '.known_hosts'
    hosts_file.write_text(known_hosts.strip() + '\n', encoding='utf-8')
    client = paramiko.SSHClient()
    client.load_host_keys(str(hosts_file))
    client.set_missing_host_key_policy(paramiko.RejectPolicy())
    try:
        client.connect(hostname=host, port=port, username=user, password=password,
                       allow_agent=False, look_for_keys=False, timeout=20, auth_timeout=20)
        sftp = client.open_sftp()
        try:
            candidates = ['world/players/stats', 'world/stats']
            selected = None
            for relative in candidates:
                remote_dir = remote_join(remote_root, relative)
                try:
                    entries = sftp.listdir(remote_dir)
                    selected = (relative, remote_dir, entries)
                    break
                except OSError:
                    continue
            if selected is None:
                raise SystemExit('No stats directory at world/stats or world/players/stats. Check SFTP_SERVER_ROOT and world name.')
            relative, remote_dir, entries = selected
            filenames = sorted(f for f in entries if f.endswith('.json'))
            if not filenames:
                raise SystemExit(f'Stats directory empty: {relative}; refusing to replace existing stats.')
            local_dir = args.dest / relative
            local_dir.mkdir(parents=True, exist_ok=True)
            for filename in filenames:
                sftp.get(remote_join(remote_dir, filename), str(local_dir / filename))
            try:
                sftp.get(remote_join(remote_root, 'usercache.json'), str(args.dest / 'usercache.json'))
            except OSError:
                print('usercache.json not found; UUIDs will be used as fallback names.')
            print(f'Downloaded {len(filenames)} player statistic files from {relative}.')
        finally:
            sftp.close()
    finally:
        client.close()


if __name__ == '__main__':
    main()
