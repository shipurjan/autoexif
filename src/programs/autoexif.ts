import { exiftool, Tags, WriteTags } from "exiftool-vendored";
import { resolve, join, dirname, extname, basename } from "node:path";
import { access, copyFile } from "node:fs/promises";

interface IOptions {
  input: string;
  output?: string;
}

/**
 * List of EXIF tags to preserve - purely technical metadata without identifying information
 */
const TAGS_TO_PRESERVE: readonly (keyof Tags)[] = [
  // Core exposure settings
  "ExposureTime",
  "FNumber",
  "ISO",
  "ShutterSpeedValue",
  "ApertureValue",
  "BrightnessValue",
  "ExposureCompensationMode",
  "Flash",
  "FocalLength",
  "ColorSpace",
  "FieldOfView",
  "FOV",

  // Additional exposure settings
  "ExposureProgram",
  "ExposureCompensationMode",
  "ExposureCompensationSet",
  "ExposureCompensationSetting",
  "ExposureMode",
  "MeteringMode",
  "SensitivityType",
  "RecommendedExposureIndex",

  // White balance and color information
  "WhiteBalance",
  "LightSource",
  "ColorTemperature",

  // Image quality settings
  "Contrast",
  "Saturation",
  "Sharpness",
  "CustomRendered",
  "ImageWidth",
  "ImageHeight",

  // Resolution information
  "XResolution",
  "YResolution",
  "ResolutionUnit",

  // Scene information
  "SceneType",
  "SceneCaptureType",
  "FileSource",
  "Orientation",

  // Additional technical measurements
  "FocalLengthIn35mmFormat",
  "CircleOfConfusion",
  "HyperfocalDistance",
  "LightValue",
  "DigitalZoomRatio",
  "SubjectDistance",
  "FocalPlaneResolutionUnit",
];

/**
 * Validates input path and generates appropriate output path
 */
async function validatePaths(
  input: string,
  output?: string,
): Promise<{ inputPath: string; outputPath: string } | null> {
  const inputPath = resolve(input);

  try {
    await access(inputPath);
  } catch {
    console.error(
      `Error: Input file '${inputPath}' does not exist or is not accessible.`,
    );
    return null;
  }

  const outputPath = output
    ? resolve(output)
    : join(
        dirname(inputPath),
        `${basename(inputPath, extname(inputPath))}.out${extname(inputPath)}`,
      );

  if (inputPath === outputPath) {
    console.error(
      "Error: Input and output paths cannot be the same to avoid modifying the original file.",
    );
    return null;
  }

  return { inputPath, outputPath };
}

/**
 * Extracts tags to preserve from all image metadata
 */
function extractPreservedTags(allTags: Tags): Record<string, any> {
  const tagsToWrite: Record<string, any> = {
    XMPToolkit: null,
  };

  TAGS_TO_PRESERVE.forEach((tag) => {
    if (allTags[tag] !== undefined) {
      tagsToWrite[tag] = allTags[tag];
    }
  });

  return tagsToWrite;
}

/**
 * Processes an image file by preserving only technical EXIF data
 */
export async function autoexif({ input, output }: IOptions): Promise<void> {
  let hasRunExifTool = false;

  try {
    const paths = await validatePaths(input, output);
    if (!paths) return;

    const { inputPath, outputPath } = paths;
    hasRunExifTool = true;
    console.log(`Processing ${inputPath} -> ${outputPath}`);

    const allTags = await exiftool.read(inputPath);
    await copyFile(inputPath, outputPath);

    const tagsToWrite = extractPreservedTags(allTags);
    await exiftool.write(outputPath, { all: null } as WriteTags);

    if (Object.keys(tagsToWrite).length > 0) {
      await exiftool.write(outputPath, tagsToWrite);
    }

    console.log(`Successfully processed '${inputPath}' -> '${outputPath}'`);
  } catch (error) {
    console.error("Error processing file:", error);
  } finally {
    if (hasRunExifTool) {
      await exiftool.end();
    }
  }
}
