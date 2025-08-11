export async function widget(bodyText: string): Promise<{ html: string; script?: string }> {
  // Parse the D&D map from the provided text

  // Parse the Mermaid-style syntax
  const lines = bodyText.trim().split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('%%'));

  const nodes: Array<{id: string, label: string, type?: string}> = [];
  const edges: Array<{from: string, to: string, label?: string}> = [];

  for (const line of lines) {
    if (line.startsWith('graph ') || line.startsWith('flowchart ')) continue;

    // Parse edges
    const edgeMatch = line.match(/(\w+)(\[.*?\])?(\s*:::(\w+))?(\s*-->?\s*|\s*---?\s*)(\w+)(\[.*?\])?(\s*:::(\w+))?(\s*:\s*(.+))?/);
    if (edgeMatch) {
      const [, fromId, fromLabel, , fromClass, connector, toId, toLabel, , toClass, , edgeLabel] = edgeMatch;

      // Add nodes if not exists
      if (!nodes.find(n => n.id === fromId)) {
        const label = fromLabel ? fromLabel.match(/[\[\(\{](.*)[\]\)\}]/)?.[1] || fromId : fromId;
        nodes.push({id: fromId, label, type: fromClass});
      }
      if (!nodes.find(n => n.id === toId)) {
        const label = toLabel ? toLabel.match(/[\[\(\{](.*)[\]\)\}]/)?.[1] || toId : toId;
        nodes.push({id: toId, label, type: toClass});
      }

      edges.push({from: fromId, to: toId, label: edgeLabel?.trim()});
    }
  }

  // Simple circular layout
  const centerX = 400, centerY = 300, radius = 150;
  const nodePositions = new Map();
  nodes.forEach((node, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI;
    nodePositions.set(node.id, {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    });
  });

  // Generate SVG with dark mode styling
  let svg = `<svg viewBox="0 0 800 600" style="width: 100%; height: 400px; border: 1px solid #444; background: #1a1a1a;">`;

  // Render edges
  edges.forEach(edge => {
    const pos1 = nodePositions.get(edge.from);
    const pos2 = nodePositions.get(edge.to);
    if (pos1 && pos2) {
      svg += `<line x1="${pos1.x}" y1="${pos1.y}" x2="${pos2.x}" y2="${pos2.y}" stroke="#888" stroke-width="2"/>`;
      if (edge.label) {
        const midX = (pos1.x + pos2.x) / 2;
        const midY = (pos1.y + pos2.y) / 2;
        // Add semi-transparent background for edge labels (dark mode)
        svg += `<rect x="${midX - edge.label.length * 3}" y="${midY - 7}" width="${edge.label.length * 6}" height="14" fill="rgba(26,26,26,0.9)" stroke="rgba(136,136,136,0.3)" stroke-width="1" rx="2" style="pointer-events: none;"/>`;
        svg += `<text x="${midX}" y="${midY}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#ccc" font-weight="500" style="pointer-events: none;">${edge.label}</text>`;
      }
    }
  });

  // Render nodes
  nodes.forEach((node, index) => {
    const pos = nodePositions.get(node.id);
    if (pos) {
      const color = getNodeColor(node.type);
      const nodeId = `node-${index}`;
      svg += `<circle id="${nodeId}" cx="${pos.x}" cy="${pos.y}" r="25" fill="${color}" stroke="#666" stroke-width="2" style="cursor: pointer;" data-location-id="${node.id}"/>`;
      
      // Add semi-transparent background for text readability (dark mode)
      svg += `<rect x="${pos.x - node.label.length * 4}" y="${pos.y - 8}" width="${node.label.length * 8}" height="16" fill="rgba(26,26,26,0.8)" stroke="rgba(136,136,136,0.3)" stroke-width="1" rx="3" style="pointer-events: none;"/>`;
      svg += `<text x="${pos.x}" y="${pos.y}" text-anchor="middle" dominant-baseline="middle" font-size="14" fill="#eee" font-weight="bold" style="pointer-events: none;">${node.label}</text>`;
    }
  });

  svg += `</svg>`;

  return {
    html: `
      <div style="border: 1px solid #444; border-radius: 8px; padding: 15px; margin: 10px 0; background: #2a2a2a;">
        <h3 style="margin: 0 0 15px 0; color: #eee;">🗺️ D&D Interactive Map</h3>
        ${svg}
        <div id="location-info" style="margin-top: 15px; padding: 10px; background: #333; border-radius: 4px; color: #ccc; font-family: system-ui, -apple-system, sans-serif; border: 1px solid #555;">
          <strong style="color: #eee;">Current Location:</strong> <span id="current-location" style="color: #aaa; font-weight: 500;">Click a location above</span>
        </div>
      </div>
    `,
    script: `
      (function() {
        let currentLocation = null;

        function setCurrentLocation(locationId) {
          currentLocation = locationId;
          const locationSpan = document.getElementById('current-location');
          if (locationSpan) {
            locationSpan.textContent = locationId;
            locationSpan.style.color = '#ff6b6b';
            locationSpan.style.fontWeight = 'bold';
          }

          // Update visual highlighting
          const circles = document.querySelectorAll('circle[data-location-id]');
          circles.forEach(circle => {
            if (circle.getAttribute('data-location-id') === locationId) {
              circle.setAttribute('stroke', '#ff6b6b');
              circle.setAttribute('stroke-width', '4');
            } else {
              circle.setAttribute('stroke', '#666');
              circle.setAttribute('stroke-width', '2');
            }
          });
        }

        // Make setCurrentLocation globally accessible
        window.setCurrentLocation = setCurrentLocation;

        // Setup click handlers with a delay to ensure DOM is ready
        setTimeout(function() {
          const circles = document.querySelectorAll('circle[data-location-id]');
          console.log('Found circles:', circles.length); // Debug log
          circles.forEach(circle => {
            circle.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              const locationId = this.getAttribute('data-location-id');
              console.log('Clicked location:', locationId); // Debug log
              setCurrentLocation(locationId);
            });
            // Add visual feedback for hover
            circle.addEventListener('mouseenter', function() {
              this.style.opacity = '0.8';
            });
            circle.addEventListener('mouseleave', function() {
              this.style.opacity = '1';
            });
          });
        }, 100);

        // D&D Map widget initialized
      })();
    `
  };
}

function getNodeColor(type?: string): string {
  const colors: Record<string, string> = {
    'tavern': '#ffeb3b',
    'dungeon': '#d32f2f',
    'city': '#2196f3',
    'castle': '#9c27b0',
    'forest': '#4caf50',
    'shop': '#ff9800',
    'important': '#f44336'
  };
  return colors[type || ''] || '#666';
}
