import { Sparkles, Upload } from "lucide-react";

export type LaunchMethod = "auto" | "manual";

interface InputMethodSelectorProps {
  selectedMethod: LaunchMethod;
  onMethodChange: (method: LaunchMethod) => void;
}

export default function InputMethodSelector({
  selectedMethod,
  onMethodChange,
}: InputMethodSelectorProps) {
  return (
    <div className="flex gap-4 mb-8">
      <button
        className={`flex-1 py-4 rounded-xl border-2 ${
          selectedMethod === "auto"
            ? "border-[#0039C6] bg-[#0039C6] text-white"
            : "border-gray-200 bg-white"
        }`}
        onClick={() => onMethodChange("auto")}
      >
        <div className="flex flex-col items-center gap-2">
          <Sparkles size={24} />
          <h3 className="font-bold">Auto Generated</h3>
          <p className="text-sm text-center px-4">
            Just provide a description and we'll generate everything for you
          </p>
        </div>
      </button>

      <button
        className={`flex-1 py-4 rounded-xl border-2 ${
          selectedMethod === "manual"
            ? "border-[#0039C6] bg-[#0039C6] text-white"
            : "border-gray-200 bg-white"
        }`}
        onClick={() => onMethodChange("manual")}
      >
        <div className="flex flex-col items-center gap-2">
          <Upload size={24} />
          <h3 className="font-bold">Manual Entry</h3>
          <p className="text-sm text-center px-4">
            Customize every aspect of your token manually
          </p>
        </div>
      </button>
    </div>
  );
}
