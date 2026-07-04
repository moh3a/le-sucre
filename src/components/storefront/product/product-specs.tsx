import type { SpecItem } from "@/components/storefront/types";

interface ProductSpecsProps {
  specs: SpecItem[];
  title?: string;
}

export function ProductSpecs({ specs, title }: ProductSpecsProps) {
  return (
    <div>
      {title && <h2 className="mb-3 text-lg font-semibold">{title}</h2>}
      <table className="w-full text-sm">
        <tbody>
          {specs.map((spec) => (
            <tr key={spec.label} className="border-b last:border-0">
              <td className="py-2 pr-4 font-medium text-muted-foreground">{spec.label}</td>
              <td className="py-2">{spec.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
