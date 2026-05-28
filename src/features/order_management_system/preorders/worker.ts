// TODO
// On receive_stock:

// Query preorder_allocations FIFO status=confirmed for SKU.
// For each, create real inventory_reservation + commit when order paid.
// Set preorder_status → ready_to_ship, fulfillment_status partial on order.
// Insert movement preorder_fulfill.
