import { exiftool } from "exiftool-vendored";
import path from "node:path";

interface IOptions {
  input: string;
  output?: string;
}

export async function autoexif({ input, output }: IOptions) {
  // Your code here
  const tags = await exiftool.read(path.resolve(input));
  console.log(tags);
  exiftool.end();
}
