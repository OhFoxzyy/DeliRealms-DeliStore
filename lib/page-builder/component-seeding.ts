import { db } from '@/lib/prisma';
import { builtinComponentPresets } from './component-presets';

/**
 * Ensure that built-in components exist in the database.
 * This can be called lazily from API routes instead of a
 * one‑off seed command, so new environments stay in sync.
 */
export async function ensureBuiltinComponentsSeeded() {
  const existingCount = await db.component.count({
    where: { isBuiltin: true },
  });

  if (existingCount > 0) {
    return;
  }

  await db.component.createMany({
    data: builtinComponentPresets.map((preset) => ({
      name: preset.name,
      type: preset.type,
      category: preset.category,
      icon: preset.icon,
      defaultContent: preset.defaultContent,
      defaultStyle: preset.defaultStyle,
      isBuiltin: true,
    })),
    skipDuplicates: true,
  });
}

