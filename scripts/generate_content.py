import os
import yaml
import json
import datetime
import re

# Configuration
VAULT_PATH = '/mnt/ssd4k/Obsidian/Youtube/md_vault'
OUTPUT_PATH = 'assets/data/content.json'

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
                    'thumbnail': f"https://img.youtube.com/vi/{meta['video_id']}/maxresdefault.jpg", # Default YT thumb
                    'duration': meta.get('video_duration', '00:00'),
                    'published_at': str(publish_date) if publish_date else 'TBA',
                    'state': state,
                    'release_date': str(publish_date) if publish_date else None,
                    'serie': meta.get('serie', 'na'),
                    'sub_serie': meta.get('sub_serie', 'na')
                }
                
                # Add to Channel Videos
                data[lang][channel]['videos'].append(video)
                
                # Add to Playlists (Series)
                serie = meta.get('serie')
                if serie and serie.lower() != 'na':
                    if serie not in data[lang][channel]['playlists']:
                        data[lang][channel]['playlists'][serie] = []
                    data[lang][channel]['playlists'][serie].append(video)
                    
            except Exception as e:
                print(f"Error processing file {file_path}: {e}")

    # Sort videos by date
    for lang in data:
        for channel in data[lang]:
            # Sort all videos
            data[lang][channel]['videos'].sort(
                key=lambda x: x['published_at'] if x['published_at'] != 'TBA' else '9999-99-99', 
                reverse=True
            )
            # Sort playlists
            for playlist in data[lang][channel]['playlists']:
                data[lang][channel]['playlists'][playlist].sort(
                    key=lambda x: x['published_at'] if x['published_at'] != 'TBA' else '9999-99-99'
                )

    # Write to JSON
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Successfully generated {OUTPUT_PATH}")

if __name__ == '__main__':
    scan_vault()
