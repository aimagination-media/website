# Configuration
VAULT_PATH = '/mnt/ssd4k/Obsidian/Youtube/md_vault'
OUTPUT_PATH = 'assets/data/content.json'
CACHE_PATH = 'assets/data/playlist_cache.json'

# Mappings for UI display
CHANNEL_INFO = {
    'math': {
        'color': '#3b82f6', # Blue
        'en': {'title': 'Mathematics', 'description': 'Master math concepts from basics to advanced topics'},
        'es': {'title': 'Matemáticas', 'description': 'Domina conceptos matemáticos desde lo básico hasta temas avanzados'},
        'de': {'title': 'Mathematik', 'description': 'Meistere mathematische Konzepte von den Grundlagen bis zu fortgeschrittenen Themen'}
    },
    'chemistry': {
        'color': '#10b981', # Emerald
        'en': {'title': 'Chemistry', 'description': 'Explore the fascinating world of chemical reactions'},
        'es': {'title': 'Química', 'description': 'Explora el fascinante mundo de las reacciones químicas'},
        'de': {'title': 'Chemie', 'description': 'Entdecke die faszinierende Welt der chemischen Reaktionen'}
    },
    'audiobook': {
        'color': '#f59e0b', # Amber
        'en': {'title': 'Audiobooks', 'description': 'Listen to engaging stories and educational content'},
        'es': {'title': 'Audiolibros', 'description': 'Escucha historias cautivadoras y contenido educativo'},
        'de': {'title': 'Hörbücher', 'description': 'Höre fesselnde Geschichten und Bildungsinhalte'}
    },
    'gallery': {
        'color': '#ec4899', # Pink
        'en': {'title': 'AI Vivid Dreams', 'description': 'Journey into the boundless imagination of AI art'},
        'es': {'title': 'Sueños Vívidos de IA', 'description': 'Viaje a la imaginación ilimitada del arte de la IA'},
        'de': {'title': 'KI Lebendige Träume', 'description': 'Reise in die grenzenlose Fantasie der KI-Kunst'}
    }
}

# Optional: Override channel names per language (takes precedence over CHANNEL_INFO titles)
CHANNEL_NAME_MAPPING = {
    # Example: Uncomment and customize as needed
    # 'audiobook': {
    #     'en': 'Imagination Station',
    #     'es': 'Estación de Imaginación',
    #     'de': 'Fantasiestation'
    # },
}
