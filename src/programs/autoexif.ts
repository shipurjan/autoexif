import { exiftool, Tags, WriteTags } from "exiftool-vendored";
import { resolve, join, dirname, extname, basename } from "node:path";
import { access, copyFile, unlink } from "node:fs/promises";

interface IOptions {
  input: string;
  output?: string;
}

/**
 * Processes an image file by preserving only technical EXIF data
 */
export async function autoexif({ input, output }: IOptions): Promise<void> {
  try {
    const paths = await validatePaths(input, output);
    if (!paths) return;

    const { inputPath, outputPath } = paths;
    const allTags = await readExifTags(inputPath);
    await copyFile(inputPath, outputPath);

    try {
      const tagsToWrite = extractPreservedTags(allTags);
      await clearExifTags(outputPath);

      if (Object.keys(tagsToWrite).length) {
        await writeExifTags(outputPath, tagsToWrite);
      }
    } catch (error) {
      await unlink(outputPath);
      throw error;
    }

    console.log(outputPath);
  } finally {
    exiftool.end();
  }
}
async function readExifTags(file: string) {
  return await exiftool.read(file);
}

async function writeExifTags(file: string, tags: WriteTags) {
  return await exiftool.write(file, tags, {
    writeArgs: ["-overwrite_original"],
  });
}

async function clearExifTags(file: string) {
  return await writeExifTags(file, { all: null } as WriteTags);
}

/**
 * Extracts tags to preserve from all image metadata
 */
function extractPreservedTags(allTags: Tags): Record<string, any> {
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
 * Validates input path and generates appropriate output path
 */
async function validatePaths(
  input: string,
  output?: string,
): Promise<{ inputPath: string; outputPath: string } | null> {
  const inputPath = resolve(input);

  await access(inputPath);

  const outputPath = output
    ? resolve(output)
    : join(
        dirname(inputPath),
        `${basename(inputPath, extname(inputPath))}.out${extname(inputPath)}`,
      );

  if (inputPath === outputPath) {
    throw new Error(
      "Error: Input and output paths cannot be the same to avoid modifying the original file.",
    );
  }

  return { inputPath, outputPath };
}
