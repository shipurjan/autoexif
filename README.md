# autoexif

A specialized command-line utility that declutters EXIF metadata in digital images by preserving only the essential technical parameters while removing extraneous information about camera equipment, software, and other non-essential details.

## Overview

Digital photographs typically contain extensive embedded metadata (EXIF data) that includes numerous parameters, many of which are irrelevant to the actual photographic qualities of the image. This metadata often contains camera and lens model information that can introduce bias when evaluating image quality.

Autoexif creates a clean copy of your original image with only essential technical metadata intact—preserving information valuable for understanding the photographic conditions while eliminating equipment-specific details and other extraneous information that clutters the metadata profile.

## Key Features

- Creates a non-destructive workflow by always generating a separate output file, never modifying the original
- Completely removes all embedded metadata from the image copy
- Selectively restores only specific technical metadata elements that directly relate to the photographic parameters
- Eliminates equipment-specific information that could introduce bias when evaluating image quality
- Offers flexible output options, with automatic generation of output filenames if not specified

## Installation

### Prerequisites

- Node.js 18 or higher
- npm

### Installation Steps

```bash
# Clone the repository
git clone https://github.com/shipurjan/autoexif.git
cd autoexif

# Install dependencies
npm install

# Build the project
npm run build
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

Autoexif preserves a carefully curated set of non-identifying technical information, including:

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

## Use Cases

Autoexif is particularly valuable for:

- Photographers sharing work for technical feedback without equipment bias influencing the critique
- Photography educators focusing discussions on exposure, composition, and technique rather than gear
- Photography forums where equipment discussions can detract from image quality conversations
- Creating cleaner, more focused image metadata profiles for archiving
- Removing extraneous editing software information and revision history while keeping essential parameters
- Sharing images with reduced metadata clutter (with privacy improvement as a secondary benefit)

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

## Implementation

The tool leverages the robust ExifTool library (via exiftool-vendored) to handle the complex metadata structures found in modern image files. The process follows a methodical approach of copying, clearing, and selectively restoring specific metadata elements to ensure consistent results across different image formats and sources.

By focusing exclusively on the technical parameters that matter for photographic analysis, autoexif provides a streamlined approach that preserves valuable image context while removing equipment-specific information that can introduce bias or unnecessary clutter in the metadata profile.

## License

MIT License - See the LICENSE file for details.

---

Built by Cyprian Zdebski
