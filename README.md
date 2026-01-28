# Neural Animation (WebGL + TS)

[https://dmjsdev.github.io/neural-animation/](https://dmjsdev.github.io/neural-animation/)

Configurable neural shader animation for a user-provided `<canvas>` element.

## Installation

Using pnpm:

```bash
pnpm install
pnpm build
```

Or with npm:

```bash
npm install
npm run build
```

## Usage

```html
<canvas id="neuro"></canvas>
<script type="module">
  import createNeuralAnimation from './dist/index.js';

  const ctrl = createNeuralAnimation('#neuro', {
    baseColor: '#3fa9f5',
    speed: 1.2,
    scale: 0.9
  });

  // Runtime control
  ctrl.setColor({ r: 255, g: 100, b: 80 });
  ctrl.setSpeed(0.8);
  ctrl.setScale(1.5);
</script>
```

You control the canvas size via CSS or HTML attributes. Call `ctrl.resize()` after dynamic size changes.

## Options

- `baseColor` (string | RGB): Base animation color. Default: `#4080c0`
- `speed` (number): Animation speed multiplier. Default: `1.0`
- `scale` (number): UV scale multiplier. Default: `1.0`

## API

- `setColor(color: string | RGB)`: Update the base color
- `setSpeed(speed: number)`: Update the animation speed
- `setScale(scale: number)`: Update the scale
- `resize()`: Recalculate canvas size
- `start()`: Start the animation
- `stop()`: Stop the animation
- `destroy()`: Clean up resources

## License

MIT License - see [LICENSE](LICENSE) file for details.
