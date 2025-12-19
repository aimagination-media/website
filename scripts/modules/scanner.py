import os
import json
import datetime
from .config import VAULT_PATH, OUTPUT_PATH, CHANNEL_INFO, CHANNEL_NAME_MAPPING
from .utils import load_cache, save_cache
from .youtube import fetch_playlist_title
from .parser import parse_frontmatter, update_frontmatter_state

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
                'color': CHANNEL_INFO[channel]['color'],
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
                    
                # Determine Channel Display Name
                # Priority: frontmatter channel_public_name > CHANNEL_NAME_MAPPING > CHANNEL_INFO > fallback
                channel_key = meta['channel'].lower()
                channel_display_name = (
                    meta.get('channel_public_name') or 
                    CHANNEL_NAME_MAPPING.get(channel_key, {}).get(lang) or
                    CHANNEL_INFO.get(channel_key, {}).get(lang, {}).get('title') or 
                    channel_key.capitalize()
                )

                if channel_key not in data[lang]:
                    # Create channel entry if it doesn't exist
                    # Try to get info from CHANNEL_INFO, fallback to defaults
                    info = CHANNEL_INFO.get(channel_key, {})
                    lang_info = info.get(lang, {})
                    
                    data[lang][channel_key] = {
                        'title': channel_display_name,
                        'description': lang_info.get('description', ''),
                        'color': info.get('color', '#71717a'), # Default Zinc
                        'videos': [],
                        'playlists': {}
                    }
                else:
                    # Update title if public name is present (priority)
                    if meta.get('channel_public_name'):
                        data[lang][channel_key]['title'] = meta['channel_public_name']
                
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
                        # Auto-update the Obsidian file to reflect the state change
                        update_frontmatter_state(file_path, 'published')
                
                # Logic: If produced and has a real video_id, mark as published
                # (produced means video is ready/uploaded, so it should be shown)
                if state == 'produced' and meta.get('video_id') and meta.get('video_id').lower() != 'na':
                    state = 'published'
                    # Auto-update the Obsidian file to reflect the state change
                    update_frontmatter_state(file_path, 'published')
                
                # Logic: If scheduled but no publish_date, and has a valid video_id, mark as published
                # (video is uploaded and ready, but date wasn't set)
                if state == 'scheduled' and not publish_date and meta.get('video_id') and meta.get('video_id').lower() != 'na':
                    state = 'published'
                    # Auto-update the Obsidian file to reflect the state change
                    update_frontmatter_state(file_path, 'published')
                
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
                    'playlist_id': meta.get('playlist_id'),
                    'video_type': meta.get('video_type', 'unknown')
                }
                
                # Add to Channel Videos
                data[lang][channel_key]['videos'].append(video)
                
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
                    
                    if playlist_id not in data[lang][channel_key]['playlists']:
                        data[lang][channel_key]['playlists'][playlist_id] = {
                            'id': playlist_id,
                            'title': playlist_title or 'Untitled Playlist',
                            'videos': []
                        }
                    data[lang][channel_key]['playlists'][playlist_id]['videos'].append(video)
                    
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
