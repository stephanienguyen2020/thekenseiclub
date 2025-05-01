"use client";

import {
  Shield,
  Wand2,
  AlertCircle,
  Lock,
  Zap,
  Rocket,
  Info,
} from "lucide-react";
import { TokenForm } from "../components/TokenForm";
import { ImageUpload } from "./image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTestTokenService } from "@/services/TestTokenService";

const tokenInfoFields = [
  {
    label: "Token Name",
    name: "name",
    type: "text",
    placeholder: "e.g., PepeCoin",
    tooltip: "Choose a unique and memorable name for your token",
  },
  {
    label: "Token Symbol",
    name: "symbol",
    type: "text",
    placeholder: "e.g., PEPE",
    tooltip: "Short identifier for your token (2-6 characters)",
  },
  {
    label: "Description",
    name: "description",
    type: "text",
    placeholder: "Brief description of your token",
    tooltip: "Explain the purpose and unique features of your token",
  },
];

interface TokenDetails {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
}

interface LaunchConfig {
  initialSupply: string;
  maxSupply: string;
  launchCost: string;
  liquidityPercentage: string;
  lockupPeriod: string;
}

interface TokenFormSectionProps {
  inputMethod: "manual" | "ai-joke" | "ai-tweet";
  generatedDetails: TokenDetails | null;
  error: string;
  imageFile: File | null;
  previewUrl: string | null;
  aiImageUrl: string;
  prompt: string;
  loadingAI: boolean;
  isLoading: boolean;
  launchConfig: LaunchConfig;
  onImageSelect: (file: File) => void;
  onClearImage: () => void;
  onPromptChange: (prompt: string) => void;
  onGenerateImage: () => void;
  onSubmit: (data: Record<string, string>) => void;
  onConfigChange: (key: keyof LaunchConfig, value: string) => void;
}

export function TokenFormSection({
  inputMethod,
  generatedDetails,
  error,
  imageFile,
  previewUrl,
  aiImageUrl,
  prompt,
  loadingAI,
  isLoading,
  launchConfig,
  onImageSelect,
  onClearImage,
  onPromptChange,
  onGenerateImage,
  onSubmit,
  onConfigChange,
}: TokenFormSectionProps) {
  const testTokenService = useTestTokenService();

  const renderLaunchConfiguration = () => (
    <div>
      <h3 className="text-lg font-semibold mb-4">Launch Configuration</h3>
      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Initial Supply</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The initial amount of tokens that will be minted</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  value={launchConfig.initialSupply}
                  onChange={(e) =>
                    onConfigChange("initialSupply", e.target.value)
                  }
                  className="font-mono"
                  min="1000"
                  max={launchConfig.maxSupply}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  tokens
                </span>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Max Supply</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Maximum number of tokens that can ever exist</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  value={launchConfig.maxSupply}
                  onChange={(e) => onConfigChange("maxSupply", e.target.value)}
                  className="font-mono"
                  min={launchConfig.initialSupply}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  tokens
                </span>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Initial Liquidity</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Percentage of tokens allocated to initial liquidity</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                value={launchConfig.liquidityPercentage}
                onValueChange={(value) =>
                  onConfigChange("liquidityPercentage", value)
                }
              >
                <SelectTrigger className="font-mono">
                  <SelectValue placeholder="Select percentage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="40">40%</SelectItem>
                  <SelectItem value="50">50%</SelectItem>
                  <SelectItem value="60">60%</SelectItem>
                  <SelectItem value="70">70%</SelectItem>
                  <SelectItem value="80">80%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="grid grid-cols-2 items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Lockup Period</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Duration for which the liquidity will be locked</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                value={launchConfig.lockupPeriod}
                onValueChange={(value) => onConfigChange("lockupPeriod", value)}
              >
                <SelectTrigger className="font-mono">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                  <SelectItem value="730">2 years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const validateAndSubmitForm = async () => {
    const form = document.querySelector("form") as HTMLFormElement;

    // Validate token info
    const nameInput = form.querySelector(
      'input[name="name"]'
    ) as HTMLInputElement;
    const symbolInput = form.querySelector(
      'input[name="symbol"]'
    ) as HTMLInputElement;
    const descriptionInput = form.querySelector(
      'input[name="description"]'
    ) as HTMLInputElement;

    // Check required fields
    if (!nameInput?.value.trim()) {
      onSubmit({ error: "Token name is required" });
      return false;
    }

    if (!symbolInput?.value.trim()) {
      onSubmit({ error: "Token symbol is required" });
      return false;
    }

    // Validate image exists
    if (!imageFile) {
      onSubmit({ error: "Token image is required" });
      return false;
    }

    // All validations passed, show confirmation dialog
    if (
      window.confirm(
        `Are you sure you want to create ${nameInput.value} (${symbolInput.value}) token?`
      )
    ) {
      try {
        // Prepare form data for submission
        const formData = {
          name: nameInput.value,
          symbol: symbolInput.value,
          description: descriptionInput?.value || "",
        };

        // Call the onSubmit function with the form data
        onSubmit(formData);
        return true;
      } catch (error) {
        console.error("Error creating token:", error);
        onSubmit({ error: "An unexpected error occurred" });
        return false;
      }
    }

    return false;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:sticky lg:top-24">
          <h3 className="text-lg font-semibold mb-4">Token Preview</h3>
          <ImageUpload
            onImageSelect={onImageSelect}
            previewUrl={previewUrl || aiImageUrl}
            onClear={onClearImage}
          />
        </div>

        <div className="space-y-8">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {inputMethod === "manual" && (
              <>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Wand2 className="h-5 w-5 text-green-400" />
                    <h3 className="font-medium">AI Image Generator</h3>
                  </div>
                  <div className="relative">
                    <Input
                      value={prompt}
                      onChange={(e) => onPromptChange(e.target.value)}
                      placeholder="Describe your token's image..."
                      className="pr-24"
                    />
                    <Button
                      onClick={onGenerateImage}
                      disabled={loadingAI || !prompt.trim()}
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      {loadingAI ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          <span>Generating</span>
                        </div>
                      ) : (
                        "Generate"
                      )}
                    </Button>
                  </div>
                </div>

                <Separator />
              </>
            )}

            <TokenForm
              fields={tokenInfoFields}
              onSubmit={onSubmit}
              isLoading={isLoading}
              hideButton={true}
              initialValues={
                generatedDetails
                  ? {
                      name: generatedDetails.name,
                      symbol: generatedDetails.symbol,
                      description: generatedDetails.description,
                    }
                  : undefined
              }
            />
            {renderLaunchConfiguration()}
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-8 mt-8">
        <Button
          onClick={() => {
            validateAndSubmitForm();
          }}
          disabled={isLoading}
          size="lg"
          className="w-[calc(100%-1rem)] bg-[#0039C6] text-primary-foreground"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              Creating Token...
            </>
          ) : (
            "Create Token"
          )}
        </Button>
      </div>
      <Separator className="my-8" />
      {/* Security Features section remains the same */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Shield,
              title: "Anti-bot Protection",
              description:
                "Advanced protection against malicious bots and snipers",
            },
            {
              icon: Lock,
              title: "Ownership Renounced",
              description: "Contract ownership will be renounced after launch",
            },
            {
              icon: Rocket,
              title: "Liquidity Locked",
              description: "Liquidity will be locked for 6 months minimum",
            },
            {
              icon: Zap,
              title: "Verified Contract",
              description: "Smart contract will be verified on launch",
            },
          ].map((feature, index) => (
            <Card key={index} className="bg-primary/5 border-primary/10">
              <CardContent className="p-6">
                <div className="flex flex-col items-start gap-4">
                  <div className="rounded-full p-2.5 bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
