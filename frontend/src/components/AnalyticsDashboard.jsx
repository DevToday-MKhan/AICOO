import { apiFetch } from "../config/api";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { colors, spacing, borderRadius, typography, components } from "../styles/theme";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnalyticsDashboard = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const [memoryRes, eventsRes] = await Promise.all([
        apiFetch("/api/memory"),
        apiFetch("/api/events"),
      ]);

      const memory = await memoryRes.json();
      const events = await eventsRes.json();

      // Process data for charts
      const deliveries = memory.deliveries || [];
      const routes = memory.routes || [];

      // Cost over time (last 10 deliveries)
      const costOverTime = {
        labels: deliveries.slice(-10).map((d, i) => `Order ${i + 1}`),
        datasets: [{
          label: 'Delivery Cost ($)',
          data: deliveries.slice(-10).map(d => d.price),
          borderColor: colors.primary,
          backgroundColor: colors.primaryLight,
          tension: 0.4,
        }]
      };

      // Courier comparison
      const courierCounts = {};
      deliveries.forEach(d => {
        courierCounts[d.service] = (courierCounts[d.service] || 0) + 1;
      });

      const courierComparison = {
        labels: Object.keys(courierCounts),
        datasets: [{
          label: 'Deliveries by Service',
          data: Object.values(courierCounts),
          backgroundColor: [
            colors.primary,
            colors.success,
            colors.warning,
            colors.info,
            colors.purple,
          ],
        }]
      };

      // Routing method distribution
      const routingMethods = {};
      routes.forEach(r => {
        routingMethods[r.bestMethod] = (routingMethods[r.bestMethod] || 0) + 1;
      });

      const routingDistribution = {
        labels: Object.keys(routingMethods).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
        datasets: [{
          data: Object.values(routingMethods),
          backgroundColor: [colors.info, colors.purple],
        }]
      };

      setChartData({
        costOverTime,
        courierComparison,
        routingDistribution,
        totalSavings: memory.analytics.avgDeliveryPrice * memory.analytics.totalDeliveries,
        avgCost: memory.analytics.avgDeliveryPrice,
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{color: colors.textMuted, padding: spacing.xl}}>Loading analytics...</div>;
  }

  if (!chartData) {
    return <div style={{color: colors.textMuted, padding: spacing.xl}}>No analytics data available</div>;
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div>
      {/* Summary Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: spacing.lg,
        marginBottom: spacing.xxl,
      }}>
        <div style={{
          ...components.card,
          backgroundColor: colors.successLight,
          borderColor: colors.success,
          textAlign: "center",
        }}>
          <div style={{fontSize: typography.xxxl, fontWeight: typography.bold, color: colors.success}}>
            ${chartData.totalSavings.toFixed(2)}
          </div>
          <div style={{fontSize: typography.sm, color: colors.textSecondary, marginTop: spacing.sm}}>
            Total Delivery Costs
          </div>
        </div>
        <div style={{
          ...components.card,
          backgroundColor: colors.infoLight,
          borderColor: colors.info,
          textAlign: "center",
        }}>
          <div style={{fontSize: typography.xxxl, fontWeight: typography.bold, color: colors.info}}>
            ${chartData.avgCost}
          </div>
          <div style={{fontSize: typography.sm, color: colors.textSecondary, marginTop: spacing.sm}}>
            Avg Delivery Cost
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        gap: spacing.xl,
      }}>
        {/* Cost Over Time */}
        <div style={{...components.card}}>
          <h4 style={{marginTop: 0, marginBottom: spacing.lg, fontSize: typography.lg}}>
            Delivery Cost Trend
          </h4>
          <Line data={chartData.costOverTime} options={chartOptions} />
        </div>

        {/* Courier Comparison */}
        <div style={{...components.card}}>
          <h4 style={{marginTop: 0, marginBottom: spacing.lg, fontSize: typography.lg}}>
            Service Usage
          </h4>
          <Bar data={chartData.courierComparison} options={chartOptions} />
        </div>

        {/* Routing Distribution */}
        <div style={{...components.card}}>
          <h4 style={{marginTop: 0, marginBottom: spacing.lg, fontSize: typography.lg}}>
            Routing Methods
          </h4>
          <Doughnut data={chartData.routingDistribution} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
