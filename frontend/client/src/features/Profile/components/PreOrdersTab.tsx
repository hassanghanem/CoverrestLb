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
import { usePreOrders } from "../hooks/usePreOrders";
import { getOrderStatusColor } from "@/utils/getOrderStatusColor";
import { RootState } from "@/lib/store/store";
import { useSelector } from "react-redux";
import { Badge } from "@/components/ui/badge";

const PreOrdersTab: React.FC = () => {
  const [page, setPage] = useState(1);
  const { t, i18n } = useTranslation();
  const selectedCurrency = useSelector((state: RootState) => state.currency.selectedCurrency);

  const { data, isLoading, isError } = usePreOrders({
    page,
    per_page: 5,
  });

  if (isLoading) return <StaticFullPageSpinner />;
  if (isError || !data) return <GeneralError />;

  const pre_orders = data.orders || [];

  return (
    <TabsContent value="pre_orders" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("Pre-order History")}</h2>
      </div>

      <div className="space-y-4">
        {pre_orders.length === 0 ? (
          <p className="text-center text-muted-foreground">
            {t("No Pre-orders found")}
          </p>
        ) : (
          pre_orders.map((pre_order) => (
            <Card key={pre_order.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left Section */}
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                      <Package className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4">
                        <h3 className="font-semibold text-lg">
                          {t("Order")} #{pre_order.order_number || pre_order.id}
                        </h3>
                        <Badge className={getOrderStatusColor(pre_order.status)}>
                          {pre_order.status_info?.name ?? t("Unknown")}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">
                        {t("Placed on")}{" "}
                        {new Date(pre_order.created_at).toLocaleDateString()} •{" "}
                        {pre_order.order_details?.length || 0} {t("items")}
                      </p>

                      {pre_order.notes && (
                        <p className="text-sm text-muted-foreground">
                          {t("Notes")}: {pre_order.notes}
                        </p>
                      )}

                      {pre_order.address && (
                        <p className="text-sm text-muted-foreground">
                          {/* Recipient (only if different from client, optional) */}
                          {pre_order.address.recipient_name && (
                            <>
                              <strong>{pre_order.address.recipient_name}:</strong>{" "}
                            </>
                          )}

                          {/* Address + city */}
                          {[pre_order.address.address, pre_order.address.city]
                            .filter(Boolean)
                            .join(", ")}

                          {/* Notes */}
                          {pre_order.address.notes && (
                            <> • {t("Notes")}: {pre_order.address.notes}</>
                          )}

                          {/* Phone */}
                          {pre_order.address.phone_number && (
                            <> • {t("Phone")}: {pre_order.address.phone_number}</>
                          )}
                        </p>
                      )}

                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold">


                        {formatPrice(
                          Number(pre_order.grand_total) * selectedCurrency.exchange_rate,
                          selectedCurrency.code,
                          i18n.language
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" asChild>
                        <Link to={`/pre_order/${pre_order.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          {t("View Details")}
                        </Link>
                      </Button>

                      {/* Example condition for shipped pre_orders */}
                      {pre_order.status_info?.name?.toLowerCase() ===
                        "shipped" && (
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/track-pre_order?id=${pre_order.id}`}>
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

      {/* Pagination */}
      {data.orders && (
        <PaginationComponent
          pagination={data.pagination}
          onPageChange={(page) => setPage(page)}
        />
      )}
    </TabsContent>
  );
};

export default PreOrdersTab;
