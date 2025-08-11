// Interactive graph renderer for D&D maps

import type { MapGraph, LocationNode, LocationEdge, RenderContext } from './types.ts';
import { LocationManager } from './location-manager.ts';

export class GraphRenderer {
  private svg: SVGElement;
  private container: HTMLElement;
  private graph: MapGraph;
  private mapId: string;
  private onLocationChange?: (locationId: string) => void;

  constructor(context: RenderContext) {
    this.container = context.element;
    this.graph = context.graph;
    this.mapId = context.state.mapId;
    this.onLocationChange = context.onLocationChange;
    this.svg = this.createSVG();
    this.render();
  }

  private createSVG(): SVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'dndmap-svg');
    svg.setAttribute('viewBox', '0 0 800 600');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '400px');
    
    // Add zoom and pan capabilities
    svg.style.cursor = 'grab';
    
    this.container.appendChild(svg);
    return svg;
  }

  private render(): void {
    this.svg.innerHTML = '';
    
    // Create groups for different elements
    const edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    edgesGroup.setAttribute('class', 'edges');
    
    const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodesGroup.setAttribute('class', 'nodes');
    
    this.svg.appendChild(edgesGroup);
    this.svg.appendChild(nodesGroup);

    // Calculate layout
    const layout = this.calculateLayout();
    
    // Render edges first (so they appear behind nodes)
    this.renderEdges(edgesGroup, layout);
    
    // Render nodes
    this.renderNodes(nodesGroup, layout);
  }

  private calculateLayout(): Map<string, { x: number; y: number }> {
    const layout = new Map<string, { x: number; y: number }>();
    const nodes = this.graph.nodes;
    
    if (nodes.length === 0) return layout;
    
    // Use Fruchterman-Reingold force-directed algorithm
    return this.fruchtermanReingoldLayout();
  }



  private fruchtermanReingoldLayout(): Map<string, { x: number; y: number }> {
    const layout = new Map<string, { x: number; y: number }>();
    const nodes = this.graph.nodes;
    const edges = this.graph.edges;
    
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
    this.resolveOverlaps(layout, k * 0.8);
    
    return layout;
  }

  private resolveOverlaps(layout: Map<string, { x: number; y: number }>, minDistance: number): void {
    const nodes = Array.from(layout.keys());
    const maxIterations = 10;
    
    for (let iter = 0; iter < maxIterations; iter++) {
      let hasOverlap = false;
      
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const pos1 = layout.get(nodes[i])!;
          const pos2 = layout.get(nodes[j])!;
          
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


    });
  }

  private getRoundRobinPosition(
    index: number,
    totalNodes: number,
    layer: number,
    gridSize: number,
    centerX: number,
    centerY: number
  ): { x: number; y: number } {
    const distance = layer * gridSize;
    
    // Round-robin pattern: N, S, NE, SW, NW, SE, E, W
    const directions = [
      { x: 0, y: -1 },       // N (North)
      { x: 0, y: 1 },        // S (South)
      { x: 0.707, y: -0.707 }, // NE (Northeast)
      { x: -0.707, y: 0.707 }, // SW (Southwest)
      { x: -0.707, y: -0.707 }, // NW (Northwest)
      { x: 0.707, y: 0.707 },  // SE (Southeast)
      { x: 1, y: 0 },        // E (East)
      { x: -1, y: 0 }        // W (West)
    ];
    
    // Use round-robin to assign positions, ensuring no duplicates
    const direction = directions[index % directions.length];
    
            // Base distance for this layer
            let adjustedDistance = distance;
            
            // If we have more nodes than directions, place them in concentric rings
            if (index >= directions.length) {
              const ringNumber = Math.floor(index / directions.length);
              adjustedDistance = distance + (ringNumber * gridSize * 0.5); // Smaller increments for additional rings
            }
    
    return {
      x: centerX + direction.x * adjustedDistance,
      y: centerY + direction.y * adjustedDistance
    };
  }

  private findBestPositionNearConnected(
    nodeId: string, 
    layout: Map<string, { x: number; y: number }>
  ): { x: number; y: number } | null {
    const connectedNodes = this.graph.edges
      .filter(edge => edge.from === nodeId || edge.to === nodeId)
      .map(edge => edge.from === nodeId ? edge.to : edge.from)
      .filter(id => layout.has(id));
    
    if (connectedNodes.length === 0) return null;
    
    // Find the best connected node to place near (prefer the first one placed)
    const referenceNode = connectedNodes[0];
    const refPos = layout.get(referenceNode)!;
    
    // Use round-robin pattern around the reference node: N, S, NE, SW, NW, SE, E, W
    const gridSize = 90;
    const directions = [
      { x: 0, y: -1 },       // N (North)
      { x: 0, y: 1 },        // S (South)
      { x: 0.707, y: -0.707 }, // NE (Northeast)
      { x: -0.707, y: 0.707 }, // SW (Southwest)
      { x: -0.707, y: -0.707 }, // NW (Northwest)
      { x: 0.707, y: 0.707 },  // SE (Southeast)
      { x: 1, y: 0 },        // E (East)
      { x: -1, y: 0 }        // W (West)
    ];
    
    // Find the best available position around the reference node
    for (const direction of directions) {
      const candidate = {
        x: refPos.x + direction.x * gridSize,
        y: refPos.y + direction.y * gridSize
      };
      
      // Check if this position has minimal overlap
      const overlapScore = this.calculateOverlapScore(candidate, layout);
      if (overlapScore < 100) { // Acceptable overlap threshold
        return this.adjustForOverlaps(candidate, layout, 70);
      }
    }
    
    // If no good position found, try with larger distance
    for (const direction of directions) {
      const candidate = {
        x: refPos.x + direction.x * gridSize * 1.5,
        y: refPos.y + direction.y * gridSize * 1.5
      };
      
      const overlapScore = this.calculateOverlapScore(candidate, layout);
      if (overlapScore < 200) {
        return this.adjustForOverlaps(candidate, layout, 70);
      }
    }
    
    return null; // Let the fallback positioning handle it
  }

  private calculateOverlapScore(pos: { x: number; y: number }, layout: Map<string, { x: number; y: number }>): number {
    let score = 0;
    const minDistance = 60;
    
    for (const existingPos of layout.values()) {
      const dx = pos.x - existingPos.x;
      const dy = pos.y - existingPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance) {
        score += (minDistance - distance) * (minDistance - distance);
      }
    }
    
    return score;
  }

  private adjustForOverlaps(
    pos: { x: number; y: number }, 
    layout: Map<string, { x: number; y: number }>,
    minDistance: number
  ): { x: number; y: number } {
    let adjusted = { ...pos };
    let attempts = 0;
    const maxAttempts = 20;
    
    while (attempts < maxAttempts) {
      let hasOverlap = false;
      
      for (const existingPos of layout.values()) {
        const dx = adjusted.x - existingPos.x;
        const dy = adjusted.y - existingPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < minDistance) {
          // Push away from overlap
          const pushDistance = minDistance - distance + 10;
          const angle = Math.atan2(dy, dx);
          adjusted.x += Math.cos(angle) * pushDistance;
          adjusted.y += Math.sin(angle) * pushDistance;
          hasOverlap = true;
        }
      }
      
      if (!hasOverlap) break;
      attempts++;
    }
    
    // Keep within bounds
    adjusted.x = Math.max(50, Math.min(750, adjusted.x));
    adjusted.y = Math.max(50, Math.min(550, adjusted.y));
    
    return adjusted;
  }

  private placeUnconnectedNodes(
    nodes: LocationNode[], 
    layout: Map<string, { x: number; y: number }>,
    gridSize: number,
    centerX: number,
    centerY: number
  ): void {
    // Place unconnected nodes in a separate area
    const startX = centerX + 300;
    const startY = centerY - (nodes.length * gridSize) / 2;
    
    nodes.forEach((node, index) => {
      const pos = {
        x: startX,
        y: startY + index * gridSize
      };
      
      const finalPos = this.adjustForOverlaps(pos, layout, gridSize * 0.8);
      layout.set(node.id, finalPos);
    });
  }

  private renderEdges(group: SVGElement, layout: Map<string, { x: number; y: number }>): void {
    this.graph.edges.forEach(edge => {
      const pos1 = layout.get(edge.from);
      const pos2 = layout.get(edge.to);
      
      if (!pos1 || !pos2) return;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', pos1.x.toString());
      line.setAttribute('y1', pos1.y.toString());
      line.setAttribute('x2', pos2.x.toString());
      line.setAttribute('y2', pos2.y.toString());
      line.setAttribute('class', `edge edge-${edge.type || 'default'}`);
      
      if (edge.bidirectional) {
        line.classList.add('bidirectional');
      }
      
      group.appendChild(line);

      // Add edge label if present
      if (edge.label) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', ((pos1.x + pos2.x) / 2).toString());
        text.setAttribute('y', ((pos1.y + pos2.y) / 2).toString());
        text.setAttribute('class', 'edge-label');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.textContent = edge.label;
        group.appendChild(text);
      }
    });
  }

  private renderNodes(group: SVGElement, layout: Map<string, { x: number; y: number }>): void {
    const currentLocation = LocationManager.getCurrentLocation(this.mapId);
    const visitedLocations = LocationManager.getVisitedLocations(this.mapId);

    this.graph.nodes.forEach(node => {
      const pos = layout.get(node.id);
      if (!pos) return;

      const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      nodeGroup.setAttribute('class', 'node-group');
      nodeGroup.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);

      // Create node shape based on type
      const shape = this.createNodeShape(node);
      nodeGroup.appendChild(shape);

      // Add node label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('class', 'node-label');
      text.textContent = node.label;
      nodeGroup.appendChild(text);

      // Apply state-based classes
      if (node.id === currentLocation) {
        nodeGroup.classList.add('current-location');
      }
      
      if (visitedLocations.includes(node.id)) {
        nodeGroup.classList.add('visited');
      }
      
      if (node.metadata?.important) {
        nodeGroup.classList.add('important');
      }

      // Add click handler
      nodeGroup.style.cursor = 'pointer';
      nodeGroup.addEventListener('click', () => {
        this.handleNodeClick(node.id);
      });

      // Add hover effects
      nodeGroup.addEventListener('mouseenter', () => {
        nodeGroup.classList.add('hover');
      });
      
      nodeGroup.addEventListener('mouseleave', () => {
        nodeGroup.classList.remove('hover');
      });

      group.appendChild(nodeGroup);
    });
  }

  private createNodeShape(node: LocationNode): SVGElement {
    const type = node.type || 'default';
    
    switch (type) {
      case 'tavern':
        return this.createRectNode(30, 20, 'node-tavern');
      case 'dungeon':
        return this.createDiamondNode(25, 'node-dungeon');
      case 'city':
        return this.createCircleNode(25, 'node-city');
      case 'castle':
        return this.createRectNode(35, 25, 'node-castle');
      case 'forest':
        return this.createCircleNode(20, 'node-forest');
      case 'shop':
        return this.createRectNode(25, 15, 'node-shop');
      default:
        return this.createCircleNode(20, 'node-default');
    }
  }

  private createCircleNode(radius: number, className: string): SVGElement {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', radius.toString());
    circle.setAttribute('class', `node-shape ${className}`);
    return circle;
  }

  private createRectNode(width: number, height: number, className: string): SVGElement {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', (-width / 2).toString());
    rect.setAttribute('y', (-height / 2).toString());
    rect.setAttribute('width', width.toString());
    rect.setAttribute('height', height.toString());
    rect.setAttribute('class', `node-shape ${className}`);
    return rect;
  }

  private createDiamondNode(size: number, className: string): SVGElement {
    const diamond = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const points = [
      `0,-${size}`,
      `${size},0`,
      `0,${size}`,
      `-${size},0`
    ].join(' ');
    diamond.setAttribute('points', points);
    diamond.setAttribute('class', `node-shape ${className}`);
    return diamond;
  }

  private handleNodeClick(nodeId: string): void {
    LocationManager.setCurrentLocation(this.mapId, nodeId);
    this.updateNodeStates();
    
    if (this.onLocationChange) {
      this.onLocationChange(nodeId);
    }
  }

  private updateNodeStates(): void {
    const currentLocation = LocationManager.getCurrentLocation(this.mapId);
    const visitedLocations = LocationManager.getVisitedLocations(this.mapId);

    // Update node classes
    this.svg.querySelectorAll('.node-group').forEach(nodeGroup => {
      const transform = nodeGroup.getAttribute('transform');
      const nodeId = this.getNodeIdFromGroup(nodeGroup as SVGElement);
      
      if (nodeId) {
        nodeGroup.classList.remove('current-location', 'visited');
        
        if (nodeId === currentLocation) {
          nodeGroup.classList.add('current-location');
        }
        
        if (visitedLocations.includes(nodeId)) {
          nodeGroup.classList.add('visited');
        }
      }
    });
  }

  private getNodeIdFromGroup(group: SVGElement): string | null {
    // Find the node ID by matching position with layout
    // This is a simplified approach - in a real implementation,
    // you'd want to store the node ID as a data attribute
    const transform = group.getAttribute('transform');
    if (!transform) return null;
    
    const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
    if (!match) return null;
    
    const x = parseFloat(match[1]);
    const y = parseFloat(match[2]);
    
    // Find the node with matching position
    for (const node of this.graph.nodes) {
      // This would need the layout map to be accessible
      // For now, return the first node as a fallback
      return node.id;
    }
    
    return null;
  }

  public refresh(): void {
    this.render();
  }

  public destroy(): void {
    if (this.svg && this.svg.parentNode) {
      this.svg.parentNode.removeChild(this.svg);
    }
  }
}