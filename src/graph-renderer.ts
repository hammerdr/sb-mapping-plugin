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
    
    // Simple force-directed layout algorithm
    // Initialize positions
    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI;
      const radius = Math.min(300, 50 + nodes.length * 20);
      layout.set(node.id, {
        x: 400 + Math.cos(angle) * radius,
        y: 300 + Math.sin(angle) * radius
      });
    });

    // Apply force-directed positioning (simplified)
    for (let iteration = 0; iteration < 50; iteration++) {
      const forces = new Map<string, { x: number; y: number }>();
      
      // Initialize forces
      nodes.forEach(node => {
        forces.set(node.id, { x: 0, y: 0 });
      });

      // Repulsion between nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const node1 = nodes[i];
          const node2 = nodes[j];
          const pos1 = layout.get(node1.id)!;
          const pos2 = layout.get(node2.id)!;
          
          const dx = pos1.x - pos2.x;
          const dy = pos1.y - pos2.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          
          const repulsion = 1000 / (distance * distance);
          const fx = (dx / distance) * repulsion;
          const fy = (dy / distance) * repulsion;
          
          const force1 = forces.get(node1.id)!;
          const force2 = forces.get(node2.id)!;
          
          force1.x += fx;
          force1.y += fy;
          force2.x -= fx;
          force2.y -= fy;
        }
      }

      // Attraction along edges
      this.graph.edges.forEach(edge => {
        const pos1 = layout.get(edge.from)!;
        const pos2 = layout.get(edge.to)!;
        
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        
        const attraction = distance * 0.01;
        const fx = (dx / distance) * attraction;
        const fy = (dy / distance) * attraction;
        
        const force1 = forces.get(edge.from)!;
        const force2 = forces.get(edge.to)!;
        
        force1.x += fx;
        force1.y += fy;
        force2.x -= fx;
        force2.y -= fy;
      });

      // Apply forces
      nodes.forEach(node => {
        const pos = layout.get(node.id)!;
        const force = forces.get(node.id)!;
        
        pos.x += force.x * 0.1;
        pos.y += force.y * 0.1;
        
        // Keep within bounds
        pos.x = Math.max(50, Math.min(750, pos.x));
        pos.y = Math.max(50, Math.min(550, pos.y));
      });
    }

    return layout;
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