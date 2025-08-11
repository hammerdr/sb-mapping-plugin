// Type definitions for the D&D mapping plugin

export interface LocationNode {
  id: string;
  label: string;
  type?: 'tavern' | 'dungeon' | 'city' | 'shop' | 'castle' | 'forest' | 'default';
  coordinates?: { x: number; y: number };
  metadata?: {
    description?: string;
    notes?: string;
    visited?: boolean;
    important?: boolean;
  };
}

export interface LocationEdge {
  from: string;
  to: string;
  label?: string;
  type?: 'path' | 'road' | 'secret' | 'teleport' | 'default';
  bidirectional?: boolean;
  distance?: number;
  travelTime?: string;
}

export interface MapGraph {
  nodes: LocationNode[];
  edges: LocationEdge[];
  metadata?: {
    title?: string;
    description?: string;
    scale?: string;
  };
}

export interface MapState {
  currentLocation?: string;
  visitedLocations: string[];
  mapId: string;
  lastUpdated: number;
}

export interface RenderContext {
  element: HTMLElement;
  graph: MapGraph;
  state: MapState;
  onLocationChange?: (locationId: string) => void;
}

export interface ParsedMermaidNode {
  id: string;
  text: string;
  shape: string;
  classes: string[];
}

export interface ParsedMermaidEdge {
  from: string;
  to: string;
  text?: string;
  type: string;
}

export interface ParsedMermaidGraph {
  nodes: ParsedMermaidNode[];
  edges: ParsedMermaidEdge[];
  direction: 'TD' | 'TB' | 'BT' | 'RL' | 'LR';
}