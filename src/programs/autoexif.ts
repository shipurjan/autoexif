import { exiftool } from "exiftool-vendored";
import { resolve, join, dirname, extname, basename } from "node:path";
import { access, copyFile, unlink } from "node:fs/promises";

interface IOptions {
  input: string;
  output?: string;
  /** Keep capture date/time tags (disable with --no-date) */
  date: boolean;
  /** Keep authorship and copyright tags (disable with --no-copyright) */
  copyright: boolean;
}

/**
 * Tags are group-qualified on purpose: when copied with -tagsFromFile, an
 * unqualified tag is written to ExifTool's *preferred* group (e.g. Flash would
 * move from EXIF to XMP), while a qualified one stays where cameras put it.
 *
 * Only tags stored in standard metadata can be restored. Composite tags (FOV,
 * HyperfocalDistance, LightValue, ...) are recomputed by ExifTool from the tags
 * below, and maker-note tags are vendor-specific and are always removed.
 */
const TECHNICAL_TAGS = [
  // Exposure
  "EXIF:ExposureTime",
  "EXIF:FNumber",
  "EXIF:ApertureValue",
  "EXIF:ShutterSpeedValue",
  "EXIF:BrightnessValue",
  "EXIF:ExposureCompensation",
  "EXIF:ExposureProgram",
  "EXIF:ExposureMode",
  "EXIF:MeteringMode",
  "EXIF:ISO",
  "EXIF:SensitivityType",
  "EXIF:RecommendedExposureIndex",
  "EXIF:ExposureIndex",
  "EXIF:GainControl",
  "EXIF:Flash",

  // Optics
  "EXIF:FocalLength",
  "EXIF:FocalLengthIn35mmFormat",
  "EXIF:DigitalZoomRatio",
  "EXIF:SubjectDistance",
  "EXIF:SubjectDistanceRange",

  // Color and rendering
  "EXIF:ColorSpace",
  "EXIF:WhiteBalance",
  "EXIF:LightSource",
  "EXIF:Contrast",
  "EXIF:Saturation",
  "EXIF:Sharpness",
  "EXIF:CustomRendered",
  "ICC_Profile", // without it, wide-gamut images (Display P3, Adobe RGB) render with wrong colors

  // Scene
  "EXIF:SceneCaptureType",
  "EXIF:SceneType",
  "EXIF:FileSource",
  "EXIF:CompositeImage",

  // Image geometry
  "EXIF:Orientation",
  "EXIF:XResolution",
  "EXIF:YResolution",
  "EXIF:ResolutionUnit",
] as const;

const DATE_TAGS = [
  "EXIF:DateTimeOriginal",
  "EXIF:OffsetTimeOriginal",
  "EXIF:SubSecTimeOriginal",
] as const;

const COPYRIGHT_TAGS = [
  "EXIF:Artist",
  "EXIF:Copyright",
  "XMP-dc:Creator",
  "XMP-dc:Rights",
  "XMP-xmpRights:all",
  "IPTC:By-line",
  "IPTC:CopyrightNotice",
] as const;

/**
 * In TIFF-based files IFD0 holds the image structure, so `-all=` can't delete
 * it as a group and these tags would survive. Deleting them by name works, and
 * is a no-op for formats where `-all=` already removed them. Any of them that
 * are in the preserve lists are copied back afterwards by -tagsFromFile.
 */
const IFD0_TAGS_TO_DELETE = [
  "Make",
  "Model",
  "Software",
  "HostComputer",
  "ModifyDate",
  "Artist",
  "Copyright",
  "ImageDescription",
  "DocumentName",
  "PageName",
  "XPTitle",
  "XPComment",
  "XPAuthor",
  "XPKeywords",
  "XPSubject",
] as const;

/**
 * Expected ExifTool warnings that don't indicate a problem.
 */
const IGNORED_WARNINGS = [
  /ICC_Profile deleted/i, // emitted by `-all=` before ICC_Profile is copied back
  /No writable tags set/i, // source simply had none of the preserved tags
];

/**
 * Creates a copy of an image keeping only technical (and optionally date and
 * copyright) metadata. Prints the output path to stdout on success.
 */
export async function autoexif({
  input,
  output,
  date,
  copyright,
}: IOptions): Promise<void> {
  try {
    const { inputPath, outputPath } = await validatePaths(input, output);
    const tags = [
      ...TECHNICAL_TAGS,
      ...(date ? DATE_TAGS : []),
      ...(copyright ? COPYRIGHT_TAGS : []),
    ];

    await copyFile(inputPath, outputPath);

    try {
      const { warnings = [] } = await exiftool.write(
        outputPath,
        {},
        {
          writeArgs: [
            "-overwrite_original",
            "-all=",
            ...IFD0_TAGS_TO_DELETE.map((tag) => `-IFD0:${tag}=`),
            "-tagsFromFile",
            "@",
            ...tags.map((tag) => `-${tag}`),
            "-XMP-x:XMPToolkit=",
          ],
        },
      );

      warnings
        .filter((w) => !IGNORED_WARNINGS.some((re) => re.test(w)))
        .forEach((w) => console.error(w));
    } catch (error) {
      await unlink(outputPath);
      throw error;
    }

    console.log(outputPath);
  } finally {
    await exiftool.end();
  }
}

/**
 * Validates input path and generates appropriate output path
 */
async function validatePaths(
  input: string,
  output?: string,
): Promise<{ inputPath: string; outputPath: string }> {
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
