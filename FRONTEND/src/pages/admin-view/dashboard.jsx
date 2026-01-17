import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ShoppingBag, Users, TrendingUp, Package } from "lucide-react";
import { fetchAllProducts } from "@/store/admin/products-slice";
import { getAllOrdersForAdmin } from "@/store/admin/order-slice";

function AdminDashboard() {
  const dispatch = useDispatch();
  const { productList } = useSelector((state) => state.adminProducts);
  const { orderList } = useSelector((state) => state.adminOrder);

  useEffect(() => {
    dispatch(fetchAllProducts());
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  // Calculate real stats
  const totalProducts = productList?.length || 0;
  const totalOrders = orderList?.length || 0;

  // Calculate revenue from confirmed/delivered orders
  const revenue =
    orderList?.reduce((sum, order) => {
      if (
        order.orderStatus === "confirmed" ||
        order.orderStatus === "delivered"
      ) {
        return sum + (order.totalAmount || 0);
      }
      return sum;
    }, 0) || 0;

  // Get unique users from orders
  const uniqueUsers =
    new Set(orderList?.map((order) => order.userId)).size || 0;

  const stats = [
    {
      title: "Total Products",
      value: totalProducts.toString(),
      icon: Package,
      gradient: "from-purple-500 to-blue-500",
      bgGradient: "from-purple-50 to-blue-50",
    },
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      icon: ShoppingBag,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
    },
    {
      title: "Total Users",
      value: uniqueUsers.toString(),
      icon: Users,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
    },
    {
      title: "Revenue",
      value: `$${revenue.toFixed(2)}`,
      icon: TrendingUp,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
    },
  ];

  return (
    <div className="space-y-8 fade-in">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Welcome to your admin dashboard. Manage your store efficiently.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className={`border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${stat.bgGradient} overflow-hidden relative group`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
            {/* Decorative element */}
            <div
              className={`absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full blur-2xl`}
            ></div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
