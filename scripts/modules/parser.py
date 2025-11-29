import yaml

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
