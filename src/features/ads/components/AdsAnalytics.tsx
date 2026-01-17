import { useState, useMemo } from "react";
import type { NormalizedCampaign } from "@/lib/adapters/meta-adapter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, DollarSign, MousePointerClick, TrendingUp, Target } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
  Legend
} from "recharts";

interface AdsAnalyticsProps {
  data: NormalizedCampaign[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function AdsAnalytics({ data }: AdsAnalyticsProps) {
  const [isOpen, setIsOpen] = useState(true);

  const stats = useMemo(() => {
    const totalSpend = data.reduce((acc, curr) => acc + curr.spend, 0);
    const totalResults = data.reduce((acc, curr) => acc + curr.results, 0);
    const totalClicks = data.reduce((acc, curr) => acc + curr.clicks, 0);
    const totalImpressions = data.reduce((acc, curr) => acc + curr.impressions, 0);
    
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;

    // Detect currency (use the first one found or USD)
    const currency = data.length > 0 ? (data[0].currency || 'USD') : 'USD';

    return { totalSpend, totalResults, avgCTR, avgCPC, currency };
  }, [data]);

  const topCampaigns = useMemo(() => {
    return [...data]
      .sort((a, b) => b.results - a.results)
      .slice(0, 5)
      .map(c => ({ name: c.name, results: c.results }));
  }, [data]);

  const spendByAccount = useMemo(() => {
    const grouped: Record<string, number> = {};
    data.forEach(c => {
      const name = c.account_name || c.account_id;
      grouped[name] = (grouped[name] || 0) + c.spend;
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [data]);

  const spendVsResults = useMemo(() => {
    return [...data]
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 10)
      .map(c => ({ 
        name: c.name, 
        spend: c.spend, 
        results: c.results 
      }));
  }, [data]);

  if (data.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Performance Overview</h3>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {isOpen && (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="p-2 bg-blue-100 rounded-full mr-4">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Spend</p>
                  <h3 className="text-2xl font-bold">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: stats.currency }).format(stats.totalSpend)}
                  </h3>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="p-2 bg-green-100 rounded-full mr-4">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Results</p>
                  <h3 className="text-2xl font-bold">{stats.totalResults.toLocaleString()}</h3>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="p-2 bg-purple-100 rounded-full mr-4">
                  <MousePointerClick className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg CPC</p>
                  <h3 className="text-2xl font-bold">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: stats.currency }).format(stats.avgCPC)}
                  </h3>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="p-2 bg-orange-100 rounded-full mr-4">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg CTR</p>
                  <h3 className="text-2xl font-bold">{stats.avgCTR.toFixed(2)}%</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Campaigns by Results</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCampaigns} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="results" fill="#0088FE" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Spend vs Results */}
            <Card>
              <CardHeader>
                <CardTitle>Spend vs Results (Top 10)</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={spendVsResults}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" hide />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="spend" name="Spend ($)" fill="#8884d8" />
                    <Line yAxisId="right" type="monotone" dataKey="results" name="Results" stroke="#82ca9d" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Spend Distribution */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Spend Distribution by Account</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendByAccount}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {spendByAccount.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
