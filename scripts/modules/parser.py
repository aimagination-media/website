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


def update_frontmatter_state(file_path, new_state):
    """
    Updates the 'state' field in the frontmatter of a markdown file.
    Preserves all other content and formatting as much as possible.
    
    Args:
        file_path: Path to the markdown file
        new_state: New value for the 'state' field (e.g., 'published')
    
    Returns:
        True if updated successfully, False otherwise
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if not content.startswith('---'):
            return False
        
        parts = content.split('---', 2)
        if len(parts) < 3:
            return False
        
        # Parse and update the frontmatter
        frontmatter = yaml.safe_load(parts[1])
        if frontmatter is None:
            return False
        
        old_state = frontmatter.get('state')
        if old_state == new_state:
            return False  # No change needed
        
        frontmatter['state'] = new_state
        
        # Rebuild the file content
        new_frontmatter_str = yaml.dump(frontmatter, default_flow_style=False, allow_unicode=True, sort_keys=False)
        new_content = f"---\n{new_frontmatter_str}---{parts[2]}"
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✅ Updated state: {old_state} → {new_state} in {file_path}")
        return True
        
    except Exception as e:
        print(f"Error updating frontmatter in {file_path}: {e}")
        return False
