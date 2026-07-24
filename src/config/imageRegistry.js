const imageModules = import.meta.glob(
  "/src/assets/images/**/*.{jpg,jpeg,png,webp,avif}",
);

const imagesByName = new Map();

for (const [path, load] of Object.entries(imageModules)) {
  const filename = path.slice(path.lastIndexOf("/") + 1);
  const name = filename.replace(/\.[^.]+$/, "");
  const existing = imagesByName.get(name);

  if (existing) {
    throw new Error(
      `[imageRegistry] Duplicate image name "${name}". Filename stems must be globally unique under src/assets/images:\n- ${existing.path}\n- ${path}`,
    );
  }

  imagesByName.set(name, { path, load });
}

export async function getImage(name) {
  const entry = imagesByName.get(name);

  if (!entry) {
    throw new Error(
      `[imageRegistry] Unknown image name "${name}". Expected a filename stem from src/assets/images (without its extension).`,
    );
  }

  const imageModule = await entry.load();
  return imageModule.default ?? imageModule;
}

export async function resolveImage(source) {
  return typeof source === "string" ? getImage(source) : source;
}
