import urllib.request
import urllib.error
import json

def fetch_playlist_title(playlist_id):
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/playlist?list={playlist_id}&format=json"
    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            return data.get('title')
    except Exception as e:
        print(f"Failed to fetch title for playlist {playlist_id}: {e}")
        return None
