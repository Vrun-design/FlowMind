export const ANNOTATION_COLOR_OPTIONS = [
  { id: 'yellow', label: 'Yellow', container: 'bg-amber-50 border-amber-200', title: 'text-amber-900 border-amber-200', body: 'text-amber-800', fold: 'bg-amber-100/70 border-amber-300/40', dot: 'bg-amber-300' },
  { id: 'green', label: 'Green', container: 'bg-emerald-50 border-emerald-200', title: 'text-emerald-900 border-emerald-200', body: 'text-emerald-800', fold: 'bg-emerald-100/70 border-emerald-300/40', dot: 'bg-emerald-300' },
  { id: 'blue', label: 'Blue', container: 'bg-blue-50 border-blue-200', title: 'text-blue-900 border-blue-200', body: 'text-blue-800', fold: 'bg-blue-100/70 border-blue-300/40', dot: 'bg-blue-300' },
  { id: 'pink', label: 'Pink', container: 'bg-pink-50 border-pink-200', title: 'text-pink-900 border-pink-200', body: 'text-pink-800', fold: 'bg-pink-100/70 border-pink-300/40', dot: 'bg-pink-300' },
  { id: 'violet', label: 'Purple', container: 'bg-violet-50 border-violet-200', title: 'text-violet-900 border-violet-200', body: 'text-violet-800', fold: 'bg-violet-100/70 border-violet-300/40', dot: 'bg-violet-300' },
  { id: 'orange', label: 'Orange', container: 'bg-orange-50 border-orange-200', title: 'text-orange-900 border-orange-200', body: 'text-orange-800', fold: 'bg-orange-100/70 border-orange-300/40', dot: 'bg-orange-300' },
] as const;

export type AnnotationColorId = (typeof ANNOTATION_COLOR_OPTIONS)[number]['id'];

export function resolveAnnotationTheme(color?: string) {
  return ANNOTATION_COLOR_OPTIONS.find((option) => option.id === color) ?? ANNOTATION_COLOR_OPTIONS[0];
}
