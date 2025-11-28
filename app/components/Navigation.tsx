import { Navigation as PolarisNavigation } from "@shopify/polaris";
import {
  HomeIcon,
  OrderIcon,
  ProductIcon,
  PersonIcon,
  ChartHistogramGrowthIcon,
  ChatIcon,
  SettingsIcon,
} from "@shopify/polaris-icons";

interface NavigationProps {
  shop: string;
}

export default function Navigation({ shop }: NavigationProps) {
  return (
    <PolarisNavigation location="/">
      <PolarisNavigation.Section
        items={[
          {
            label: "Dashboard",
            icon: HomeIcon,
            url: "/app/dashboard",
          },
          {
            label: "Orders",
            icon: OrderIcon,
            url: "/app/orders",
          },
          {
            label: "Products",
            icon: ProductIcon,
            url: "/app/products",
          },
          {
            label: "Customers",
            icon: PersonIcon,
            url: "/app/customers",
          },
          {
            label: "Analytics",
            icon: ChartHistogramGrowthIcon,
            url: "/app/analytics",
          },
          {
            label: "AI Assistant",
            icon: ChatIcon,
            url: "/app/chat",
          },
          {
            label: "Settings",
            icon: SettingsIcon,
            url: "/app/settings",
          },
        ]}
      />
    </PolarisNavigation>
  );
}
