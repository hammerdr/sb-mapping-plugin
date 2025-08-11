// Location details panel component

import type { MapGraph, LocationNode } from '../types.ts';
import { LocationManager } from '../location-manager.ts';

export class LocationPanel {
  private container: HTMLElement;
  private graph: MapGraph;
  private mapId: string;

  constructor(container: HTMLElement, graph: MapGraph, mapId: string) {
    this.container = container;
    this.graph = graph;
    this.mapId = mapId;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = '';
    this.container.className = 'dnd-location-panel';

    const currentLocationId = LocationManager.getCurrentLocation(this.mapId);
    
    if (!currentLocationId) {
      this.renderNoLocation();
      return;
    }

    const locationDetails = LocationManager.getLocationDetails(this.graph, currentLocationId);
    
    if (!locationDetails) {
      this.renderLocationNotFound(currentLocationId);
      return;
    }

    this.renderLocationDetails(locationDetails);
  }

  private renderNoLocation(): void {
    const message = document.createElement('div');
    message.className = 'no-location-message';
    message.innerHTML = `
      <h3>No Current Location</h3>
      <p>Click on a location in the map above to set your current position.</p>
    `;
    this.container.appendChild(message);
  }

  private renderLocationNotFound(locationId: string): void {
    const message = document.createElement('div');
    message.className = 'location-not-found';
    message.innerHTML = `
      <h3>Location Not Found</h3>
      <p>The location "${locationId}" could not be found in the current map.</p>
    `;
    this.container.appendChild(message);
  }

  private renderLocationDetails(details: any): void {
    const { node, connectedLocations, paths } = details;
    
    // Main location info
    const header = document.createElement('div');
    header.className = 'location-header';
    
    const title = document.createElement('h3');
    title.className = 'location-title';
    title.textContent = node.label;
    
    const type = document.createElement('span');
    type.className = `location-type location-type-${node.type || 'default'}`;
    type.textContent = this.formatLocationType(node.type);
    
    header.appendChild(title);
    header.appendChild(type);
    this.container.appendChild(header);

    // Location description
    if (node.metadata?.description) {
      const description = document.createElement('div');
      description.className = 'location-description';
      description.textContent = node.metadata.description;
      this.container.appendChild(description);
    }

    // Connected locations
    if (connectedLocations.length > 0) {
      const connectionsSection = document.createElement('div');
      connectionsSection.className = 'connections-section';
      
      const connectionsTitle = document.createElement('h4');
      connectionsTitle.textContent = 'Connected Locations';
      connectionsSection.appendChild(connectionsTitle);

      const connectionsList = document.createElement('ul');
      connectionsList.className = 'connections-list';

      paths.forEach((path: any) => {
        const listItem = document.createElement('li');
        listItem.className = 'connection-item';
        
        const destinationNode = this.graph.nodes.find(n => n.id === path.destination);
        const destinationName = destinationNode?.label || path.destination;
        
        const connectionButton = document.createElement('button');
        connectionButton.className = 'connection-button';
        connectionButton.textContent = destinationName;
        connectionButton.addEventListener('click', () => {
          this.navigateToLocation(path.destination);
        });

        listItem.appendChild(connectionButton);

        // Add path details if available
        if (path.label || path.travelTime || path.distance) {
          const pathDetails = document.createElement('div');
          pathDetails.className = 'path-details';
          
          const details = [];
          if (path.label) details.push(path.label);
          if (path.travelTime) details.push(`${path.travelTime}`);
          if (path.distance) details.push(`${path.distance} miles`);
          
          pathDetails.textContent = details.join(' • ');
          listItem.appendChild(pathDetails);
        }

        connectionsList.appendChild(listItem);
      });

      connectionsSection.appendChild(connectionsList);
      this.container.appendChild(connectionsSection);
    }

    // Location notes
    if (node.metadata?.notes) {
      const notesSection = document.createElement('div');
      notesSection.className = 'notes-section';
      
      const notesTitle = document.createElement('h4');
      notesTitle.textContent = 'Notes';
      notesSection.appendChild(notesTitle);
      
      const notes = document.createElement('div');
      notes.className = 'location-notes';
      notes.textContent = node.metadata.notes;
      notesSection.appendChild(notes);
      
      this.container.appendChild(notesSection);
    }

    // Visit history
    const visitedLocations = LocationManager.getVisitedLocations(this.mapId);
    if (visitedLocations.length > 1) {
      const historySection = document.createElement('div');
      historySection.className = 'history-section';
      
      const historyTitle = document.createElement('h4');
      historyTitle.textContent = 'Recent Locations';
      historySection.appendChild(historyTitle);
      
      const historyList = document.createElement('ul');
      historyList.className = 'history-list';
      
      // Show last 5 visited locations (excluding current)
      const recentLocations = visitedLocations
        .filter(id => id !== node.id)
        .slice(-5)
        .reverse();
      
      recentLocations.forEach(locationId => {
        const locationNode = this.graph.nodes.find(n => n.id === locationId);
        if (locationNode) {
          const listItem = document.createElement('li');
          listItem.className = 'history-item';
          
          const historyButton = document.createElement('button');
          historyButton.className = 'history-button';
          historyButton.textContent = locationNode.label;
          historyButton.addEventListener('click', () => {
            this.navigateToLocation(locationId);
          });
          
          listItem.appendChild(historyButton);
          historyList.appendChild(listItem);
        }
      });
      
      if (recentLocations.length > 0) {
        historySection.appendChild(historyList);
        this.container.appendChild(historySection);
      }
    }
  }

  private formatLocationType(type?: string): string {
    if (!type || type === 'default') return 'Location';
    
    const typeMap: Record<string, string> = {
      'tavern': 'Tavern',
      'dungeon': 'Dungeon',
      'city': 'City',
      'shop': 'Shop',
      'castle': 'Castle',
      'forest': 'Forest'
    };
    
    return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
  }

  private navigateToLocation(locationId: string): void {
    LocationManager.setCurrentLocation(this.mapId, locationId);
    this.refresh();
    
    // Dispatch custom event to notify other components
    const event = new CustomEvent('dnd-location-changed', {
      detail: { locationId, mapId: this.mapId }
    });
    this.container.dispatchEvent(event);
  }

  public refresh(): void {
    this.render();
  }

  public setCurrentLocation(locationId: string): void {
    LocationManager.setCurrentLocation(this.mapId, locationId);
    this.refresh();
  }

  public destroy(): void {
    this.container.innerHTML = '';
  }
}