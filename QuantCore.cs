using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text.Json;

namespace Luminox.MLT001
{
    public record QuantSignal(
        string Engine,
        string Symbol,
        double EntryPrice,
        double StopLoss,
        double TakeProfit,
        double RiskRewardRatio,
        double RecommendedPositionUnits,
        Dictionary<string, double> FibonacciLevels
    );

    public static class QuantCore
    {
        public static QuantSignal ComputeSignal(
            string symbol,
            double accountBalance,
            double riskPercent,
            double swingLow,
            double swingHigh)
        {
            double range = Math.Abs(swingHigh - swingLow);
            double entry = Math.Round(swingHigh - (range * 0.382), 2);
            double stopLoss = Math.Round(swingLow, 2);
            double takeProfit = Math.Round(swingHigh + (range * 0.618), 2);

            double riskPerUnit = Math.Max(Math.Abs(entry - stopLoss), 0.01);
            double rewardPerUnit = Math.Abs(takeProfit - entry);
            double rrRatio = Math.Round(rewardPerUnit / riskPerUnit, 2);

            double maxRiskCapital = accountBalance * (riskPercent / 100.0);
            double units = Math.Round(maxRiskCapital / riskPerUnit, 4);

            var fibs = new Dictionary<string, double>
            {
                ["0.236"] = Math.Round(swingHigh - range * 0.236, 2),
                ["0.382"] = Math.Round(swingHigh - range * 0.382, 2),
                ["0.500"] = Math.Round(swingHigh - range * 0.500, 2),
                ["0.618"] = Math.Round(swingHigh - range * 0.618, 2),
                ["1.618_EXT"] = Math.Round(swingHigh + range * 0.618, 2)
            };

            return new QuantSignal(
                Engine: "C# .NET 8 // Luminox QuantCore",
                Symbol: symbol,
                EntryPrice: entry,
                StopLoss: stopLoss,
                TakeProfit: takeProfit,
                RiskRewardRatio: rrRatio,
                RecommendedPositionUnits: units,
                FibonacciLevels: fibs
            );
        }

        public static void Main(string[] args)
        {
            CultureInfo.DefaultThreadCurrentCulture = CultureInfo.InvariantCulture;
            var signal = ComputeSignal(
                symbol: "XAUUSD",
                accountBalance: 10000.0,
                riskPercent: 1.5,
                swingLow: 2610.00,
                swingHigh: 2685.00
            );

            var options = new JsonSerializerOptions { WriteIndented = true };
            Console.WriteLine(JsonSerializer.Serialize(signal, options));
        }
    }
}
