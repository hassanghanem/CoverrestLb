import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import StaticFullPageSpinner from "@/components/StaticFullPageSpinner";
import GeneralError from "@/features/Errors/GeneralError";
import { useTranslation } from "react-i18next";
import PaginationComponent from "@/components/Pagination";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/utils/formatPrice";
import { Package, Eye, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { useOrders } from "../hooks/useOrders";
import { getOrderStatusColor } from "@/utils/getOrderStatusColor";
import { RootState } from "@/lib/store/store";
import { useSelector } from "react-redux";
import { Badge } from "@/components/ui/badge";

const OrdersTab: React.FC = () => {
  const [page, setPage] = useState(1);
  const { t, i18n } = useTranslation();
  const selectedCurrency = useSelector((state: RootState) => state.currency.selectedCurrency);

  const { data, isLoading, isError } = useOrders({
    page,
    per_page: 5,
  });

  if (isLoading) return <StaticFullPageSpinner />;
  if (isError || !data) return <GeneralError />;

  const orders = data.orders || [];

  return (
    <TabsContent value="orders" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("Order History")}</h2>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <p className="text-center text-muted-foreground">
            {t("No orders found")}
          </p>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                      <Package className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4">
                        <h3 className="font-semibold text-lg">
                          {t("Order")} #{order.order_number || order.id}
                        </h3>
                        <Badge className={getOrderStatusColor(order.status)}>
                          {order.status_info?.name ?? t("Unknown")}
                        </Badge>
                      </div>

                      <p className="text-muted-foreground">
                        {t("Placed on")}{" "}
                        {new Date(order.created_at).toLocaleDateString()} •{" "}
                        {order.order_details?.length || 0} {t("items")}
                      </p>

                      {order.notes && (
                        <p className="text-sm text-muted-foreground">
                          {t("Notes")}: {order.notes}
                        </p>
                      )}

                      {order.address && (
                        <p className="text-sm text-muted-foreground">
                          {/* Recipient (only if different from client, optional) */}
                          {order.address.recipient_name && (
                            <>
                              <strong>{order.address.recipient_name}:</strong>{" "}
                            </>
                          )}

                          {/* Address + city */}
                          {[order.address.address, order.address.city]
                            .filter(Boolean)
                            .join(", ")}

                          {/* Notes */}
                          {order.address.notes && (
                            <> • {t("Notes")}: {order.address.notes}</>
                          )}

                          {/* Phone */}
                          {order.address.phone_number && (
                            <> • {t("Phone")}: {order.address.phone_number}</>
                          )}
                        </p>
                      )}

                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold">

                        {formatPrice(
                          Number(order.grand_total) * selectedCurrency.exchange_rate,
                          selectedCurrency.code,
                          i18n.language
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" asChild>
                        <Link to={`/order/${order.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          {t("View Details")}
                        </Link>
                      </Button>

                      {order.status_info?.name?.toLowerCase() === "shipped" && (
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/track-order?id=${order.id}`}>
                            <Truck className="w-4 h-4 mr-2" />
                            {t("Track Order")}
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {data.orders && (
        <PaginationComponent
          pagination={data.pagination}
          onPageChange={(page) => setPage(page)}
        />
      )}
    </TabsContent>
  );
};

export default OrdersTab;
