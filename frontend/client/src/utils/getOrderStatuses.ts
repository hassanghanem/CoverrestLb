import { Clock, CheckCircle2, Package, Info, Truck, XCircle, RotateCcw } from "lucide-react";

export function getOrderStatuses() {
 return [
        { id: 0, name: 'Pending', description: 'Your order has been placed and is awaiting confirmation.', color: '#ffc107', class: 'warning', icon: Clock },
        { id: 1, name: 'Confirmed', description: 'Your order has been confirmed and will be processed soon.', color: '#007bff', class: 'primary', icon: CheckCircle2 },
        { id: 2, name: 'Processing', description: 'Your items are being prepared for shipment.', color: '#17a2b8', class: 'info', icon: Package },
        { id: 3, name: 'On Hold', description: 'Your order is temporarily on hold. Please contact support if this persists.', color: '#6c757d', class: 'secondary', icon: Info },
        { id: 4, name: 'Shipped', description: 'Your order has been shipped and is on its way.', color: '#6610f2', class: 'primary', icon: Truck },
        { id: 5, name: 'Delivered', description: 'Your order has been successfully delivered.', color: '#28a745', class: 'success', icon: CheckCircle2 },
        { id: 6, name: 'Failed', description: 'The order failed during processing or payment.', color: '#dc3545', class: 'danger', icon: XCircle },
        { id: 7, name: 'Cancelled By Admin', description: 'The order was cancelled by admin.', color: '#dc3545', class: 'danger', icon: XCircle },
        { id: 8, name: 'Cancelled By Customer', description: 'You cancelled this order.', color: '#dc3545', class: 'danger', icon: XCircle },
        { id: 9, name: 'Returned', description: 'The order was returned by the customer.', color: '#17a2b8', class: 'info', icon: RotateCcw },
        { id: 10, name: 'Completed', description: 'The order is fully completed.', color: '#28a745', class: 'success', icon: CheckCircle2 },
    ]
};