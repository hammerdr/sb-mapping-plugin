// Location state management for D&D maps

import type { MapState, MapGraph } from './types.ts';

export class LocationManager {
  private static states = new Map<string, MapState>();
  
  static getMapId(pageId: string, blockId?: string): string {
    return blockId ? `${pageId}:${blockId}` : pageId;
  }

  static getState(mapId: string): MapState {
    if (!this.states.has(mapId)) {
      this.states.set(mapId, {
        visitedLocations: [],
        mapId,
        lastUpdated: Date.now()
      });
    }
    return this.states.get(mapId)!;
  }

  static setState(mapId: string, state: Partial<MapState>): void {
    const currentState = this.getState(mapId);
    const newState = {
      ...currentState,
      ...state,
      lastUpdated: Date.now()
    };
    this.states.set(mapId, newState);
    this.saveToStorage(mapId, newState);
  }

  static setCurrentLocation(mapId: string, locationId: string): void {
    const state = this.getState(mapId);
    
    // Add to visited locations if not already there
    if (!state.visitedLocations.includes(locationId)) {
      state.visitedLocations.push(locationId);
    }

    this.setState(mapId, {
      currentLocation: locationId,
      visitedLocations: state.visitedLocations
    });
  }

  static getCurrentLocation(mapId: string): string | undefined {
    return this.getState(mapId).currentLocation;
  }

  static getVisitedLocations(mapId: string): string[] {
    return this.getState(mapId).visitedLocations;
  }

  static isLocationVisited(mapId: string, locationId: string): boolean {
    return this.getState(mapId).visitedLocations.includes(locationId);
  }

  static getConnectedLocations(graph: MapGraph, locationId: string): string[] {
    const connected: string[] = [];
    
    for (const edge of graph.edges) {
      if (edge.from === locationId) {
        connected.push(edge.to);
      } else if (edge.to === locationId && edge.bidirectional) {
        connected.push(edge.from);
      }
    }
    
    return connected;
  }

  static getLocationDetails(graph: MapGraph, locationId: string) {
    const node = graph.nodes.find(n => n.id === locationId);
    if (!node) return null;

    const connected = this.getConnectedLocations(graph, locationId);
    const edges = graph.edges.filter(e => e.from === locationId || e.to === locationId);

    return {
      node,
      connectedLocations: connected,
      edges,
      paths: edges.map(edge => ({
        destination: edge.from === locationId ? edge.to : edge.from,
        label: edge.label,
        type: edge.type,
        distance: edge.distance,
        travelTime: edge.travelTime
      }))
    };
  }

  private static saveToStorage(mapId: string, state: MapState): void {
    try {
      const key = `dndmap-state-${mapId}`;
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save map state to localStorage:', error);
    }
  }

  static loadFromStorage(mapId: string): MapState | null {
    try {
      const key = `dndmap-state-${mapId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const state = JSON.parse(stored);
        this.states.set(mapId, state);
        return state;
      }
    } catch (error) {
      console.warn('Failed to load map state from localStorage:', error);
    }
    return null;
  }

  static clearState(mapId: string): void {
    this.states.delete(mapId);
    try {
      const key = `dndmap-state-${mapId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to clear map state from localStorage:', error);
    }
  }

  static getAllStates(): Map<string, MapState> {
    return new Map(this.states);
  }
}