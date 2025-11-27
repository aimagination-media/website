import os
import yaml
import json
import datetime
import re

import urllib.request
import urllib.error

# Configuration
VAULT_PATH = '/mnt/ssd4k/Obsidian/Youtube/md_vault'
OUTPUT_PATH = 'assets/data/content.json'
CACHE_PATH = 'assets/data/playlist_cache.json'

# Mappings for UI display
CHANNEL_INFO = {
    'math': {
        'en': {'title': 'Mathematics', 'description': 'Master math concepts from basics to advanced topics'},
        'es': {'title': 'Matemáticas', 'description': 'Domina conceptos matemáticos desde lo básico hasta temas avanzados'},
        'de': {'title': 'Mathematik', 'description': 'Meistere mathematische Konzepte von den Grundlagen bis zu fortgeschrittenen Themen'}
    },
    'chemistry': {
        'en': {'title': 'Chemistry', 'description': 'Explore the fascinating world of chemical reactions'},
        'es': {'title': 'Química', 'description': 'Explora el fascinante mundo de las reacciones químicas'},
        'de': {'title': 'Chemie', 'description': 'Entdecke die faszinierende Welt der chemischen Reaktionen'}
    },
    'audiobook': {
        'en': {'title': 'Audiobooks', 'description': 'Listen to engaging stories and educational content'},
        'es': {'title': 'Audiolibros', 'description': 'Escucha historias cautivadoras y contenido educativo'},
        'de': {'title': 'Hörbücher', 'description': 'Höre fesselnde Geschichten und Bildungsinhalte'}
    }
}

def load_cache():
    if os.path.exists(CACHE_PATH):
        try:
            with open(CACHE_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_cache(cache):
    os.makedirs(os.path.dirname(CACHE_PATH), exist_ok=True)
    with open(CACHE_PATH, 'w', encoding='utf-8') as f:
        json.dump(cache, f, indent=2, ensure_ascii=False)

def fetch_playlist_title(playlist_id):
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/playlist?list={playlist_id}&format=json"
    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            return data.get('title')
    except Exception as e:
        print(f"Failed to fetch title for playlist {playlist_id}: {e}")
        return None

def parse_frontmatter(content):
    """
    Parses YAML frontmatter from markdown content.
    """
    if not content.startswith('---'):
        return None, content
    
    try:
        parts = content.split('---', 2)
        if len(parts) < 3:
            return None, content
        
        frontmatter = yaml.safe_load(parts[1])
        return frontmatter, parts[2]
    except Exception as e:
        print(f"Error parsing frontmatter: {e}")
        return None, content

def scan_vault():
    data = {
        'en': {},
        'es': {},
        'de': {}
    }
    
    playlist_cache = load_cache()
    cache_updated = False
    
    # Initialize structure
    for lang in data:
        for channel in CHANNEL_INFO:
            data[lang][channel] = {
                'title': CHANNEL_INFO[channel][lang]['title'],
                'description': CHANNEL_INFO[channel][lang]['description'],
                'videos': [],
                'playlists': {}
            }

    print(f"Scanning vault at: {VAULT_PATH}")
    
    for root, dirs, files in os.walk(VAULT_PATH):
        for file in files:
            if not file.endswith('.md'):
                continue
                
            file_path = os.path.join(root, file)
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                meta, _ = parse_frontmatter(content)
                
                if not meta:
                    continue
                
                # Check required fields
                if 'video_id' not in meta or 'language' not in meta or 'channel' not in meta:
                    continue
                
                # Normalize language
                lang_map = {'spanish': 'es', 'english': 'en', 'german': 'de'}
                lang = meta['language'].lower()
                lang = lang_map.get(lang, lang)
                
                if lang not in data:
                    continue
                    
                channel = meta['channel'].lower()
                if channel not in data[lang]:
                    # Create channel entry if it doesn't exist (fallback)
                    data[lang][channel] = {
                        'title': channel.capitalize(),
                        'description': '',
                        'videos': [],
                        'playlists': {}
                    }
                
                # Process State and Date
                state = meta.get('state', 'draft')
                publish_date = meta.get('publish_date')
                
                # Logic: If scheduled and date is passed, mark as published
                if state == 'scheduled' and publish_date:
                    if isinstance(publish_date, str):
                        try:
                            pub_dt = datetime.datetime.strptime(publish_date, '%Y-%m-%d %H:%M:%S')
                        except ValueError:
                            # Try other formats or ignore
                            pub_dt = datetime.datetime.max
                    elif isinstance(publish_date, (datetime.date, datetime.datetime)):
                        pub_dt = publish_date
                        if isinstance(pub_dt, datetime.date) and not isinstance(pub_dt, datetime.datetime):
                             pub_dt = datetime.datetime.combine(pub_dt, datetime.time.min)
                    else:
                        pub_dt = datetime.datetime.max

                    if pub_dt <= datetime.datetime.now():
                        state = 'published'
                
                # Construct Video Object
                video = {
                    'title': meta.get('title', 'Untitled'),
                    'video_id': meta['video_id'],
                    'thumbnail': f"https://img.youtube.com/vi/{meta['video_id']}/hqdefault.jpg", # hqdefault is more reliable than maxres
                    'duration': meta.get('video_duration', '00:00'),
                    'published_at': str(publish_date) if publish_date else 'TBA',
                    'state': state,
                    'release_date': str(publish_date) if publish_date else None,
                    'serie': meta.get('serie', 'na'),
                    'sub_serie': meta.get('sub_serie', 'na'),
                    'playlist_id': meta.get('playlist_id')
                }
                
                # Add to Channel Videos
                data[lang][channel]['videos'].append(video)
                
                # Add to Playlists
                playlist_id = meta.get('playlist_id')
                playlist_title = meta.get('playlist') or meta.get('serie') # Fallback to serie for title if needed

                if playlist_id:
                    # Auto-fetch title if missing
                    if not playlist_title or playlist_title.lower() == 'na':
                        if playlist_id in playlist_cache:
                            playlist_title = playlist_cache[playlist_id]
                        else:
                            print(f"Fetching title for playlist: {playlist_id}")
                            fetched_title = fetch_playlist_title(playlist_id)
                            if fetched_title:
                                playlist_title = fetched_title
                                playlist_cache[playlist_id] = fetched_title
                                cache_updated = True
                    
                    if playlist_id not in data[lang][channel]['playlists']:
                        data[lang][channel]['playlists'][playlist_id] = {
                            'id': playlist_id,
                            'title': playlist_title or 'Untitled Playlist',
                            'videos': []
                        }
                    data[lang][channel]['playlists'][playlist_id]['videos'].append(video)
                    
            except Exception as e:
                print(f"Error processing file {file_path}: {e}")

    # Save cache if updated
    if cache_updated:
        save_cache(playlist_cache)

    # Sort videos by date
    for lang in data:
        for channel in data[lang]:
            # Sort all videos
            data[lang][channel]['videos'].sort(
                key=lambda x: x['published_at'] if x['published_at'] != 'TBA' else '9999-99-99', 
                reverse=True
            )
            # Sort playlists videos
            for playlist_id in data[lang][channel]['playlists']:
                data[lang][channel]['playlists'][playlist_id]['videos'].sort(
                    key=lambda x: x['published_at'] if x['published_at'] != 'TBA' else '9999-99-99'
                )

    # Write to JSON
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Successfully generated {OUTPUT_PATH}")

if __name__ == '__main__':
    scan_vault()
