import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFileUpload } from "@/hooks";

// ============================================================================
// Component
// ============================================================================

export function FileUpload() {
  const { isLoading, handleFileChange, handleDrop, handleDragOver } = useFileUpload();

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">📚 Study Buddy</CardTitle>
        <CardDescription className="text-base">
          Upload your quiz file to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState />
        ) : (
          <DropZone
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onFileChange={handleFileChange}
          />
        )}
        <FormatHint />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function LoadingState() {
  return (
    <div
      className="border-2 border-dashed border-primary/50 rounded-lg p-8 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="text-6xl animate-pulse">⏳</div>
        <div>
          <p className="text-lg font-medium">Processing your file...</p>
          <p className="text-sm text-muted-foreground mt-1">
            This may take a moment for large files
          </p>
        </div>
      </div>
    </div>
  );
}

interface DropZoneProps {
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function DropZone({ onDrop, onDragOver, onFileChange }: DropZoneProps) {
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      role="button"
      tabIndex={0}
      aria-label="File upload area. Drag and drop a file or click to browse."
      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="text-6xl" aria-hidden="true">📄</div>
        <div>
          <p className="text-lg font-medium">Drag & drop your file here</p>
          <p className="text-sm text-muted-foreground mt-1">
            Supports Excel (.xlsx, .xls) and CSV files
          </p>
        </div>
        <div className="text-muted-foreground" aria-hidden="true">or</div>
        <Button asChild>
          <label className="cursor-pointer">
            Browse Files
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={onFileChange}
              className="hidden"
              aria-label="Choose file to upload"
            />
          </label>
        </Button>
      </div>
    </div>
  );
}

function FormatHint() {
  return (
    <div className="mt-6 p-4 bg-muted rounded-lg">
      <p className="text-sm font-medium mb-2">Expected file format:</p>
      <p className="text-xs text-muted-foreground">
        Each row: Question | Option 1 | Option 2 | Option 3 | ...
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        The correct answer should be{" "}
        <span className="font-medium">highlighted differently</span> (different
        color, bold, etc.)
      </p>
    </div>
  );
}
