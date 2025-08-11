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

  // Fruchterman-Reingold force-directed layout
  const nodePositions = fruchtermanReingoldLayout(nodes, edges);

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

function fruchtermanReingoldLayout(nodes: Array<{id: string, label: string, type?: string}>, edges: Array<{from: string, to: string, label?: string}>): Map<string, {x: number, y: number}> {
  const layout = new Map<string, { x: number; y: number }>();
  
  // Layout parameters - adjusted for tighter, more readable layouts
  const width = 800;
  const height = 600;
  const area = width * height;
  const k = Math.sqrt(area / nodes.length) * 0.6; // Reduced optimal distance for tighter layout
  const iterations = 100; // More iterations for better convergence
  
  // Initialize positions randomly in a smaller central area for better convergence
  const initWidth = width * 0.6;
  const initHeight = height * 0.6;
  const offsetX = (width - initWidth) / 2;
  const offsetY = (height - initHeight) / 2;
  
  nodes.forEach(node => {
    layout.set(node.id, {
      x: offsetX + Math.random() * initWidth,
      y: offsetY + Math.random() * initHeight
    });
  });
  
  // Temperature schedule - starts hot and cools down more gradually
  let temperature = k * 2; // Start with temperature proportional to k
  const cooling = 0.98; // Slower cooling for better convergence
  
  for (let iter = 0; iter < iterations; iter++) {
    // Calculate repulsive forces between all pairs of nodes
    const forces = new Map<string, { x: number; y: number }>();
    nodes.forEach(node => forces.set(node.id, { x: 0, y: 0 }));
    
    // Repulsive forces (all nodes repel each other)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        const pos1 = layout.get(node1.id)!;
        const pos2 = layout.get(node2.id)!;
        
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 0.01; // Avoid division by zero
        
        // Fruchterman-Reingold repulsive force: fr(d) = k²/d
        // Add minimum distance to prevent excessive repulsion at close range
        const effectiveDistance = Math.max(distance, k * 0.1);
        const repulsiveForce = (k * k) / effectiveDistance;
        const fx = (dx / distance) * repulsiveForce;
        const fy = (dy / distance) * repulsiveForce;
        
        const force1 = forces.get(node1.id)!;
        const force2 = forces.get(node2.id)!;
        
        force1.x += fx;
        force1.y += fy;
        force2.x -= fx;
        force2.y -= fy;
      }
    }
    
    // Attractive forces (connected nodes attract each other)
    edges.forEach(edge => {
      const pos1 = layout.get(edge.from)!;
      const pos2 = layout.get(edge.to)!;
      
      const dx = pos2.x - pos1.x;
      const dy = pos2.y - pos1.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 0.01;
      
      // Fruchterman-Reingold attractive force: fa(d) = d²/k
      // Cap the attractive force to prevent nodes from getting too close
      const maxAttractiveDistance = k * 3;
      const cappedDistance = Math.min(distance, maxAttractiveDistance);
      const attractiveForce = (cappedDistance * cappedDistance) / k;
      const fx = (dx / distance) * attractiveForce;
      const fy = (dy / distance) * attractiveForce;
      
      const force1 = forces.get(edge.from)!;
      const force2 = forces.get(edge.to)!;
      
      // Apply attractive force (nodes pull toward each other)
      force1.x += fx;
      force1.y += fy;
      force2.x -= fx;
      force2.y -= fy;
    });
    
    // Apply forces with temperature-based displacement
    nodes.forEach(node => {
      const pos = layout.get(node.id)!;
      const force = forces.get(node.id)!;
      
      const displacement = Math.sqrt(force.x * force.x + force.y * force.y) || 0.01;
      const limitedDisplacement = Math.min(displacement, temperature);
      
      pos.x += (force.x / displacement) * limitedDisplacement;
      pos.y += (force.y / displacement) * limitedDisplacement;
      
      // Keep nodes within bounds
      pos.x = Math.max(50, Math.min(width - 50, pos.x));
      pos.y = Math.max(50, Math.min(height - 50, pos.y));
    });
    
    // Cool down temperature
    temperature *= cooling;
  }
  
  // Post-processing: resolve any remaining overlaps
  resolveOverlaps(layout, nodes, k * 0.8);
  
  return layout;
}

function resolveOverlaps(layout: Map<string, { x: number; y: number }>, nodes: Array<{id: string}>, minDistance: number): void {
  const nodeIds = nodes.map(n => n.id);
  const maxIterations = 10;
  
  for (let iter = 0; iter < maxIterations; iter++) {
    let hasOverlap = false;
    
    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        const pos1 = layout.get(nodeIds[i])!;
        const pos2 = layout.get(nodeIds[j])!;
        
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < minDistance) {
          hasOverlap = true;
          
          // Calculate separation needed
          const separation = (minDistance - distance) / 2 + 1;
          const angle = Math.atan2(dy, dx);
          
          // Move nodes apart
          pos1.x += Math.cos(angle) * separation;
          pos1.y += Math.sin(angle) * separation;
          pos2.x -= Math.cos(angle) * separation;
          pos2.y -= Math.sin(angle) * separation;
          
          // Keep within bounds
          pos1.x = Math.max(50, Math.min(750, pos1.x));
          pos1.y = Math.max(50, Math.min(550, pos1.y));
          pos2.x = Math.max(50, Math.min(750, pos2.x));
          pos2.y = Math.max(50, Math.min(550, pos2.y));
        }
      }
    }
    
    if (!hasOverlap) break;
  }
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
