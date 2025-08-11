// Mermaid syntax parser for D&D maps

import type { ParsedMermaidGraph, ParsedMermaidNode, ParsedMermaidEdge, MapGraph, LocationNode, LocationEdge } from './types.ts';

export class MermaidParser {
  
  static parse(mermaidCode: string): ParsedMermaidGraph {
    const lines = mermaidCode.trim().split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('%%'));
    
    const result: ParsedMermaidGraph = {
      nodes: [],
      edges: [],
      direction: 'TD'
    };

    for (const line of lines) {
      if (line.startsWith('graph ') || line.startsWith('flowchart ')) {
        const direction = line.split(' ')[1] as 'TD' | 'TB' | 'BT' | 'RL' | 'LR';
        if (direction) {
          result.direction = direction;
        }
        continue;
      }

      // Parse edges (connections between nodes)
      const edgeMatch = line.match(/(\w+)(\[.*?\])?(\s*-->?\s*|\s*---?\s*)(\w+)(\[.*?\])?(\s*:\s*(.+))?/);
      if (edgeMatch) {
        const [, fromId, fromLabel, connector, toId, toLabel, , edgeLabel] = edgeMatch;
        
        // Add nodes if they don't exist
        this.addNodeIfNotExists(result.nodes, fromId, fromLabel);
        this.addNodeIfNotExists(result.nodes, toId, toLabel);
        
        // Add edge
        result.edges.push({
          from: fromId,
          to: toId,
          text: edgeLabel?.trim(),
          type: connector.includes('-->') ? 'arrow' : 'line'
        });
        continue;
      }

      // Parse standalone nodes
      const nodeMatch = line.match(/(\w+)(\[.*?\])?(\s*:::(\w+))?/);
      if (nodeMatch) {
        const [, nodeId, nodeLabel, , nodeClass] = nodeMatch;
        this.addNodeIfNotExists(result.nodes, nodeId, nodeLabel, nodeClass ? [nodeClass] : []);
      }
    }

    return result;
  }

  private static addNodeIfNotExists(
    nodes: ParsedMermaidNode[], 
    id: string, 
    labelMatch?: string, 
    classes: string[] = []
  ): void {
    if (nodes.find(n => n.id === id)) return;

    let text = id;
    let shape = 'rect';

    if (labelMatch) {
      // Extract text and shape from label like [Text] or (Text) or {Text}
      const labelContent = labelMatch.match(/[\[\(\{](.*)[\]\)\}]/);
      if (labelContent) {
        text = labelContent[1];
        
        // Determine shape based on brackets
        if (labelMatch.startsWith('[') && labelMatch.endsWith(']')) {
          shape = 'rect';
        } else if (labelMatch.startsWith('(') && labelMatch.endsWith(')')) {
          shape = 'round';
        } else if (labelMatch.startsWith('{') && labelMatch.endsWith('}')) {
          shape = 'diamond';
        }
      }
    }

    nodes.push({
      id,
      text,
      shape,
      classes
    });
  }

  static convertToMapGraph(parsed: ParsedMermaidGraph): MapGraph {
    const nodes: LocationNode[] = parsed.nodes.map(node => ({
      id: node.id,
      label: node.text,
      type: this.getLocationTypeFromClasses(node.classes),
      metadata: {
        important: node.classes.includes('important'),
        visited: node.classes.includes('visited')
      }
    }));

    const edges: LocationEdge[] = parsed.edges.map(edge => ({
      from: edge.from,
      to: edge.to,
      label: edge.text,
      type: 'default',
      bidirectional: edge.type === 'line' // Only lines (---) are bidirectional, arrows (-->) are directional
    }));

    return { nodes, edges };
  }

  private static getLocationTypeFromClasses(classes: string[]): LocationNode['type'] {
    const typeMap: Record<string, LocationNode['type']> = {
      'tavern': 'tavern',
      'dungeon': 'dungeon',
      'city': 'city',
      'shop': 'shop',
      'castle': 'castle',
      'forest': 'forest'
    };

    for (const cls of classes) {
      if (typeMap[cls]) {
        return typeMap[cls];
      }
    }

    return 'default';
  }
}