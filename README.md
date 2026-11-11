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

- Node.js 24 or higher
- npm

### Installation Steps

```bash
npm i -g autoexif
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
- `--no-date` - Also remove the capture date and time
- `--no-copyright` - Also remove author and copyright information
- `--version` - Display the version number
- `--help` - Show help information

If no output path is specified, the program will create a new file in the same directory as the input file with `.out` inserted before the extension (e.g., `image.jpg` becomes `image.out.jpg`).

### Output

On success, autoexif prints only the absolute path of the created file to stdout, so it can be used in scripts and pipelines:

```bash
# Open the cleaned copy right away
xdg-open "$(autoexif -i photo.jpg)"

# Process every JPEG in a directory
for f in *.jpg; do autoexif -i "$f"; done
```

## Preserved Metadata

Autoexif preserves a carefully curated set of non-identifying technical information, including:

### Exposure Information

- Exposure time, aperture (F-number), ISO
- Exposure program, mode, and compensation
- Metering mode, gain control, exposure index
- Brightness, shutter speed and aperture values
- Flash information

### Optical Information

- Focal length (including 35mm equivalent)
- Digital zoom ratio
- Subject distance and distance range

Derived values such as field of view, circle of confusion, hyperfocal distance and light value aren't stored separately, but tools like ExifTool still calculate them from the preserved tags.

### Image Properties

- Color space and embedded ICC color profile (so wide-gamut images keep their correct colors)
- White balance and light source
- Contrast, saturation, and sharpness settings
- Resolution and orientation

### Scene Information

- Scene type and capture mode
- Composite image indicator (e.g. HDR or night-mode captures)

### Capture Date (disable with `--no-date`)

- Original capture date and time, including time zone offset and sub-seconds

### Authorship and Copyright (disable with `--no-copyright`)

- Artist and copyright notice (EXIF), creator and rights (XMP), by-line and copyright notice (IPTC)

### Always Removed

- Camera and lens make, model and serial numbers
- GPS location
- Editing software, edit history and modification dates
- Manufacturer-specific maker notes
- Thumbnails, descriptions, keywords and any other metadata not listed above

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

The tool leverages the robust ExifTool library (via exiftool-vendored) to handle the complex metadata structures found in modern image files. It copies the original image, then makes a single ExifTool call on the copy that clears all metadata and copies back only the preserved tags from the original file (`-all= -tagsFromFile @ ...`). Values are copied exactly as stored and stay in their original metadata groups, and the image data itself is never re-encoded.

By focusing exclusively on the technical parameters that matter for photographic analysis, autoexif provides a streamlined approach that preserves valuable image context while removing equipment-specific information that can introduce bias or unnecessary clutter in the metadata profile.

## License

MIT License - See the LICENSE file for details.

---

Built by Cyprian Zdebski
