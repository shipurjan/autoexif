#!/usr/bin/env node
import { Command } from "commander";
import { name, description, version } from "~/package.json";
import { autoexif } from "@/programs/autoexif";

const program = new Command();

program
  .name(name)
  .summary(description)
  .description("A utility that creates copies of images with decluttered metadata, preserving only essential technical information like exposure settings while removing equipment-specific details that might introduce bias. This tool streamlines image metadata to focus on parameters that directly relate to the photographic qualities, implementing a non-destructive workflow that never modifies original files.")
  .version(version)
  .requiredOption(
    "-i, --input <path>",
    "path to file containing EXIF data for removal",
  )
  .option(
    "-o, --output <path>",
    "destination path for saving file with EXIF data removed",
  )
  .action(autoexif);

program.parse();
