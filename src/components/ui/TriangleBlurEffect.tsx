import type { TriangleBlurEffectProps } from "@/libs/types/TriangleBlurEffectProps";

export default function TriangleBlurEffect({
  children,
}: TriangleBlurEffectProps) {
  return (
    <div className="relative overflow-x-hidden min-h-screen">
      {/* Triangle Effect */}
      <div className="absolute left-1/2 -translate-y-20 -translate-x-1/2 opacity-50 blur-[120px]">
        <div className="w-0 h-0 rotate-45 border-l-[300px] border-l-transparent border-b-[200px] border-b-text-clr border-r-[300px] border-r-transparent" />
      </div>

      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  );
}
