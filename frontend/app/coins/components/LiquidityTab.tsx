import { Card, CardContent } from "@/components/ui/card";

const LiquidityTab = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="border border-gray-400/30">
        <CardContent className="p-4">
          <h4 className="text-sm text-muted-foreground">Total Liquidity</h4>
          <p className="text-2xl font-bold">$2.3M</p>
        </CardContent>
      </Card>
      <Card className="border border-gray-400/30">
        <CardContent className="p-4">
          <h4 className="text-sm text-muted-foreground">24h Change</h4>
          <p className="text-2xl font-bold text-green-400">+5.4%</p>
        </CardContent>
      </Card>
      <Card className="border border-gray-400/30">
        <CardContent className="p-4">
          <h4 className="text-sm text-muted-foreground">Pool Count</h4>
          <p className="text-2xl font-bold">43</p>
        </CardContent>
      </Card>
      <Card className="border border-gray-400/30">
        <CardContent className="p-4">
          <h4 className="text-sm text-muted-foreground">Avg Pool Size</h4>
          <p className="text-2xl font-bold">$53.4K</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default LiquidityTab;
