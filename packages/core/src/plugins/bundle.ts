import AdmZip from "adm-zip";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

interface PluginFile {
  path: string
  localPath: string
}

interface PluginManifest {
  name: string
  version: string
  main?: string
  module?: string
}

/**
 * Read a plugin manifest
 * @param dir A directory to read the manifest from
 * @returns {Promise<PluginManifest>} The plugin manifest
 */
export async function readManifest(dir: string): Promise<PluginManifest> {
  const manifestPath = path.join(dir, "package.json");

  const manifest = await readFile(manifestPath, "utf8")
    .catch(() => Promise.reject(new Error(`Could not find manifest at ${manifestPath}`)))
    .then<PluginManifest>((content) => {
      try {
        return Promise.resolve(JSON.parse(content));
      } catch (e) {
        return Promise.reject(

          new Error("Error parsing 'package.json' manifest file: not a valid JSON file.")
        );
      }
    });

  return manifest;
}

/**
 * Pack a plugin, based on a manifest
 * @param {PluginManifest} manifest The plugin manifest
 * @param {string} out The output path
 */
export async function pack(manifest: PluginManifest, out?: string) {
  const cwd = process.cwd();
  const files: PluginFile[] = [
    {
      localPath: path.join(cwd, "package.json"),
      path: ""
    },
    {
      localPath: path.join(cwd, manifest.main || manifest.module || "dist/plugin.js"),
      path: "/dist"
    }
  ];

  const output = await getOutput(manifest, out);
  const zip = new AdmZip();
  files.forEach((file) => {
    zip.addLocalFile(file.localPath, file.path);
  });

  await zip.writeZipPromise(output, { overwrite: true });
}

/**
 * Get the output path for the .zop file
 * @param {PluginManifest} manifest The plugin manifest
 * @param {String} out The output path
 * @returns {Promise<string>} The output path
 */
async function getOutput(manifest: PluginManifest, out?: string): Promise<string> {
  if (!out) {
    return path.resolve(process.cwd(), `${manifest.name}.zop`);
  }

  try {
    const _stat = await stat(out);

    if (_stat.isDirectory()) {
      return path.join(out, `${manifest.name}.zop`);
    } else {
      return out;
    }
  } catch {
    return out;
  }
}

/**
 * Unpacks a .zop file to a directory.
 * @param {String} location path to the zip file
 */
export function unpack(file: string, location: string) {
  if (path.extname(file) !== ".zop") {
    throw new Error("Not a .zop file");
  }
  const zip = new AdmZip(file);
  zip.extractAllTo(location);
}
