# Audio and Visual Features

## Sound System

### Sound Effects
- **Drop**: Plays when a piece is hard-dropped
- **Rotate**: Plays when a piece is rotated
- **Line Clear**: Plays when lines are cleared (different sounds for Tetris, T-Spin, and regular clears)
- **Level Up**: Plays when the player advances to a new level
- **Game Over**: Plays when the game ends

### Background Music
- Looping Tetris-style melody using Web Audio API
- Triangle wave oscillators for authentic retro sound
- Automatic looping with seamless transitions

### Audio Controls
- **Master Sound Toggle**: Enable/disable all audio
- **Music Toggle**: Enable/disable background music only
- **Sound Effects Toggle**: Enable/disable sound effects only
- Individual volume controls for fine-tuning

## Visual Effects

### Particle Effects
- Colorful particle explosions when lines are cleared
- 20 particles per explosion with realistic physics
- Gravity simulation and fade-out animations
- Random colors and sizes for variety

### Line Clear Animations
- Blinking and fading effects for cleared lines
- Smooth transitions and visual feedback
- Enhanced user experience during gameplay

### Theme System
- **Light Theme**: Bright, clean interface with warm accents
- **Dark Theme**: Classic dark interface with blue accents
- Automatic theme persistence in localStorage
- Smooth transitions between themes

## Technical Implementation

### Web Audio API
- Uses native browser audio capabilities
- No external audio files required
- Efficient memory usage and performance
- Cross-browser compatibility

### React Hooks
- `useSound`: Manages all audio functionality
- `useTheme`: Manages theme state and persistence
- Custom hooks for clean, reusable code

### CSS Variables
- Dynamic theming with CSS custom properties
- Smooth transitions and animations
- Responsive design considerations

## Usage

### Enabling Audio
1. Go to Settings in the main menu
2. Toggle "Ljud" to enable all audio
3. Use individual toggles for music and sound effects

### Changing Theme
1. Go to Settings in the main menu
2. Click the theme button to switch between light and dark
3. Theme preference is automatically saved

### Particle Effects
- Automatically triggered when lines are cleared
- No user configuration required
- Performance optimized for smooth gameplay

## Browser Compatibility
- Modern browsers with Web Audio API support
- Fallback handling for unsupported features
- Progressive enhancement approach
