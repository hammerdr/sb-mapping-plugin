# SilverBullet D&D Mapping Plugin

An interactive D&D location mapping and navigation plugin for SilverBullet that provides spatial visualization and navigation for tabletop RPG games.

## Features

- **Interactive Graph Visualization**: Click on locations to navigate and set your current position
- **Mermaid-Compatible Syntax**: Use familiar Mermaid flowchart syntax to define your maps
- **Location Types**: Support for different location types (tavern, dungeon, city, castle, etc.)
- **Current Location Highlighting**: Visual indication of where you currently are
- **Visit History**: Track and navigate through previously visited locations
- **Location Details Panel**: Shows information about the current location and connected areas
- **Persistent State**: Automatically saves your current location and visit history

## Usage

Create a `dnd-map` code block in your SilverBullet page:

````markdown
```dndmap
graph TD
    A[Riverside Tavern]:::tavern --> B[Market Square]:::city
    A --> C[Old Mill]:::shop
    B --> D[Castle Gate]:::castle
    C --> D
    D --> E[Throne Room]:::important
    B --> F[Dark Forest]:::forest
    F --> G[Ancient Ruins]:::dungeon
```
````

## Syntax

The plugin uses Mermaid flowchart syntax with additional D&D-specific features:

### Basic Structure
```
graph TD
    NodeID[Label] --> AnotherNode[Another Label]
```

### Location Types
Add location types using CSS classes:
- `:::tavern` - Taverns and inns
- `:::dungeon` - Dungeons and dangerous areas  
- `:::city` - Cities and towns
- `:::castle` - Castles and fortifications
- `:::forest` - Forests and wilderness
- `:::shop` - Shops and merchants
- `:::important` - Important or special locations

### Connection Types
- `-->` - Directed path (one-way)
- `---` - Undirected path (bidirectional)
- Add labels: `A -->|"Forest Path"| B`

### Example with Details
````markdown
```dndmap
graph TD
    Start[Tavern]:::tavern --> Market[Market Square]:::city
    Market -->|"Main Road"| Castle[Castle]:::castle
    Market -->|"Forest Trail"| Woods[Dark Woods]:::forest
    Woods -->|"Hidden Path"| Ruins[Ancient Ruins]:::dungeon
    Castle --> Throne[Throne Room]:::important
```
````

## Installation

### For SilverBullet v2

1. Add the plugin to your `CONFIG` page:

```lua
config.set("plugs", {
  "github:yourusername/sb-mapping-plugin/dnd-mapping.plug.js"
})
```

2. Run the `Plugs: Update` command in SilverBullet

### Manual Installation (v1 and v2)

1. Download the `dnd-mapping.plug.js` file
2. Copy it to your SilverBullet space's `_plug/` folder
3. The plugin will be automatically loaded

## Development

To build the plugin from source:

1. Install [Deno](https://deno.com)
2. Clone this repository
3. Run `deno task build`
4. Copy the generated `.plug.js` file to your SilverBullet space

### Development Commands

- `deno task build` - Build the plugin using SilverBullet v2 build system

### Requirements

- Deno 1.40+
- SilverBullet v2.0.0-pre or later

## Features in Detail

### Interactive Navigation
- Click any location on the map to set it as your current location
- Current location is highlighted with a pulsing red border
- Visited locations are shown with a dashed border

### Location Panel
The panel below the map shows:
- Current location name and type
- Description (if provided)
- Connected locations with quick navigation buttons
- Path details (labels, travel time, distance)
- Recent location history
- Notes about the location

### State Persistence
- Your current location and visit history are automatically saved
- State persists across browser sessions
- Each map has its own independent state

### Keyboard Shortcuts
- `Ctrl+Shift+L` - Set current location (command palette)

## Customization

The plugin includes CSS custom properties for theming:
- `--ui-background-color` - Background colors
- `--ui-text-color` - Text colors  
- `--ui-border-color` - Border colors
- `--ui-accent-color` - Accent colors

Dark mode is automatically supported based on system preferences.

## License

This work is licensed under a [Creative Commons Attribution-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-sa/4.0/).

[![CC BY-SA 4.0](https://licensebuttons.net/l/by-sa/4.0/88x31.png)](http://creativecommons.org/licenses/by-sa/4.0/)

You are free to:
- **Share** — copy and redistribute the material in any medium or format
- **Adapt** — remix, transform, and build upon the material for any purpose, even commercially

Under the following terms:
- **Attribution** — You must give appropriate credit, provide a link to the license, and indicate if changes were made
- **ShareAlike** — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.