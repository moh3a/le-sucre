"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  function exec(command: string) {
    document.execCommand(command, false);
    if (ref.current) onChange(ref.current.innerHTML);
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-1">
        <Button type="button" size="sm" variant="outline" onClick={() => exec("bold")}>
          B
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => exec("italic")}>
          I
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => exec("insertUnorderedList")}
        >
          • Liste
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => exec("insertOrderedList")}>
          1. Liste
        </Button>
      </div>
      <div
        ref={ref}
        role="textbox"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        className="border-input bg-background focus-visible:ring-ring empty:before:text-muted-foreground min-h-40 rounded-md border px-3 py-2 text-sm empty:before:content-[attr(data-placeholder)] focus-visible:ring-2 focus-visible:outline-none"
        onInput={() => ref.current && onChange(ref.current.innerHTML)}
      />
    </div>
  );
}
