import { ArrowLeftRight, PackageX, RotateCcw } from "lucide-react";

export function get_type_icon(type: string) {
  switch (type) {
    case "return":
      return <RotateCcw className="h-4 w-4" />;
    case "replacement":
      return <ArrowLeftRight className="h-4 w-4" />;
    case "failed_delivery":
      return <PackageX className="h-4 w-4" />;
    default:
      return <RotateCcw className="h-4 w-4" />;
  }
}
