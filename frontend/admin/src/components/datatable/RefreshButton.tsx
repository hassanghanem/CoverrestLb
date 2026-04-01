// components/datatable/RefreshButton.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

type RefreshButtonProps = {
  onRefresh: () => Promise<void>; // must be async
};

export function RefreshButton({ onRefresh }: RefreshButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onRefresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleClick}
      disabled={loading}
    >
      <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
    </Button>
  );
}
