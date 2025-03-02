# autoexif

A command-line tool for removing excess EXIF data from images while preserving technical metadata. This utility helps maintain privacy by stripping identifying information from your photos while keeping useful technical details.

## Overview

Digital photos often contain extensive embedded metadata, including camera information, editing software details, and even location data or photographer information. This data can compromise privacy when sharing images online.

Autoexif selectively preserves only technical metadata (exposure settings, focal length, etc.) while removing identifying information (camera model, serial numbers, editing software, copyright, etc.).

## Installation

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation Steps

```bash
# Clone the repository
git clone https://github.com/yourusername/autoexif.git
cd autoexif

# Install dependencies
npm install

# Build the project
npm run build

# Optional: Link to use as a standalone CLI command
npm link
```

## Usage

### Basic Usage

```bash
# Process a single image
autoexif --input path/to/image.jpg

# Specify an output path
autoexif --input path/to/image.jpg --output path/to/output.jpg

# Using shorthand options
autoexif -i path/to/image.jpg -o path/to/output.jpg
```

### Options

- `-i, --input <path>` - Path to the input image file (required)
- `-o, --output <path>` - Path for the output file (optional)
- `--version` - Display the version number
- `--help` - Show help information

If no output path is specified, the program will create a new file in the same directory as the input file with `.out` inserted before the extension (e.g., `image.jpg` becomes `image.out.jpg`).

## Preserved Metadata

Autoexif preserves only non-identifying technical metadata, including:

### Exposure Information

- Exposure time, aperture (F-number), ISO
- Exposure program, mode, and compensation
- Metering mode
- Brightness, shutter speed values

### Optical Information

- Focal length (including 35mm equivalent)
- Field of view, circle of confusion
- Hyperfocal distance
- Digital zoom ratio

### Image Properties

- Color space, temperature, white balance
- Contrast, saturation, and sharpness settings
- Image dimensions and resolution
- Orientation

### Scene Information

- Scene type and capture mode
- Light source and value
- Flash information

## Examples

### Basic Example

```bash
autoexif -i vacation.jpg
```

Creates `vacation.out.jpg` with identifying metadata removed.

### Processing with Custom Output

```bash
autoexif -i family-photo.jpg -o family-photo-clean.jpg
```

Processes `family-photo.jpg` and saves the cleaned version as `family-photo-clean.jpg`.

## Why Use Autoexif?

- **Privacy Protection**: Remove identifying information before sharing photos
- **Metadata Cleanup**: Clean unnecessary metadata while preserving technical details
- **Selective Preservation**: Keep only the metadata that matters for technical understanding

## Technical Details

Autoexif uses [exiftool-vendored](https://github.com/photostructure/exiftool-vendored.js), a Node.js wrapper for ExifTool, to provide efficient and reliable metadata processing.

The workflow:

1. Creates a copy of the original file
2. Reads all existing metadata
3. Removes all metadata from the copy
4. Writes back only the selected technical metadata

## License

MIT License - See the LICENSE file for details.

---

Built by Cyprian Zdebski
